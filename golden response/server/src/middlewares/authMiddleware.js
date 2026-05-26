// authMiddleware.js — verify JWT signature and confirm user still exists in DB
const jwt = require('jsonwebtoken')
const User = require('../models/User.model')
const AppError = require('../utils/AppError')

async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('No token provided', 401, 'NO_TOKEN'))
    }

    const raw = authHeader.split(' ')[1]

    let payload
    try {
      payload = jwt.verify(raw, process.env.JWT_ACCESS_SECRET)
    } catch {
      return next(new AppError('Token invalid or expired', 401, 'TOKEN_INVALID'))
    }

    // Fetch user from DB — catches deleted accounts
    const user = await User.findById(payload.sub).select('-password')
    if (!user) return next(new AppError('User no longer exists', 401, 'USER_NOT_FOUND'))

    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = protect
