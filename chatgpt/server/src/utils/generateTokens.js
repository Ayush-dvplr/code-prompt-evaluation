// server/src/utils/generateTokens.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Token from '../models/Token.model.js';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

/**
 * Generate access and refresh JWT tokens.
 * Stores a hashed refresh token in the DB with a TTL.
 */
export async function generateTokens(userId) {
  const accessToken = jwt.sign({ sub: userId }, ACCESS_SECRET, { expiresIn: '1d' });
  const rawRefreshToken = jwt.sign({ sub: userId }, REFRESH_SECRET, { expiresIn: '7d' });
  const hashed = await bcrypt.hash(rawRefreshToken, 12);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  // Save token document (will be cleaned by TTL index)
  await Token.create({ token: hashed, userId, expiresAt });
  return { accessToken, refreshToken: rawRefreshToken };
}

/**
 * Verify a refresh token and rotate it.
 */
export async function rotateRefreshToken(oldToken) {
  const payload = jwt.verify(oldToken, REFRESH_SECRET);
  const stored = await Token.findOne({ userId: payload.sub }).sort({ createdAt: -1 });
  if (!stored) throw new Error('Refresh token not found');
  const match = await bcrypt.compare(oldToken, stored.token);
  if (!match) throw new Error('Invalid refresh token');
  // Delete old token and generate new pair
  await Token.deleteOne({ _id: stored._id });
  return await generateTokens(payload.sub);
}
