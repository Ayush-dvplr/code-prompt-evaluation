// hashTokens.js — deterministic SHA256 hashing for token DB lookup
// SHA256 (not bcrypt) because the same token must always produce the same hash
// so we can find it in the DB. Bcrypt uses a random salt — great for passwords,
// wrong for tokens. Never use this for passwords.
const crypto = require('crypto')

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

module.exports = { hashToken }
