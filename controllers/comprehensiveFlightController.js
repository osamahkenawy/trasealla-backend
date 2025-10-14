const FlightProviderFactory = require('../services/FlightProviderFactory');
const { FlightOrder, Booking, User, AuditLog, Traveler, TravelerDocument, FlightSegment, sequelize } = require('../models');
const { saveTravelersToDb, saveFlightSegmentsToDb } = require('../utils/saveTravelersToDb');
const { Op } = require('sequelize');

// Get flight provider (Amadeus or Duffel based on config)
const getFlightProvider = (req) => {
  const providerName = req.query.provider || req.body.provider || process.env.DEFAULT_FLIGHT_PROVIDER || 'duffel';
  return FlightProviderFactory.getProvider(providerName);
};

/**
 * STEP 1: Search Flights (Shopping)
 * GET /api/flights/search
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

    // Validation
    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        success: false,
        message: 'origin, destination, and departureDate are required',
        example: '?origin=JFK&destination=DXB&departureDate=2025-12-15&adults=2'
      });
    }

    // Get flight provider
    const flightProvider = getFlightProvider(req);
    console.log(`Using provider: ${flightProvider.providerName}`);

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

    // Log search with provider info
    if (req.user) {
      await AuditLog.create({
        userId: req.user.id,
        action: 'VIEW',
        entity: 'flight_search',
        metadata: {
          searchParams: { origin, destination, departureDate },
          resultsCount: flightOffers.length,
          ip: req.ip
        }
      });
    }

    res.json({
      success: true,
      data: flightOffers,
      meta: {
        searchParams: req.query,
        resultsCount: flightOffers.length,
        provider: 'Amadeus'
      }
    });
  } catch (error) {
    console.error('Flight search error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error searching flights'
    });
  }
};

/**
 * STEP 2: Confirm Pricing (Flight Offers Price)
 * POST /api/flights/confirm-price
 */
exports.confirmFlightPrice = async (req, res) => {
  try {
    let { flightOffer } = req.body;

    if (!flightOffer) {
      return res.status(400).json({
        success: false,
        message: 'flightOffer is required (from search results)',
        hint: 'Send the raw Amadeus offer object from search results'
      });
    }

    // Accept both transformed format (with .raw) or direct format
    // If the offer has a 'raw' field (our transformed format), use that
    const originalOffer = flightOffer;
    if (flightOffer.raw) {
      flightOffer = flightOffer.raw;
    }

    // Validate it's a valid offer (Amadeus or Duffel)
    const isAmadeusOffer = flightOffer.type === 'flight-offer' && flightOffer.source === 'GDS';
    const isDuffelOffer = flightOffer.id && flightOffer.id.startsWith('off_');
    
    if (!isAmadeusOffer && !isDuffelOffer) {
      return res.status(400).json({
        success: false,
        message: 'Invalid flight offer format',
        hint: 'Send the complete offer object from search results (Amadeus or Duffel)'
      });
    }

    // Determine provider from offer
    const providerName = isDuffelOffer ? 'duffel' : 'amadeus';
    const flightProvider = FlightProviderFactory.getProvider(providerName);
    
    console.log(`Confirming price with ${flightProvider.providerName}`);
    
    // Reprice/validate the offer
    const confirmedOffer = await flightProvider.repriceFlightOffer(flightOffer);

    res.json({
      success: true,
      data: confirmedOffer,
      message: 'Price confirmed. Ready to book.'
    });
  } catch (error) {
    console.error('Confirm price error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error confirming flight price'
    });
  }
};

/**
 * STEP 3: Create Flight Order (Booking)
 * POST /api/flights/create-order
 */
