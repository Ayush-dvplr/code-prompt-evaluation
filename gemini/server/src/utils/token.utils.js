// src/utils/token.utils.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Token = require('../models/Token.model');

// Generate JWT access token
function generateAccessToken(payload) {
  const secret = process.env.JWT_ACCESS_SECRET;
  const expiresIn = process.env.JWT_ACCESS_EXPIRES || '1d';
  return jwt.sign(payload, secret, { expiresIn });
}

// Generate JWT refresh token and store hashed version in DB
async function generateRefreshToken(userId) {
  const secret = process.env.JWT_REFRESH_SECRET;
  const expiresIn = process.env.JWT_REFRESH_EXPIRES || '7d';
  const rawToken = jwt.sign({ sub: userId }, secret, { expiresIn });
  const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');
  // Store token in DB for revocation support
  await Token.create({
    token: hashed,
    userId,
    type: 'refresh',
    expiresAt: new Date(Date.now() + parseDuration(expiresIn)),
  });
  return rawToken;
}

// Helper to parse duration strings like '1d', '7d'
function parseDuration(str) {
  const num = parseInt(str.slice(0, -1), 10);
  const unit = str.slice(-1);
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return num * (multipliers[unit] || 0);
}

// Verify token (access or refresh). Returns payload if valid.
function verifyToken(token, type = 'access') {
  const secret = type === 'access' ? process.env.JWT_ACCESS_SECRET : process.env.JWT_REFRESH_SECRET;
  return jwt.verify(token, secret);
}

// Hash token for DB comparison (used for refresh tokens)
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  hashToken,
};
