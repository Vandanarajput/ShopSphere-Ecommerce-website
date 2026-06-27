const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { failure } = require('../utils/apiResponse');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(failure('No token provided. Please login.'));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json(failure('User no longer exists.'));
    if (!user.isActive) return res.status(401).json(failure('Account has been deactivated.'));

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json(failure('Session expired. Please login again.'));
    }
    return res.status(401).json(failure('Invalid token. Please login again.'));
  }
}

module.exports = authMiddleware;
