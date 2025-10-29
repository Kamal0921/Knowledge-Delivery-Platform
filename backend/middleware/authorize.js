// backend/middleware/authorize.js

/**
 * @desc Middleware to authorize users based on roles
 * @param {string[]} allowedRoles - Array of roles allowed to access the route
 */
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Access denied. User role not found.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden. You do not have permission to perform this action.' });
    }

    next();
  };
};

module.exports = authorize;