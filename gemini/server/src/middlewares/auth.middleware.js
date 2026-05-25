// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const Token = require('../models/Token.model');
const User = require('../models/User.model');
const { hashToken } = require('../utils/token.utils');

/**
 * Middleware to protect routes.
 * Verifies the access token, then checks that a matching token document exists (optional revocation).
 * Attaches the user object to req.user.
 */
async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers['x-access-token'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    // Optional DB check – ensure token hasn't been revoked (e.g., logout).
    const tokenHash = hashToken(token);
    const tokenDoc = await Token.findOne({ token: tokenHash, userId: decoded.id, type: 'access' });
    if (!tokenDoc) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

module.exports = protect;
