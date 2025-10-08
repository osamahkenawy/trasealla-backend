const { User, Role } = require('../models');

/**
 * Check if user has specific permission
 */
exports.hasPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const user = await User.findByPk(req.user.id, {
        include: [{
          model: Role,
          as: 'roleDetails'
        }]
      });

      if (!user || !user.roleDetails) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. No role assigned.'
        });
      }

      // Admin bypass - admins have all permissions
      if (user.roleDetails.name === 'admin' || user.role === 'admin') {
        return next();
      }

      // Check permission in role permissions object
      const permissions = user.roleDetails.permissions || {};
      
      // Navigate through nested permissions
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

      const hasPermission = checkNested(permissions, `${resource}.${action}`);

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Missing permission: ${resource}.${action}`
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking permissions'
      });
    }
  };
};

/**
 * Check if user has any of the specified permissions
 */
exports.hasAnyPermission = (...permissionPaths) => {
  return async (req, res, next) => {
    try {
      const user = await User.findByPk(req.user.id, {
        include: [{
          model: Role,
          as: 'roleDetails'
        }]
      });

      if (!user || !user.roleDetails) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. No role assigned.'
        });
      }

      // Admin bypass
      if (user.roleDetails.name === 'admin' || user.role === 'admin') {
        return next();
      }

      const permissions = user.roleDetails.permissions || {};
      
      // Check if user has any of the specified permissions
      const hasAnyPermission = permissionPaths.some(path => {
        const [resource, action] = path.split('.');
        const checkNested = (obj, pathStr) => {
          const keys = pathStr.split('.');
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
        
        return checkNested(permissions, path);
      });

      if (!hasAnyPermission) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.'
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking permissions'
      });
    }
  };
};

/**
 * Check if user belongs to specific branch
 */
exports.belongsToBranch = (paramName = 'branchId') => {
  return (req, res, next) => {
    const branchId = req.params[paramName] || req.body.branchId;
    
    if (!branchId) {
      return res.status(400).json({
        success: false,
        message: 'Branch ID is required'
      });
    }

    // Admin can access all branches
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user belongs to the branch
    if (req.user.branchId !== parseInt(branchId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own branch.'
      });
    }

    next();
  };
};
