const { AuditLog, User, Branch, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Get audit logs with filters
 */
exports.getAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      userId,
      branchId,
      entity,
      action,
      status,
      startDate,
      endDate,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (userId) where.userId = userId;
    if (branchId) where.branchId = branchId;
    if (entity) where.entity = entity;
    if (action) where.action = action;
    if (status) where.status = status;

    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    // Search filter
    if (search) {
      where[Op.or] = [
        { entity: { [Op.like]: `%${search}%` } },
        { action: { [Op.like]: `%${search}%` } },
        { errorMessage: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: logs } = await AuditLog.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Branch,
          as: 'branch',
          attributes: ['id', 'name', 'code']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: logs,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching audit logs'
    });
  }
};

/**
 * Get audit log by ID
 */
exports.getAuditLogById = async (req, res) => {
  try {
    const log = await AuditLog.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Branch,
          as: 'branch',
          attributes: ['id', 'name', 'code']
        }
      ]
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Audit log not found'
      });
    }

    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    console.error('Get audit log error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching audit log'
    });
  }
};

/**
 * Get audit statistics
 */
exports.getAuditStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt[Op.gte] = new Date(startDate);
      if (endDate) dateFilter.createdAt[Op.lte] = new Date(endDate);
    }

    // Get action counts
    const actionCounts = await AuditLog.findAll({
      where: dateFilter,
      attributes: [
        'action',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['action']
    });

    // Get entity counts
    const entityCounts = await AuditLog.findAll({
      where: dateFilter,
      attributes: [
        'entity',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['entity']
    });

    // Get status counts
    const statusCounts = await AuditLog.findAll({
      where: dateFilter,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    // Get most active users
    const activeUsers = await AuditLog.findAll({
      where: dateFilter,
      attributes: [
        'userId',
        [sequelize.fn('COUNT', sequelize.col('AuditLog.id')), 'actionCount']
      ],
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
      group: ['userId', 'user.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('AuditLog.id')), 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        actionCounts,
        entityCounts,
        statusCounts,
        activeUsers
      }
    });
  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching audit statistics'
    });
  }
};

/**
 * Export audit logs (Admin only)
 */
exports.exportAuditLogs = async (req, res) => {
  try {
    const {
      format = 'csv',
      userId,
      branchId,
      entity,
      action,
      startDate,
      endDate
    } = req.query;

    const where = {};
    if (userId) where.userId = userId;
    if (branchId) where.branchId = branchId;
    if (entity) where.entity = entity;
    if (action) where.action = action;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const logs = await AuditLog.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Branch,
          as: 'branch',
          attributes: ['id', 'name', 'code']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    if (format === 'csv') {
      // Generate CSV
      const csv = [
        'ID,Date,User,Branch,Action,Entity,Entity ID,Status,IP Address,User Agent',
        ...logs.map(log => [
          log.id,
          log.createdAt.toISOString(),
          log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System',
          log.branch ? log.branch.name : 'N/A',
          log.action,
          log.entity,
          log.entityId || 'N/A',
          log.status,
          log.metadata?.ip || 'N/A',
          log.metadata?.userAgent || 'N/A'
        ].join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.csv"`);
      return res.send(csv);
    }

    // Default to JSON
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Export audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting audit logs'
    });
  }
};

/**
 * Clean old audit logs (Admin only)
 */
exports.cleanAuditLogs = async (req, res) => {
  try {
    const { days = 90 } = req.body;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const deleted = await AuditLog.destroy({
      where: {
        createdAt: { [Op.lt]: cutoffDate }
      }
    });

    // Log the cleanup action
    await AuditLog.create({
      userId: req.user.id,
      action: 'DELETE',
      entity: 'audit_logs',
      changes: { deletedCount: deleted, cutoffDays: days },
      metadata: { ip: req.ip, userAgent: req.headers['user-agent'] }
    });

    res.json({
      success: true,
      message: `Deleted ${deleted} audit logs older than ${days} days`
    });
  } catch (error) {
    console.error('Clean audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cleaning audit logs'
    });
  }
};
