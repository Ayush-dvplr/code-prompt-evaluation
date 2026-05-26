// user.validator.js — Joi schemas for user/profile endpoints
const Joi = require('joi')

const updateProfileSchema = Joi.object({
  displayName: Joi.string().min(2).max(50).trim().optional(),
  email: Joi.string().email().lowercase().optional(),
  avatar: Joi.string().uri().allow('', null).optional(),
  // Required when changing email — verified in the controller
  currentPassword: Joi.string().optional(),
}).min(1)

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
})

module.exports = { updateProfileSchema, changePasswordSchema }
