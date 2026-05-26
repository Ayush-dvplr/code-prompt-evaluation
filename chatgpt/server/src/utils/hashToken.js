// src/utils/hashToken.js
import bcrypt from 'bcryptjs';

/**
 * Hash a plain token (e.g., refresh token) using bcrypt with 12 salt rounds.
 */
export async function hashToken(token) {
  return await bcrypt.hash(token, 12);
}

/**
 * Compare a plain token with a hashed version.
 */
export async function compareToken(token, hashed) {
  return await bcrypt.compare(token, hashed);
}
