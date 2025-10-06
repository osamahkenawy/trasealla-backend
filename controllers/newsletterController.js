const { Newsletter } = require('../models');
const { validationResult } = require('express-validator');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
const subscribe = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, name, preferences, source } = req.body;

    // Check if already subscribed
    let subscriber = await Newsletter.findOne({ where: { email } });

    if (subscriber) {
      if (subscriber.isActive) {
        return res.status(400).json({
          success: false,
          message: 'This email is already subscribed to our newsletter'
        });
      } else {
        // Reactivate subscription
        await subscriber.update({
          isActive: true,
          name: name || subscriber.name,
          preferences: preferences || subscriber.preferences,
          unsubscribedAt: null,
          unsubscribeReason: null
        });

        return res.json({
          success: true,
          message: 'Welcome back! Your subscription has been reactivated.'
        });
      }
    }

    // Create new subscription
    subscriber = await Newsletter.create({
      email,
      name,
      preferences: preferences || {},
      subscriptionSource: source || 'website',
      isActive: true
    });

    // TODO: Send welcome email

    res.status(201).json({
      success: true,
      message: 'Thank you for subscribing! You will receive our latest updates.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unsubscribe from newsletter
// @route   POST /api/newsletter/unsubscribe
// @access  Public
const unsubscribe = async (req, res, next) => {
  try {
    const { email, reason } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const subscriber = await Newsletter.findOne({ where: { email } });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in our subscription list'
      });
    }

    if (!subscriber.isActive) {
      return res.json({
        success: true,
        message: 'You are already unsubscribed'
      });
    }

    await subscriber.update({
      isActive: false,
      unsubscribedAt: new Date(),
      unsubscribeReason: reason || null
    });

    res.json({
      success: true,
      message: 'You have been successfully unsubscribed from our newsletter'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all subscribers (admin)
// @route   GET /api/newsletter/subscribers
// @access  Private (Admin)
const getAllSubscribers = async (req, res, next) => {
  try {
    const {
      isActive,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      order = 'DESC'
    } = req.query;

    const where = {};
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const offset = (page - 1) * limit;

    const { count, rows: subscribers } = await Newsletter.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [[sortBy, order]]
    });

    res.json({
      success: true,
      data: {
        subscribers,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get newsletter statistics
// @route   GET /api/newsletter/stats
// @access  Private (Admin)
const getNewsletterStats = async (req, res, next) => {
  try {
    const { Op } = require('sequelize');

    const totalSubscribers = await Newsletter.count();
    const activeSubscribers = await Newsletter.count({ where: { isActive: true } });
    const unsubscribed = await Newsletter.count({ where: { isActive: false } });

    // New subscribers (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newSubscribers = await Newsletter.count({
      where: {
        createdAt: {
          [Op.gte]: thirtyDaysAgo
        },
        isActive: true
      }
    });

    // Subscribers by source
    const bySource = await Newsletter.findAll({
      attributes: [
        'subscriptionSource',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      where: { isActive: true },
      group: ['subscriptionSource']
    });

    res.json({
      success: true,
      data: {
        stats: {
          total: totalSubscribers,
          active: activeSubscribers,
          unsubscribed,
          newThisMonth: newSubscribers
        },
        bySource
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete subscriber
// @route   DELETE /api/newsletter/subscribers/:id
// @access  Private (Admin)
const deleteSubscriber = async (req, res, next) => {
  try {
    const subscriber = await Newsletter.findByPk(req.params.id);

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    await subscriber.destroy();

    res.json({
      success: true,
      message: 'Subscriber deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  subscribe,
  unsubscribe,
  getAllSubscribers,
  getNewsletterStats,
  deleteSubscriber
};
