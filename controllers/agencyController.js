const { Agency, Branch, Currency, AuditLog } = require('../models');
const { Op } = require('sequelize');

/**
 * Get agency settings
 */
exports.getAgencySettings = async (req, res) => {
  try {
    const agency = await Agency.findOne({
      where: { isActive: true },
      include: [
        {
          model: Branch,
          as: 'branches',
          where: { isActive: true },
          required: false
        }
      ]
    });

    if (!agency) {
      return res.status(404).json({
        success: false,
        message: 'Agency settings not found'
      });
    }

    // Log access
    await AuditLog.create({
      userId: req.user.id,
      action: 'VIEW',
      entity: 'agency',
      entityId: agency.id,
      metadata: { ip: req.ip, userAgent: req.headers['user-agent'] }
    });

    res.json({
      success: true,
      data: agency
    });
  } catch (error) {
    console.error('Get agency settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching agency settings'
    });
  }
};

/**
 * Update agency settings (Admin only)
 */
exports.updateAgencySettings = async (req, res) => {
  try {
    const agency = await Agency.findOne({
      where: { isActive: true }
    });

    if (!agency) {
      return res.status(404).json({
        success: false,
        message: 'Agency not found'
      });
    }

    const oldValues = agency.toJSON();
    
    const allowedUpdates = [
      'name', 'legalName', 'registrationNumber', 'taxNumber',
      'defaultCurrency', 'supportedCurrencies', 'taxRates',
      'settings', 'contactInfo', 'logo', 'favicon'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    await agency.update(updates);

    // Log the update
    await AuditLog.create({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'agency',
      entityId: agency.id,
      changes: {
        old: oldValues,
        new: agency.toJSON()
      },
      metadata: { ip: req.ip, userAgent: req.headers['user-agent'] }
    });

    res.json({
      success: true,
      message: 'Agency settings updated successfully',
      data: agency
    });
  } catch (error) {
    console.error('Update agency settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating agency settings'
    });
  }
};

/**
 * Get all branches
 */
exports.getBranches = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { code: { [Op.like]: `%${search}%` } },
        { city: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: branches } = await Branch.findAndCountAll({
      where,
      include: [{
        model: Agency,
        as: 'agency',
        attributes: ['id', 'name']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: branches,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get branches error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching branches'
    });
  }
};

/**
 * Get branch by ID
 */
exports.getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findByPk(req.params.id, {
      include: [{
        model: Agency,
        as: 'agency',
        attributes: ['id', 'name']
      }]
    });

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    res.json({
      success: true,
      data: branch
    });
  } catch (error) {
    console.error('Get branch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching branch'
    });
  }
};

/**
 * Create new branch (Admin only)
 */
exports.createBranch = async (req, res) => {
  try {
    const {
      name, code, type, address, city, country,
      phone, email, managerName, managerEmail,
      managerPhone, workingHours, settings
    } = req.body;

    // Check if code already exists
    const existingBranch = await Branch.findOne({ where: { code } });
    if (existingBranch) {
      return res.status(400).json({
        success: false,
        message: 'Branch code already exists'
      });
    }

    // Get agency
    const agency = await Agency.findOne({ where: { isActive: true } });
    if (!agency) {
      return res.status(400).json({
        success: false,
        message: 'No active agency found'
      });
    }

    const branch = await Branch.create({
      agencyId: agency.id,
      name,
      code,
      type,
      address,
      city,
      country,
      phone,
      email,
      managerName,
      managerEmail,
      managerPhone,
      workingHours: workingHours || agency.settings.workingHours,
      settings
    });

    // Log creation
    await AuditLog.create({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'branch',
      entityId: branch.id,
      metadata: { ip: req.ip, userAgent: req.headers['user-agent'] }
    });

    res.status(201).json({
      success: true,
      message: 'Branch created successfully',
      data: branch
    });
  } catch (error) {
    console.error('Create branch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating branch'
    });
  }
};

/**
 * Update branch (Admin only)
 */
exports.updateBranch = async (req, res) => {
  try {
    const branch = await Branch.findByPk(req.params.id);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    const oldValues = branch.toJSON();

    const allowedUpdates = [
      'name', 'type', 'address', 'city', 'country',
      'phone', 'email', 'managerName', 'managerEmail',
      'managerPhone', 'workingHours', 'settings', 'isActive'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    await branch.update(updates);

    // Log update
    await AuditLog.create({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'branch',
      entityId: branch.id,
      changes: {
        old: oldValues,
        new: branch.toJSON()
      },
      metadata: { ip: req.ip, userAgent: req.headers['user-agent'] }
    });

    res.json({
      success: true,
      message: 'Branch updated successfully',
      data: branch
    });
  } catch (error) {
    console.error('Update branch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating branch'
    });
  }
};

/**
 * Delete branch (Admin only)
 */
exports.deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findByPk(req.params.id);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    // Soft delete by setting isActive to false
    await branch.update({ isActive: false });

    // Log deletion
    await AuditLog.create({
      userId: req.user.id,
      action: 'DELETE',
      entity: 'branch',
      entityId: branch.id,
      metadata: { ip: req.ip, userAgent: req.headers['user-agent'] }
    });

    res.json({
      success: true,
      message: 'Branch deleted successfully'
    });
  } catch (error) {
    console.error('Delete branch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting branch'
    });
  }
};

/**
 * Get currencies
 */
exports.getCurrencies = async (req, res) => {
  try {
    const currencies = await Currency.findAll({
      where: { isActive: true },
      order: [['code', 'ASC']]
    });

    res.json({
      success: true,
      data: currencies
    });
  } catch (error) {
    console.error('Get currencies error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching currencies'
    });
  }
};

/**
 * Update currency exchange rates (Admin only)
 */
exports.updateCurrencyRates = async (req, res) => {
  try {
    const { rates } = req.body;

    if (!rates || typeof rates !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid rates format'
      });
    }

    // Update each currency rate
    for (const [code, rate] of Object.entries(rates)) {
      await Currency.update(
        { 
          exchangeRate: rate,
          lastUpdated: new Date()
        },
        { where: { code } }
      );
    }

    // Log update
    await AuditLog.create({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'currency_rates',
      changes: { rates },
      metadata: { ip: req.ip, userAgent: req.headers['user-agent'] }
    });

    res.json({
      success: true,
      message: 'Currency rates updated successfully'
    });
  } catch (error) {
    console.error('Update currency rates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating currency rates'
    });
  }
};
