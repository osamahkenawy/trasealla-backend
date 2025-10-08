const { User, Role, Branch, Booking, Payment, AuditLog, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all users (Admin only)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      isActive,
      search,
      branchId,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (branchId) where.branchId = branchId;

    // Search filter
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password', 'passwordResetToken', 'emailVerificationToken'] },
      include: [
        {
          model: Role,
          as: 'roleDetails',
          attributes: ['id', 'name', 'displayName']
        },
        {
          model: Branch,
          as: 'branch',
          attributes: ['id', 'name', 'code']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]]
    });

    res.json({
      success: true,
      data: users,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

/**
 * Get user by ID (Admin only)
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password', 'passwordResetToken', 'emailVerificationToken'] },
      include: [
        {
          model: Role,
          as: 'roleDetails',
          attributes: ['id', 'name', 'displayName', 'permissions', 'level']
        },
        {
          model: Branch,
          as: 'branch',
          attributes: ['id', 'name', 'code', 'city', 'country']
        },
        {
          model: Booking,
          as: 'bookings',
          attributes: ['id', 'bookingNumber', 'status', 'totalAmount'],
          limit: 5,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user statistics
    const stats = await getUserStats(user.id);

    res.json({
      success: true,
      data: {
        ...user.toJSON(),
        statistics: stats
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user'
    });
  }
};

/**
 * Update user status (Admin only)
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deactivating themselves
    if (req.user.id === user.id && isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    const oldStatus = user.isActive;
    await user.update({ isActive });

    // Log status change
    await AuditLog.create({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'user_status',
      entityId: user.id,
      changes: {
        old: { isActive: oldStatus },
        new: { isActive }
      },
      metadata: { ip: req.ip, userAgent: req.headers['user-agent'] }
    });

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: user.id,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status'
    });
  }
};

/**
 * Update user details (Admin only)
 */
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const oldValues = user.toJSON();

    const allowedUpdates = [
      'firstName', 'lastName', 'phone', 'dateOfBirth',
      'gender', 'nationality', 'address', 'city',
      'country', 'postalCode', 'branchId', 'roleId'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    await user.update(updates);

    // Log update
    await AuditLog.create({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'user',
      entityId: user.id,
      changes: {
        old: oldValues,
        new: user.toJSON()
      },
      metadata: { ip: req.ip, userAgent: req.headers['user-agent'] }
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user'
    });
  }
};

/**
 * Delete user (Admin only)
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (req.user.id === user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Soft delete by deactivating
    await user.update({ isActive: false });

    // Log deletion
    await AuditLog.create({
      userId: req.user.id,
      action: 'DELETE',
      entity: 'user',
      entityId: user.id,
      metadata: { ip: req.ip, userAgent: req.headers['user-agent'] }
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
};

/**
 * Get user statistics (Admin only)
 */
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.params.id;

    const stats = await getUserStats(userId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics'
    });
  }
};

/**
 * Get user activity history (Admin only)
 */
exports.getUserActivity = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: activities } = await AuditLog.findAndCountAll({
      where: { userId: req.params.id },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: activities,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user activity'
    });
  }
};

/**
 * Assign user to branch (Admin only)
 */
exports.assignToBranch = async (req, res) => {
  try {
    const { branchId } = req.body;

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const branch = await Branch.findByPk(branchId);
    if (!branch || !branch.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found or inactive'
      });
    }

    const oldBranchId = user.branchId;
    await user.update({ branchId });

    // Log assignment
    await AuditLog.create({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'user_branch',
      entityId: user.id,
      changes: {
        old: { branchId: oldBranchId },
        new: { branchId }
      },
      metadata: { ip: req.ip, userAgent: req.headers['user-agent'] }
    });

    res.json({
      success: true,
      message: 'User assigned to branch successfully',
      data: {
        userId: user.id,
        branchId,
        branchName: branch.name
      }
    });
  } catch (error) {
    console.error('Assign to branch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning user to branch'
    });
  }
};

/**
 * Get dashboard statistics (Admin only)
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Total users by role
    const usersByRole = await User.findAll({
      attributes: [
        'role',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['role']
    });

    // Active vs inactive users
    const usersByStatus = await User.findAll({
      attributes: [
        'isActive',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['isActive']
    });

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await User.count({
      where: {
        createdAt: { [Op.gte]: thirtyDaysAgo }
      }
    });

    // Users by branch
    const usersByBranch = await User.findAll({
      attributes: [
        'branchId',
        [sequelize.fn('COUNT', sequelize.col('User.id')), 'count']
      ],
      include: [{
        model: Branch,
        as: 'branch',
        attributes: ['name', 'code']
      }],
      group: ['branchId', 'branch.id'],
      where: {
        branchId: { [Op.not]: null }
      }
    });

    res.json({
      success: true,
      data: {
        usersByRole,
        usersByStatus,
        recentRegistrations: recentUsers,
        usersByBranch,
        totalUsers: await User.count()
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
};

// Helper function to get user statistics
async function getUserStats(userId) {
  const totalBookings = await Booking.count({ where: { userId } });
  const completedBookings = await Booking.count({ 
    where: { userId, status: 'completed' } 
  });
  const cancelledBookings = await Booking.count({ 
    where: { userId, status: 'cancelled' } 
  });
  
  const totalSpent = await Payment.sum('amount', {
    where: { 
      userId,
      status: 'completed'
    }
  }) || 0;

  const lastBooking = await Booking.findOne({
    where: { userId },
    order: [['createdAt', 'DESC']],
    attributes: ['id', 'bookingNumber', 'createdAt', 'totalAmount']
  });

  return {
    totalBookings,
    completedBookings,
    cancelledBookings,
    totalSpent,
    lastBooking
  };
}

module.exports.getUserStats = getUserStats;
