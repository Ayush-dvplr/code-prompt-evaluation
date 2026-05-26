// generateTokens.js — create, store, and rotate JWT access + refresh tokens
const jwt = require('jsonwebtoken');
const Token = require('../models/Token.model');
const { hashToken } = require('./hashToken');

// Parse '1d', '7d', '1h' strings into milliseconds
function parseDurationMs(str) {
  const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  const num = parseInt(str, 10);
  const unit = str.slice(-1);
  return num * (units[unit] || 0);
}

// Short-lived access token — NOT stored in DB, verified by signature only
function generateAccessToken(userId) {
  return jwt.sign(
    { sub: userId.toString() },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '1d' }
  );
}

// Long-lived refresh token — hashed with SHA256 and stored in DB for revocation support
async function generateRefreshToken(userId) {
  const expiresIn = process.env.JWT_REFRESH_EXPIRES || '7d';
  const raw = jwt.sign(
    { sub: userId.toString() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn }
  );
  const hashed = hashToken(raw);
  const expiresAt = new Date(Date.now() + parseDurationMs(expiresIn));

  // One session per user — remove old refresh tokens before creating new one
  await Token.deleteMany({ userId, type: 'refresh' });
  await Token.create({ token: hashed, userId, type: 'refresh', expiresAt });

  return raw; // return raw token to send to client
}

// Generate both tokens at once
async function generateTokenPair(userId) {
  const accessToken = generateAccessToken(userId);
  const refreshToken = await generateRefreshToken(userId);
  return { accessToken, refreshToken };
}

// Verify refresh token + rotate: delete old, issue new pair
async function rotateRefreshToken(rawToken) {
  let payload;
  try {
    payload = jwt.verify(rawToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    const err = new Error('Refresh token invalid or expired');
    err.statusCode = 401;
    throw err;
  }

  const hashed = hashToken(rawToken);
  const stored = await Token.findOne({ token: hashed, userId: payload.sub, type: 'refresh' });
  if (!stored) {
    const err = new Error('Refresh token not found or already used');
    err.statusCode = 401;
    throw err;
  }

  await Token.deleteOne({ _id: stored._id });
  return generateTokenPair(payload.sub);
}

module.exports = { generateAccessToken, generateRefreshToken, generateTokenPair, rotateRefreshToken };
