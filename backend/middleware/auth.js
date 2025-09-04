// backend/middleware/auth.js - ENHANCED VERSION
module.exports = (req, res, next) => {
    console.log('Auth middleware - Session user:', req.session.user);
    
    if (!req.session.user) {
      return res.status(401).json({ 
        msg: 'Access denied. Please log in.',
        requiresAuth: true 
      });
    }
    
    // Add user to request object for easy access
    req.user = req.session.user;
    next();
  };
  
  // Create role-specific middleware
  module.exports.requireRole = (role) => {
    return (req, res, next) => {
      if (!req.session.user) {
        return res.status(401).json({ 
          msg: 'Access denied. Please log in.',
          requiresAuth: true 
        });
      }
      
      if (req.session.user.role !== role) {
        return res.status(403).json({ 
          msg: `Access denied. ${role} role required.`,
          userRole: req.session.user.role,
          requiredRole: role
        });
      }
      
      req.user = req.session.user;
      next();
    };
  };