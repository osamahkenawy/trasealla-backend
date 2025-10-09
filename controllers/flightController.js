const AmadeusFlightProvider = require('../services/providers/AmadeusFlightProvider');
const { Flight, Booking, AuditLog } = require('../models');
const { Op } = require('sequelize');

// Initialize Amadeus provider
const flightProvider = new AmadeusFlightProvider();

/**
 * Search flights via Amadeus
 */
exports.searchFlights = async (req, res) => {
  try {
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      adults = 1,
      children = 0,
      infants = 0,
      travelClass = 'ECONOMY',
      nonStop = false,
      currencyCode = 'USD',
      maxResults = 50
    } = req.query;

    // Validate required fields
    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        success: false,
        message: 'origin, destination, and departureDate are required',
        hint: 'Example: ?origin=JFK&destination=DXB&departureDate=2024-12-15'
      });
    }

    // Search flights using Amadeus
    const flightOffers = await flightProvider.searchFlights({
      originLocationCode: origin.toUpperCase(),
      destinationLocationCode: destination.toUpperCase(),
      departureDate,
      returnDate,
      adults: parseInt(adults),
      children: parseInt(children),
      infants: parseInt(infants),
      travelClass: travelClass.toUpperCase(),
      nonStop: nonStop === 'true',
      currencyCode: currencyCode.toUpperCase(),
      maxResults: parseInt(maxResults)
    });

    // Log search
    if (req.user) {
      await AuditLog.create({
        userId: req.user.id,
        action: 'VIEW',
        entity: 'flight_search',
        metadata: {
          searchParams: { origin, destination, departureDate, returnDate },
          resultsCount: flightOffers.length,
          ip: req.ip
        }
      });
    }

    res.json({
      success: true,
      data: flightOffers,
      meta: {
        searchParams: {
          origin,
          destination,
          departureDate,
          returnDate,
          passengers: { adults, children, infants },
          travelClass
        },
        resultsCount: flightOffers.length,
        provider: 'Amadeus'
      }
    });
  } catch (error) {
    console.error('Flight search error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error searching flights',
      provider: 'Amadeus'
    });
  }
};

/**
 * Get flight offer details
 */
exports.getFlightOffer = async (req, res) => {
  try {
    const { offerId } = req.params;

    const flightOffer = await flightProvider.getFlightOffer(offerId);

    res.json({
      success: true,
      data: flightOffer
    });
  } catch (error) {
    console.error('Get flight offer error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching flight offer'
    });
  }
};

/**
 * Reprice flight offer (confirm current price before booking)
 */
exports.repriceFlightOffer = async (req, res) => {
  try {
    const { flightOffer } = req.body;

    if (!flightOffer) {
      return res.status(400).json({
        success: false,
        message: 'flightOffer is required in request body'
      });
    }

    // Reprice the offer
    const repricedOffer = await flightProvider.repriceFlightOffer(flightOffer);

    res.json({
      success: true,
      data: repricedOffer,
      message: 'Flight repriced successfully. Please verify the price before booking.'
    });
  } catch (error) {
    console.error('Reprice flight error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error repricing flight'
    });
  }
};

/**
 * Create flight order (book flight)
 */
exports.createFlightOrder = async (req, res) => {
  try {
    const { flightOffer, travelers, contacts, remarks } = req.body;

    // Validate required data
    if (!flightOffer || !travelers || !contacts) {
      return res.status(400).json({
        success: false,
        message: 'flightOffer, travelers, and contacts are required'
      });
    }

    // Create order via Amadeus
    const flightOrder = await flightProvider.createFlightOrder({
      flightOffer,
      travelers,
      contacts,
      remarks
    });

    // Save booking in database
    const booking = await Booking.create({
      userId: req.user.id,
      bookingType: 'flight',
      bookingNumber: `FLT-${Date.now()}`,
      status: 'confirmed',
      travelDate: flightOffer.itineraries[0].segments[0].departure.at,
      numberOfPeople: travelers.length,
      totalAmount: parseFloat(flightOffer.price.grandTotal),
      currency: flightOffer.price.currency,
      providerReference: flightOrder.id,
      bookingDetails: {
        provider: 'Amadeus',
        flightOrder,
        travelers,
        contacts
      }
    });

    // Log booking
    await AuditLog.create({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'flight_booking',
      entityId: booking.id,
      metadata: {
        amadeusOrderId: flightOrder.id,
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        ip: req.ip
      }
    });

    res.status(201).json({
      success: true,
      message: 'Flight booked successfully',
      data: {
        booking,
        flightOrder
      }
    });
  } catch (error) {
    console.error('Create flight order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating flight order'
    });
  }
};

/**
 * Get flight order details
 */
exports.getFlightOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const flightOrder = await flightProvider.getFlightOrder(orderId);

    res.json({
      success: true,
      data: flightOrder
    });
  } catch (error) {
    console.error('Get flight order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching flight order'
    });
  }
};

/**
 * Cancel flight order
 */
exports.cancelFlightOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find booking in database
    const booking = await Booking.findOne({
      where: {
        providerReference: orderId,
        bookingType: 'flight'
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking or is admin
    if (booking.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Cancel with Amadeus
    const cancellation = await flightProvider.cancelFlightOrder(orderId);

    // Update booking status
    await booking.update({ status: 'cancelled' });

    // Log cancellation
    await AuditLog.create({
      userId: req.user.id,
      action: 'DELETE',
      entity: 'flight_booking',
      entityId: booking.id,
      metadata: {
        amadeusOrderId: orderId,
        ip: req.ip
      }
    });

    res.json({
      success: true,
      message: 'Flight booking cancelled successfully',
      data: cancellation
    });
  } catch (error) {
    console.error('Cancel flight order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error cancelling flight order'
    });
  }
};

/**
 * Get seat maps for a flight
 */
exports.getSeatMaps = async (req, res) => {
  try {
    const { flightOffer } = req.body;

    if (!flightOffer) {
      return res.status(400).json({
        success: false,
        message: 'flightOffer is required'
      });
    }

    const seatMaps = await flightProvider.getSeatMaps(flightOffer);

    res.json({
      success: true,
      data: seatMaps
    });
  } catch (error) {
    console.error('Get seat maps error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching seat maps'
    });
  }
};

/**
 * Search airport/city locations
 */
exports.searchLocations = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword || keyword.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'keyword is required and must be at least 2 characters'
      });
    }

    const locations = await flightProvider.searchLocations(keyword);

    res.json({
      success: true,
      data: locations,
      count: locations.length
    });
  } catch (error) {
    console.error('Search locations error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error searching locations'
    });
  }
};

/**
 * Get flight price analysis
 */
exports.getFlightPriceAnalysis = async (req, res) => {
  try {
    const { origin, destination, departureDate } = req.query;

    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        success: false,
        message: 'origin, destination, and departureDate are required'
      });
    }

    const priceAnalysis = await flightProvider.getFlightPriceAnalysis(
      origin.toUpperCase(),
      destination.toUpperCase(),
      departureDate
    );

    res.json({
      success: true,
      data: priceAnalysis
    });
  } catch (error) {
    console.error('Flight price analysis error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching price analysis'
    });
  }
};

/**
 * Get user's flight bookings
 */
exports.getUserFlightBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {
      userId: req.user.id,
      bookingType: 'flight'
    };

    if (status) where.status = status;

    const { count, rows: bookings } = await Booking.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: bookings,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get user flight bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching flight bookings'
    });
  }
};
