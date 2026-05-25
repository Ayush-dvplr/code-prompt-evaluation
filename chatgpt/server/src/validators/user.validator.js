// src/validators/user.validator.js
const Joi = require('joi');

const updateProfileSchema = Joi.object({
  displayName: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  avatar: Joi.string().uri().optional(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});

module.exports = { updateProfileSchema, changePasswordSchema };