exports.createFlightOrder = async (req, res) => {
  try {
    let { flightOffer, travelers, contacts, remarks, ancillaryServices } = req.body;

    // Validation
    if (!flightOffer || !travelers || !contacts) {
      return res.status(400).json({
        success: false,
        message: 'flightOffer, travelers, and contacts are required'
      });
    }

    // Check for duplicate booking (idempotency)
    const offerId = flightOffer.id || flightOffer.raw?.id;
    const existingOrder = await FlightOrder.findOne({
      where: {
        userId: req.user.id,
        flightOfferData: {
          [Op.like]: `%${offerId}%`
        },
        status: { [Op.notIn]: ['cancelled', 'failed'] }
      }
    });

    if (existingOrder) {
      console.log(`⚠️ Duplicate booking attempt detected for offer ${offerId}`);
      
      // Return existing booking instead of error
      const booking = await Booking.findByPk(existingOrder.bookingId, {
        include: [
          {
            model: FlightOrder,
            as: 'flightOrders'
          }
        ]
      });

      return res.status(200).json({
        success: true,
        message: 'This flight was already booked. Returning existing booking.',
        duplicate: true,
        data: {
          order: existingOrder,
          booking
        }
      });
    }

    // Accept both transformed format or direct format
    if (flightOffer.raw) {
      flightOffer = flightOffer.raw;
    }

    // Validate it's a valid offer (Amadeus or Duffel)
    const isAmadeusOffer = flightOffer.type === 'flight-offer' && flightOffer.source === 'GDS';
    const isDuffelOffer = flightOffer.id && flightOffer.id.startsWith('off_');
    
    if (!isAmadeusOffer && !isDuffelOffer) {
      return res.status(400).json({
        success: false,
        message: 'Invalid flight offer format',
        hint: 'Send the complete offer object from search results or confirm-price endpoint'
      });
    }

    // Check if Duffel offer has expired
    if (isDuffelOffer && flightOffer.expires_at) {
      const expiryDate = new Date(flightOffer.expires_at);
      const now = new Date();
      
      if (expiryDate < now) {
        return res.status(400).json({
          success: false,
          message: 'Flight offer has expired',
          expired: true,
          expiresAt: flightOffer.expires_at,
          hint: 'Please search for flights again to get a fresh offer'
        });
      }
    }

    // Validate travelers
    const validationErrors = validateTravelers(travelers);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Traveler validation failed',
        errors: validationErrors
      });
    }

    // Determine provider and create order
    const providerName = isDuffelOffer ? 'duffel' : 'amadeus';
    const flightProvider = FlightProviderFactory.getProvider(providerName);
    
    console.log(`Creating order with ${flightProvider.providerName}`);
    
    // Set timeout for provider call (30 seconds)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Booking request timed out. Order may have been created. Check your bookings.')), 30000)
    );
    
    const bookingPromise = flightProvider.createFlightOrder({
      flightOffer,
      travelers,
      contacts,
      remarks
    });
    
    let amadeusOrder;
    try {
      amadeusOrder = await Promise.race([bookingPromise, timeoutPromise]);
    } catch (error) {
      if (error.message.includes('timed out')) {
        // Timeout - order might be created on provider side
        console.error('⚠️ Booking timeout - order may have been created');
        
        return res.status(202).json({
          success: false,
          message: 'Booking request timed out. Please check your bookings in a few minutes.',
          timeout: true,
          action: 'Check /api/flights/my-orders in 1-2 minutes'
        });
      }
      throw error;
    }

    // Calculate pricing (handle both Amadeus and Duffel formats)
    const totalAmount = flightOffer.price?.grandTotal 
      ? parseFloat(flightOffer.price.grandTotal)
      : parseFloat(flightOffer.total_amount || 0);
    
    const baseAmount = flightOffer.price?.base
      ? parseFloat(flightOffer.price.base)
      : parseFloat(flightOffer.base_amount || totalAmount * 0.85);
    
    const taxAmount = totalAmount - baseAmount;

    // Extract contact name from first traveler
    const contactName = contacts.name || `${travelers[0].firstName} ${travelers[0].lastName}`;
    
    // Get travel date (handle both formats)
    const travelDate = flightOffer.itineraries?.[0]?.segments?.[0]?.departure?.at
      || flightOffer.slices?.[0]?.segments?.[0]?.departing_at
      || new Date();
    
    // Get currency (handle both formats)
    const currency = flightOffer.price?.currency || flightOffer.total_currency || 'USD';
    
    // Create booking record
    const booking = await Booking.create({
      userId: req.user.id,
      bookingType: 'flight',
      referenceId: 0, // For flights, we use FlightOrder ID, set to 0 initially
      bookingNumber: `BKG-FLT-${Date.now()}`,
      bookingStatus: 'confirmed',
      travelDate,
      numberOfPeople: travelers.length,
      totalAmount,
      currency,
      contactName,
      contactEmail: contacts.email,
      contactPhone: contacts.phone,
      travelers,
      confirmedAt: new Date(),
      notes: remarks || null
    });

    // Create detailed flight order record
    const flightOrder = await FlightOrder.create({
      orderNumber: `ORD-FLT-${Date.now()}`,
      userId: req.user.id,
      bookingId: booking.id,
      amadeusOrderId: amadeusOrder.id,
      pnr: amadeusOrder.bookingReference || amadeusOrder.associatedRecords?.[0]?.reference || `TMP${Date.now()}`,
      gdsRecordLocator: amadeusOrder.bookingReference || amadeusOrder.associatedRecords?.[0]?.reference,
      status: 'confirmed',
      ticketingStatus: 'not_issued',
      flightOfferData: flightOffer,
      itineraries: flightOffer.itineraries || flightOffer.slices || [],
      totalAmount,
      baseAmount,
      taxAmount,
      currency,
      travelers,
      numberOfTravelers: travelers.length,
      contactEmail: contacts.email,
      contactPhone: contacts.phone,
      validatingAirline: flightOffer.validatingAirlineCodes?.[0] || flightOffer.owner?.iata_code,
      operatingAirlines: extractOperatingAirlines(flightOffer),
      ancillaryServices: ancillaryServices || {},
      bookingChannel: req.user.role === 'agent' ? 'agent' : 'web',
      agentId: req.user.role === 'agent' ? req.user.id : null
    });

    // Update booking referenceId to point to flight order
    await booking.update({ referenceId: flightOrder.id });

    // Save travelers to normalized tables
    const savedTravelers = await saveTravelersToDb(booking.id, travelers);
    console.log(`✅ Saved ${savedTravelers.length} travelers to database`);

    // Save flight segments to normalized table
    const savedSegments = await saveFlightSegmentsToDb(flightOrder.id, flightOffer);
    console.log(`✅ Saved ${savedSegments.length} flight segments to database`);

    // Log order creation
    await AuditLog.create({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'flight_order',
      entityId: flightOrder.id,
      metadata: {
        amadeusOrderId: amadeusOrder.id,
        pnr: flightOrder.pnr,
        totalAmount,
        currency: flightOrder.currency,
        travelers: travelers.length,
        ip: req.ip
      }
    });

    res.status(201).json({
      success: true,
      message: 'Flight order created successfully',
      data: {
        order: flightOrder,
        booking,
        amadeusOrder,
        nextSteps: {
          step: 'ticketing',
          message: 'Order confirmed. Proceed to ticketing.',
          ticketingDeadline: amadeusOrder.ticketingAgreement?.deadline
        }
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
 * STEP 4: Get Flight Order Details
 * GET /api/flights/orders/:orderId
 */
exports.getFlightOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const flightOrder = await FlightOrder.findOne({
      where: {
        [Op.or]: [
          { orderNumber: orderId },
          { amadeusOrderId: orderId },
          { id: orderId }
        ]
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: Booking,
          as: 'booking',
          attributes: ['id', 'bookingNumber', 'status', 'totalAmount']
        },
        {
          model: User,
          as: 'agent',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!flightOrder) {
      return res.status(404).json({
        success: false,
        message: 'Flight order not found'
      });
    }

    // Check authorization
    if (flightOrder.userId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'agent') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    // Get live status from Amadeus if needed
    let amadeusOrderData = null;
    if (flightOrder.amadeusOrderId) {
      try {
        amadeusOrderData = await flightProvider.getFlightOrder(flightOrder.amadeusOrderId);
      } catch (err) {
        console.log('Could not fetch live Amadeus order:', err.message);
      }
    }

    res.json({
      success: true,
      data: {
        order: flightOrder,
        liveAmadeusData: amadeusOrderData
      }
    });
  } catch (error) {
    console.error('Get flight order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching flight order'
    });
  }
};

/**
 * STEP 5: Get Branded Fares (Upsell Options)
 * POST /api/flights/branded-fares
 */
exports.getBrandedFares = async (req, res) => {
  try {
    const { flightOffer } = req.body;

    if (!flightOffer) {
      return res.status(400).json({
        success: false,
        message: 'flightOffer is required'
      });
    }

    // Note: Amadeus Self-Service API may not have branded fares upsell
    // This would typically require Enterprise API
    // For now, return the offer with available fare types

    res.json({
      success: true,
      data: {
        baseFare: flightOffer,
        message: 'Branded fares upsell available in Enterprise API',
        availableFareTypes: flightOffer.travelerPricings?.map(tp => tp.fareOption)
      }
    });
  } catch (error) {
    console.error('Get branded fares error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching branded fares'
    });
  }
};

/**
 * STEP 6: Get Seat Maps
 * POST /api/flights/seat-maps
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

    const flightProvider = getFlightProvider(req);
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
 * STEP 7: Cancel/Delete Flight Order
 * DELETE /api/flights/orders/:orderId
 */
exports.cancelFlightOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const flightOrder = await FlightOrder.findOne({
      where: {
        [Op.or]: [
          { orderNumber: orderId },
          { amadeusOrderId: orderId },
          { id: orderId }
        ]
      }
    });

    if (!flightOrder) {
      return res.status(404).json({
        success: false,
        message: 'Flight order not found'
      });
    }

    // Check authorization
    if (flightOrder.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Check if already cancelled
    if (flightOrder.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled'
      });
    }

    // Get provider and cancel order
    const flightProvider = getFlightProvider(req);
    const cancellation = await flightProvider.cancelFlightOrder(flightOrder.amadeusOrderId);

    // Update order status
    await flightOrder.update({
      status: 'cancelled',
      cancelledAt: new Date()
    });

    // Update booking
    if (flightOrder.bookingId) {
      await Booking.update(
        { status: 'cancelled' },
        { where: { id: flightOrder.bookingId } }
      );
    }

    // Log cancellation
    await AuditLog.create({
      userId: req.user.id,
      action: 'DELETE',
      entity: 'flight_order',
      entityId: flightOrder.id,
      metadata: {
        amadeusOrderId: flightOrder.amadeusOrderId,
        pnr: flightOrder.pnr,
        refundAmount: flightOrder.totalAmount,
        ip: req.ip
      }
    });

    res.json({
      success: true,
      message: 'Flight order cancelled successfully',
      data: {
        orderId: flightOrder.id,
        orderNumber: flightOrder.orderNumber,
        pnr: flightOrder.pnr,
        status: 'cancelled',
        cancellation
      }
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
 * Get all flight orders for a user
 * GET /api/flights/my-orders
 */
exports.getMyFlightOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, ticketingStatus } = req.query;
    const offset = (page - 1) * limit;

    const where = { userId: req.user.id };
    if (status) where.status = status;
    if (ticketingStatus) where.ticketingStatus = ticketingStatus;

    const { count, rows: orders } = await FlightOrder.findAndCountAll({
      where,
      include: [
        {
          model: Booking,
          as: 'booking',
          attributes: ['id', 'bookingNumber', 'bookingStatus', 'paymentStatus']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: orders,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get my flight orders error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error fetching flight orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all flight orders (Admin/Agent)
 * GET /api/flights/orders
 */
exports.getAllFlightOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      ticketingStatus,
      userId,
      startDate,
      endDate,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (status) where.status = status;
    if (ticketingStatus) where.ticketingStatus = ticketingStatus;
    if (userId) where.userId = userId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    if (search) {
      where[Op.or] = [
        { orderNumber: { [Op.like]: `%${search}%` } },
        { pnr: { [Op.like]: `%${search}%` } },
        { amadeusOrderId: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: orders } = await FlightOrder.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Booking,
          as: 'booking',
          attributes: ['id', 'bookingNumber', 'bookingStatus', 'paymentStatus']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: orders,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get all flight orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching flight orders'
    });
  }
};

/**
 * Get flight order statistics
 * GET /api/flights/stats
 */
exports.getFlightOrderStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt[Op.gte] = new Date(startDate);
      if (endDate) dateFilter.createdAt[Op.lte] = new Date(endDate);
    }

    const totalOrders = await FlightOrder.count({ where: dateFilter });
    const confirmedOrders = await FlightOrder.count({ 
      where: { ...dateFilter, status: 'confirmed' } 
    });
    const ticketedOrders = await FlightOrder.count({ 
      where: { ...dateFilter, ticketingStatus: 'issued' } 
    });
    const cancelledOrders = await FlightOrder.count({ 
      where: { ...dateFilter, status: 'cancelled' } 
    });

    const totalRevenue = await FlightOrder.sum('totalAmount', {
      where: { ...dateFilter, status: { [Op.notIn]: ['cancelled', 'failed'] } }
    }) || 0;

    // Orders by status
    const ordersByStatus = await FlightOrder.findAll({
      where: dateFilter,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue']
      ],
      group: ['status']
    });

    // Orders by airline
    const ordersByAirline = await FlightOrder.findAll({
      where: dateFilter,
      attributes: [
        'validating_airline',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['validating_airline'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalOrders,
          confirmedOrders,
          ticketedOrders,
          cancelledOrders,
          totalRevenue
        },
        distribution: {
          byStatus: ordersByStatus,
          byAirline: ordersByAirline
        }
      }
    });
  } catch (error) {
    console.error('Get flight stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching flight statistics'
    });
  }
};

