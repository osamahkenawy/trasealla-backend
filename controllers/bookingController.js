const { Booking, FlightOrder, Traveler, TravelerDocument, FlightSegment, Payment, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all bookings for authenticated user
 * GET /api/bookings
 */
exports.getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;
    const offset = (page - 1) * limit;

    const where = { userId: req.user.id };
    if (status) where.bookingStatus = status;
    if (type) where.bookingType = type;

    const { count, rows: bookings } = await Booking.findAndCountAll({
      where,
      include: [
        {
          model: FlightOrder,
          as: 'flightOrders',
          include: [
            {
              model: FlightSegment,
              as: 'segments'
            }
          ]
        },
        {
          model: Traveler,
          as: 'travelerList',
          include: [
            {
              model: TravelerDocument,
              as: 'documents'
            }
          ]
        },
        {
          model: Payment,
          as: 'payments',
          required: false
        }
      ],
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
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
};

/**
 * Get booking by ID or booking number
 * GET /api/bookings/:id
 */
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: {
        [Op.or]: [
          { id: req.params.id },
          { bookingNumber: req.params.id }
        ]
      },
      include: [
        {
          model: FlightOrder,
          as: 'flightOrders',
          include: [
            {
              model: FlightSegment,
              as: 'segments',
              order: [['segmentNumber', 'ASC']]
            }
          ]
        },
        {
          model: Traveler,
          as: 'travelerList',
          include: [
            {
              model: TravelerDocument,
              as: 'documents'
            }
          ]
        },
        {
          model: Payment,
          as: 'payments'
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (booking.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking'
    });
  }
};

/**
 * Get all travelers for authenticated user
 * GET /api/travelers
 */
exports.getAllTravelers = async (req, res) => {
  try {
    const travelers = await Traveler.findAll({
      include: [
        {
          model: Booking,
          as: 'booking',
          where: { userId: req.user.id },
          attributes: ['id', 'bookingNumber', 'bookingType', 'bookingStatus'],
          required: true
        },
        {
          model: TravelerDocument,
          as: 'documents',
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: travelers,
      count: travelers.length
    });
  } catch (error) {
    console.error('Get travelers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching travelers',
      error: error.message
    });
  }
};

/**
 * Get traveler by ID
 * GET /api/travelers/:id
 */
exports.getTravelerById = async (req, res) => {
  try {
    const traveler = await Traveler.findByPk(req.params.id, {
      include: [
        {
          model: Booking,
          as: 'booking',
          attributes: ['id', 'bookingNumber', 'bookingType', 'bookingStatus']
        },
        {
          model: TravelerDocument,
          as: 'documents'
        }
      ]
    });

    if (!traveler) {
      return res.status(404).json({
        success: false,
        message: 'Traveler not found'
      });
    }

    // Check authorization
    if (traveler.booking.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.json({
      success: true,
      data: traveler
    });
  } catch (error) {
    console.error('Get traveler error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching traveler'
    });
  }
};

/**
 * Get flight segments by booking
 * GET /api/bookings/:bookingId/flights
 */
exports.getBookingFlights = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: {
        [Op.or]: [
          { id: req.params.bookingId },
          { bookingNumber: req.params.bookingId }
        ]
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (booking.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const flightOrders = await FlightOrder.findAll({
      where: { bookingId: booking.id },
      include: [
        {
          model: FlightSegment,
          as: 'segments',
          order: [['segmentNumber', 'ASC']]
        }
      ]
    });

    res.json({
      success: true,
      data: flightOrders
    });
  } catch (error) {
    console.error('Get booking flights error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching flights'
    });
  }
};

/**
 * Get flight segment by ID
 * GET /api/flights/segments/:id
 */
exports.getFlightSegmentById = async (req, res) => {
  try {
    const segment = await FlightSegment.findByPk(req.params.id, {
      include: [
        {
          model: FlightOrder,
          as: 'flightOrder',
          include: [
            {
              model: Booking,
              as: 'booking'
            }
          ]
        }
      ]
    });

    if (!segment) {
      return res.status(404).json({
        success: false,
        message: 'Flight segment not found'
      });
    }

    res.json({
      success: true,
      data: segment
    });
  } catch (error) {
    console.error('Get flight segment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching flight segment'
    });
  }
};
