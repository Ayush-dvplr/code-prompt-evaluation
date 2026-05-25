// auth.controller.js — register, login, refresh, logout, forgot/reset password
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const Token = require('../models/Token.model');
const { generateTokenPair, rotateRefreshToken } = require('../utils/generateTokens');
const { hashToken } = require('../utils/hashToken');
const { sendEmail } = require('../utils/sendEmail');

/** POST /api/v2/auth/register */
async function register(req, res, next) {
  try {
    const { email, password, displayName } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // bcrypt pre-save hook in User model handles hashing automatically
    const user = await User.create({ email, password, displayName });

    // Welcome email — non-blocking so it never breaks registration
    sendEmail({
      to: user.email,
      subject: 'Welcome to Todo App!',
      text: `Hi ${user.displayName}, your account has been created. Start organizing your tasks today!`,
    }).catch(console.error);

    const tokens = await generateTokenPair(user._id);

    res.status(201).json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: { id: user._id, email: user.email, displayName: user.displayName, avatar: user.avatar },
    });
  } catch (err) {
    next(err);
  }
}

/** POST /api/v2/auth/login */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    const tokens = await generateTokenPair(user._id);

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: { id: user._id, email: user.email, displayName: user.displayName, avatar: user.avatar },
    });
  } catch (err) {
    next(err);
  }
}

/** POST /api/v2/auth/refresh */
async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const tokens = await rotateRefreshToken(refreshToken);
    res.json(tokens);
  } catch (err) {
    if (err.statusCode === 401) return res.status(401).json({ message: err.message });
    next(err);
  }
}

/** POST /api/v2/auth/logout */
async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      // Use SHA256 hash to find and delete the stored token
      const hashed = hashToken(refreshToken);
      await Token.deleteOne({ token: hashed, type: 'refresh' });
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

/** POST /api/v2/auth/forgot-password */
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return the same message — prevents email enumeration attacks
    const safeMsg = { message: 'If that email exists, a reset link was sent.' };
    if (!user) return res.json(safeMsg);

    const resetToken = jwt.sign(
      { sub: user._id.toString() },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '1h' }
    );

    const hashed = hashToken(resetToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Remove any existing reset tokens for this user
    await Token.deleteMany({ userId: user._id, type: 'reset' });
    await Token.create({ token: hashed, userId: user._id, type: 'reset', expiresAt });

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      text: `Click the link to reset your password (valid for 1 hour): ${resetLink}`,
      html: `<p>Click the link below to reset your password (valid for 1 hour):</p><p><a href="${resetLink}">${resetLink}</a></p>`,
    });

    res.json(safeMsg);
  } catch (err) {
    next(err);
  }
}

/** POST /api/v2/auth/reset-password */
async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch {
      return res.status(400).json({ message: 'Reset token invalid or expired' });
    }

    const hashed = hashToken(token);
    const stored = await Token.findOne({ token: hashed, userId: payload.sub, type: 'reset' });
    if (!stored) {
      return res.status(400).json({ message: 'Reset token already used or expired' });
    }

    const user = await User.findById(payload.sub);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // pre-save hook will hash newPassword
    user.password = newPassword;
    await user.save();

    // Delete used reset token so it can't be reused
    await Token.deleteOne({ _id: stored._id });

    res.json({ message: 'Password reset successfully. Please sign in.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, refresh, logout, forgotPassword, resetPassword };
