// auth.middleware.js — JWT verification + live user lookup
// The prompt requires that we do NOT trust the token blindly from the frontend.
// We verify the JWT signature AND fetch the user from DB to ensure they still exist.
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const raw = authHeader.split(' ')[1];

    // Step 1 — verify JWT signature and expiry
    let payload;
    try {
      payload = jwt.verify(raw, process.env.JWT_ACCESS_SECRET);
    } catch {
      return res.status(401).json({ message: 'Token invalid or expired' });
    }

    // Step 2 — fetch user from DB (catches deleted accounts)
    const user = await User.findById(payload.sub).select('-password');
    if (!user) return res.status(401).json({ message: 'User no longer exists' });

    req.user = user; // attach full user object — controllers use req.user._id
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = protect;