/**
 * Search airport/city locations (autocomplete)
 * GET /api/flights/locations
 */
exports.searchLocations = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword || keyword.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'keyword must be at least 2 characters'
      });
    }

    const flightProvider = getFlightProvider(req);
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
 * GET /api/flights/price-analysis
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

    const flightProvider = getFlightProvider(req);
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
    console.error('Price analysis error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching price analysis'
    });
  }
};

// Helper functions
function validateTravelers(travelers) {
  const errors = [];

  travelers.forEach((traveler, index) => {
    if (!traveler.firstName || !traveler.lastName) {
      errors.push(`Traveler ${index + 1}: firstName and lastName are required`);
    }
    if (!traveler.dateOfBirth) {
      errors.push(`Traveler ${index + 1}: dateOfBirth is required (YYYY-MM-DD)`);
    }
    if (!traveler.gender || !['MALE', 'FEMALE'].includes(traveler.gender)) {
      errors.push(`Traveler ${index + 1}: gender must be MALE or FEMALE`);
    }
    if (!traveler.documents || traveler.documents.length === 0) {
      errors.push(`Traveler ${index + 1}: at least one document (passport) is required`);
    }
  });

  return errors;
}

function extractOperatingAirlines(flightOffer) {
  const airlines = new Set();
  
  // Handle Amadeus format (itineraries)
  flightOffer.itineraries?.forEach(itinerary => {
    itinerary.segments?.forEach(segment => {
      if (segment.carrierCode) airlines.add(segment.carrierCode);
      if (segment.operating?.carrierCode) airlines.add(segment.operating.carrierCode);
    });
  });
  
  // Handle Duffel format (slices)
  flightOffer.slices?.forEach(slice => {
    slice.segments?.forEach(segment => {
      if (segment.marketing_carrier?.iata_code) airlines.add(segment.marketing_carrier.iata_code);
      if (segment.operating_carrier?.iata_code) airlines.add(segment.operating_carrier.iata_code);
    });
  });

  return Array.from(airlines);
}

module.exports.validateTravelers = validateTravelers;
module.exports.extractOperatingAirlines = extractOperatingAirlines;
