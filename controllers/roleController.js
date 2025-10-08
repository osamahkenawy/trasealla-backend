const { Role, User, AuditLog } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all roles
 */
exports.getRoles = async (req, res) => {
  try {
    const { isActive = true } = req.query;

    const roles = await Role.findAll({
      where: { isActive },
      include: [{
        model: User,
        as: 'users',
        attributes: ['id'],
        required: false
      }],
      order: [['level', 'DESC'], ['name', 'ASC']]
    });

    // Add user count to each role
    const rolesWithCount = roles.map(role => {
      const roleData = role.toJSON();
      roleData.userCount = roleData.users ? roleData.users.length : 0;
      delete roleData.users;
      return roleData;
    });

    res.json({
      success: true,
      data: rolesWithCount
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching roles'
    });
  }
};

/**
 * Get role by ID
 */
exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'users',
        attributes: ['id', 'firstName', 'lastName', 'email'],
        where: { isActive: true },
        required: false
      }]
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    res.json({
      success: true,
      data: role
    });
  } catch (error) {
    console.error('Get role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching role'
    });
  }
};

/**
 * Create new role (Admin only)
 */
exports.createRole = async (req, res) => {
  try {
    const { name, displayName, description, permissions, level } = req.body;

    // Check if role name already exists
    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Role name already exists'
      });
    }

    const role = await Role.create({
      name,
      displayName,
      description,
      permissions,
      level: level || 0,
      isSystem: false
    });

    // Log creation
    await AuditLog.create({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'role',
      entityId: role.id,
      metadata: { ip: req.ip, userAgent: req.headers['user-agent'] }
    });

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: role
    });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating role'
    });
  }
};

/**
 * Update role (Admin only)
 */
exports.updateRole = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Prevent updating system roles
    if (role.isSystem) {
      return res.status(403).json({
        success: false,
        message: 'System roles cannot be modified'
      });
    }

    const oldValues = role.toJSON();

    const allowedUpdates = ['displayName', 'description', 'permissions', 'level', 'isActive'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    await role.update(updates);

    // Log update
    await AuditLog.create({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'role',
      entityId: role.id,
      changes: {
        old: oldValues,
        new: role.toJSON()
      },
      metadata: { ip: req.ip, userAgent: req.headers['user-agent'] }
    });

    res.json({
      success: true,
      message: 'Role updated successfully',
      data: role
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating role'
    });
  }
};

/**
 * Delete role (Admin only)
 */
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Prevent deleting system roles
    if (role.isSystem) {
      return res.status(403).json({
        success: false,
        message: 'System roles cannot be deleted'
      });
    }

    // Check if role has users
    const userCount = await User.count({ where: { roleId: role.id } });
    if (userCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete role. ${userCount} users are assigned to this role.`
      });
    }

    // Soft delete
    await role.update({ isActive: false });

    // Log deletion
    await AuditLog.create({
      userId: req.user.id,
      action: 'DELETE',
      entity: 'role',
      entityId: role.id,
      metadata: { ip: req.ip, userAgent: req.headers['user-agent'] }
    });

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting role'
    });
  }
};

/**
 * Assign role to user (Admin only)
 */
exports.assignRole = async (req, res) => {
  try {
    const { userId, roleId } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const role = await Role.findByPk(roleId);
    if (!role || !role.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Role not found or inactive'
      });
    }

    const oldRoleId = user.roleId;
    await user.update({ roleId });

    // Log role assignment
    await AuditLog.create({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'user_role',
      entityId: userId,
      changes: {
        old: { roleId: oldRoleId },
        new: { roleId }
      },
      metadata: { ip: req.ip, userAgent: req.headers['user-agent'] }
    });

    res.json({
      success: true,
      message: 'Role assigned successfully',
      data: {
        userId,
        roleId,
        roleName: role.name
      }
    });
  } catch (error) {
    console.error('Assign role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning role'
    });
  }
};

/**
 * Check user permissions
 */
exports.checkPermission = async (req, res) => {
  try {
    const { resource, action } = req.params;
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      include: [{
        model: Role,
        as: 'roleDetails'
      }]
    });

    if (!user || !user.roleDetails) {
      return res.json({
        success: true,
        hasPermission: false
      });
    }

    // Navigate through nested permissions
    const permissions = user.roleDetails.permissions;
    let hasPermission = false;

    // Check if permission exists in the structure
    const checkNested = (obj, path) => {
      const keys = path.split('.');
      let current = obj;
      
      for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
          current = current[key];
        } else {
          return false;
        }
      }
      
      return current === true;
    };

    hasPermission = checkNested(permissions, `${resource}.${action}`);

    res.json({
      success: true,
      hasPermission,
      role: user.roleDetails.name,
      level: user.roleDetails.level
    });
  } catch (error) {
    console.error('Check permission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking permission'
    });
  }
};
