// src/controllers/authController.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.model.js';
import { sendMail } from '../utils/sendEmail.js';
import { generateTokens, rotateRefreshToken } from '../utils/generateTokens.js';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

/**
 * Register a new user (email/password).
 */
export async function register(req, res, next) {
  try {
    const { email, password, displayName } = req.body;
    if (!email || !password || !displayName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ email, password: hashed, displayName });
    // optional welcome email
    await sendMail({
      to: email,
      subject: 'Welcome to Todo App',
      text: `Hello ${displayName}, your account has been created.`,
    });
    const tokens = await generateTokens(user._id);
    res.status(201).json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: { id: user._id, email: user.email, displayName: user.displayName, avatar: user.avatar },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Login with email/password.
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const tokens = await generateTokens(user._id);
    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: { id: user._id, email: user.email, displayName: user.displayName, avatar: user.avatar },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Google sign‑in – expects Firebase ID token.
 */
export async function googleLogin(req, res, next) {
  try {
    const { idToken } = req.body;
    // Placeholder verification – replace with firebase-admin verification in production
    const decoded = { email: 'google@example.com', name: 'Google User' }; // mock
    let user = await User.findOne({ email: decoded.email });
    if (!user) {
      user = await User.create({ email: decoded.email, displayName: decoded.name, password: '' });
    }
    const tokens = await generateTokens(user._id);
    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: { id: user._id, email: user.email, displayName: user.displayName, avatar: user.avatar },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Refresh access token.
 */
export async function refreshToken(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' });
    const newTokens = await rotateRefreshToken(refreshToken);
    res.json(newTokens);
  } catch (err) {
    next(err);
  }
}

/**
 * Logout – deletes stored refresh token.
 */
export async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const Token = (await import('../models/Token.model.js')).default;
      const hashed = await bcrypt.hash(refreshToken, 12);
      await Token.deleteOne({ token: hashed });
    }
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

/**
 * Request password reset – send email with token link.
 */
export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: 'If that email exists, a reset link was sent' });
    const resetToken = jwt.sign({ sub: user._id }, ACCESS_SECRET, { expiresIn: '1h' });
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    await sendMail({
      to: email,
      subject: 'Password Reset Request',
      text: `Click the link to reset your password: ${resetLink}`,
    });
    res.json({ message: 'If that email exists, a reset link was sent' });
  } catch (err) {
    next(err);
  }
}

/**
 * Reset password using token.
 */
export async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    const payload = jwt.verify(token, ACCESS_SECRET);
    const hashed = await bcrypt.hash(newPassword, 12);
    await User.updateOne({ _id: payload.sub }, { password: hashed });
    res.json({ message: 'Password updated' });
  } catch (err) {
    next(err);
  }
}
