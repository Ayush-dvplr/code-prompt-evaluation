// server/src/models/Token.model.js
const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true }, // hashed token
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['access', 'refresh'], required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Index for automatic expiration
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Token', tokenSchema);
