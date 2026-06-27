const { failure } = require('../utils/apiResponse');

function adminMiddleware(req, res, next) {
  if (!req.user) return res.status(401).json(failure('Not authenticated.'));
  if (req.user.role !== 'admin' && req.user.role !== 'superAdmin') {
    return res.status(403).json(failure('Access denied. Admins only.'));
  }
  next();
}

module.exports = adminMiddleware;
