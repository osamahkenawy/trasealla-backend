const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { Booking, FlightOrder, Payment, User } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get user's bookings
router.get('/', async (req, res) => {
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
});

// Get booking by number
router.get('/:bookingNumber', async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: { bookingNumber: req.params.bookingNumber },
      include: [
        {
          model: FlightOrder,
          as: 'flightOrders'
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
});

// Cancel booking
router.put('/:bookingNumber/cancel', async (req, res) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findOne({
      where: { bookingNumber: req.params.bookingNumber }
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

    await booking.update({
      bookingStatus: 'cancelled',
      cancelledAt: new Date(),
      cancellationReason: reason
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking'
    });
  }
});

module.exports = router;