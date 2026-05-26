// authController.js — register, login, refresh, logout, forgot/reset password, Google OAuth
const jwt = require('jsonwebtoken')
const User = require('../models/User.model')
const Token = require('../models/Token.model')
const AppError = require('../utils/AppError')
const { generateTokenPair, rotateRefreshToken } = require('../utils/generateTokens')
const { hashToken } = require('../utils/hashTokens')
const { getAdmin } = require('../config/firebase')

// wire up when email provider is decided
// const { sendEmail } = require('../utils/email/sendEmail')

/** POST /api/v1/auth/register */
async function register(req, res, next) {
  try {
    const { email, password, displayName } = req.body

    const existing = await User.findOne({ email })
    if (existing) throw new AppError('Email already registered', 409, 'EMAIL_EXISTS')

    const user = await User.create({ email, password, displayName })

    // wire up when email provider is decided
    // sendEmail({
    //   to: user.email,
    //   subject: 'Welcome to Todo App!',
    //   text: `Hi ${user.displayName}, your account has been created.`,
    // }).catch(console.error)

    const tokens = await generateTokenPair(user._id)

    res.status(201).json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: { id: user._id, email: user.email, displayName: user.displayName, avatar: user.avatar },
      },
    })
  } catch (err) {
    next(err)
  }
}

/** POST /api/v1/auth/login */
async function login(req, res, next) {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS')

    const isMatch = await user.comparePassword(password)
    if (!isMatch) throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS')

    const tokens = await generateTokenPair(user._id)

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: { id: user._id, email: user.email, displayName: user.displayName, avatar: user.avatar },
      },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/v1/auth/google
 * Accepts a Firebase ID token from the frontend, verifies it with firebase-admin,
 * then issues your own JWT pair. Firebase only proves identity — your backend owns the session.
 */
async function googleAuth(req, res, next) {
  try {
    const { idToken } = req.body
    if (!idToken) throw new AppError('Firebase ID token is required', 400, 'MISSING_TOKEN')

    // getAdmin() initializes firebase-admin on first call; throws a clear error
    // if FIREBASE_* env vars are not configured yet.
    let admin
    try {
      admin = getAdmin()
    } catch (configErr) {
      throw new AppError(
        'Google sign-in is not configured on this server. ' + configErr.message,
        503,
        'FIREBASE_NOT_CONFIGURED'
      )
    }

    // Verify the Firebase token — throws if invalid or expired
    const decoded = await admin.auth().verifyIdToken(idToken)

    let user = await User.findOne({ email: decoded.email })

    if (!user) {
      // First-time Google sign-in — create a new user without a password
      user = await User.create({
        email: decoded.email,
        displayName: decoded.name || decoded.email.split('@')[0],
        avatar: decoded.picture || null,
        password: null,
      })
    }

    const tokens = await generateTokenPair(user._id)

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: { id: user._id, email: user.email, displayName: user.displayName, avatar: user.avatar },
      },
    })
  } catch (err) {
    next(err)
  }
}

/** POST /api/v1/auth/refresh */
async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body
    const tokens = await rotateRefreshToken(refreshToken)
    res.json({
      success: true,
      data: tokens,
    })
  } catch (err) {
    next(err)
  }
}

/** POST /api/v1/auth/logout */
async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body
    if (refreshToken) {
      const hashed = hashToken(refreshToken)
      await Token.deleteOne({ token: hashed, type: 'refresh' })
    }
    res.json({ success: true, data: { message: 'Logged out successfully' } })
  } catch (err) {
    next(err)
  }
}

/** POST /api/v1/auth/forgot-password */
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })

    // Always return the same message — prevents email enumeration attacks
    const safeResponse = {
      success: true,
      data: { message: 'If that email exists, a reset link was sent.' },
    }
    if (!user) return res.json(safeResponse)

    const resetToken = jwt.sign(
      { sub: user._id.toString() },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '1h' }
    )
    const hashed = hashToken(resetToken)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await Token.deleteMany({ userId: user._id, type: 'reset' })
    await Token.create({ token: hashed, userId: user._id, type: 'reset', expiresAt })

    // wire up when email provider is decided
    // const resetLink = `${process.env.CORS_ORIGIN}/reset-password?token=${resetToken}`
    // await sendEmail({
    //   to: user.email,
    //   subject: 'Password Reset Request',
    //   text: `Click the link to reset your password (valid 1 hour): ${resetLink}`,
    //   html: `<p>Click <a href="${resetLink}">here</a> to reset your password (valid 1 hour).</p>`,
    // })

    res.json(safeResponse)
  } catch (err) {
    next(err)
  }
}

/** POST /api/v1/auth/reset-password */
async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body

    let payload
    try {
      payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    } catch {
      throw new AppError('Reset token invalid or expired', 400, 'TOKEN_INVALID')
    }

    const hashed = hashToken(token)
    const stored = await Token.findOne({ token: hashed, userId: payload.sub, type: 'reset' })
    if (!stored) throw new AppError('Reset token already used or expired', 400, 'TOKEN_REUSED')

    const user = await User.findById(payload.sub)
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND')

    user.password = newPassword
    await user.save()

    await Token.deleteOne({ _id: stored._id })

    res.json({ success: true, data: { message: 'Password reset successfully. Please sign in.' } })
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login, googleAuth, refresh, logout, forgotPassword, resetPassword }
