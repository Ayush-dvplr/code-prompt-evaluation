// hashToken.js — SHA256 hashing for tokens
// Why SHA256 and not bcrypt?
// bcrypt uses a random salt so the same input produces a different hash each time.
// That means you can't look up a token in the DB by its hash.
// SHA256 is deterministic — same token always gives the same hash — perfect for DB lookup.
// Use bcrypt only for passwords. Use SHA256 for tokens.
const crypto = require('crypto');

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = { hashToken };
