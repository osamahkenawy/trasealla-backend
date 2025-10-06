const { Contact } = require('../models');
const { validationResult } = require('express-validator');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, phone, subject, message, inquiryType } = req.body;

    // Get user ID if authenticated
    const userId = req.user ? req.user.id : null;

    // Get IP address
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Create contact
    const contact = await Contact.create({
      name,
      email,
      phone,
      subject,
      message,
      inquiryType: inquiryType || 'general',
      userId,
      ipAddress,
      status: 'new',
      priority: 'medium'
    });

    // TODO: Send email notification to admin
    // TODO: Send confirmation email to user

    res.status(201).json({
      success: true,
      message: 'Your message has been submitted successfully. We will get back to you soon!',
      data: {
        contact: {
          id: contact.id,
          name: contact.name,
          email: contact.email,
          subject: contact.subject,
          status: contact.status
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all contacts (admin)
// @route   GET /api/contact
// @access  Private (Admin)
const getAllContacts = async (req, res, next) => {
  try {
    const {
      status,
      inquiryType,
      priority,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'DESC'
    } = req.query;

    const where = {};

    if (status) where.status = status;
    if (inquiryType) where.inquiryType = inquiryType;
    if (priority) where.priority = priority;

    const offset = (page - 1) * limit;

    const { count, rows: contacts } = await Contact.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [[sortBy, order]],
      include: [
        {
          model: require('../models').User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        contacts,
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

// @desc    Get contact by ID
// @route   GET /api/contact/:id
// @access  Private (Admin or Owner)
const getContactById = async (req, res, next) => {
  try {
    const contact = await Contact.findByPk(req.params.id, {
      include: [
        {
          model: require('../models').User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        }
      ]
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Check if user can access this contact
    if (req.user.role !== 'admin' && contact.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this contact'
      });
    }

    res.json({
      success: true,
      data: { contact }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update contact status
// @route   PUT /api/contact/:id/status
// @access  Private (Admin)
const updateContactStatus = async (req, res, next) => {
  try {
    const { status, priority, notes, assignedTo } = req.body;

    const contact = await Contact.findByPk(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (notes) updateData.notes = notes;
    if (assignedTo) updateData.assignedTo = assignedTo;

    await contact.update(updateData);

    res.json({
      success: true,
      message: 'Contact status updated successfully',
      data: { contact }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Respond to contact
// @route   POST /api/contact/:id/respond
// @access  Private (Admin)
const respondToContact = async (req, res, next) => {
  try {
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({
        success: false,
        message: 'Response is required'
      });
    }

    const contact = await Contact.findByPk(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    await contact.update({
      response,
      respondedAt: new Date(),
      respondedBy: req.user.id,
      status: 'resolved'
    });

    // TODO: Send email response to user

    res.json({
      success: true,
      message: 'Response sent successfully',
      data: { contact }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete contact
// @route   DELETE /api/contact/:id
// @access  Private (Admin)
const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    await contact.destroy();

    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get contact statistics (admin)
// @route   GET /api/contact/stats
// @access  Private (Admin)
const getContactStats = async (req, res, next) => {
  try {
    const { Op } = require('sequelize');

    const totalContacts = await Contact.count();
    const newContacts = await Contact.count({ where: { status: 'new' } });
    const inProgressContacts = await Contact.count({ where: { status: 'in_progress' } });
    const resolvedContacts = await Contact.count({ where: { status: 'resolved' } });
    
    // Contacts by inquiry type
    const byInquiryType = await Contact.findAll({
      attributes: [
        'inquiryType',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['inquiryType']
    });

    // Recent contacts (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentContacts = await Contact.count({
      where: {
        createdAt: {
          [Op.gte]: sevenDaysAgo
        }
      }
    });

    res.json({
      success: true,
      data: {
        stats: {
          total: totalContacts,
          new: newContacts,
          inProgress: inProgressContacts,
          resolved: resolvedContacts,
          recent: recentContacts
        },
        byInquiryType
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  respondToContact,
  deleteContact,
  getContactStats
};
