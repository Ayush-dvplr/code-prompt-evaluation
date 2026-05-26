// auth.validator.js — Joi schemas for all auth endpoints
const Joi = require('joi')

const registerSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(8).required(),
  displayName: Joi.string().min(2).max(50).trim().required(),
})

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
})

// Firebase ID token from the frontend popup flow
const googleAuthSchema = Joi.object({
  idToken: Joi.string().required(),
})

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
})

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
})

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
})

module.exports = {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshSchema,
}
