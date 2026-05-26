// src/controllers/userController.js
const User = require('../models/User.model');
const { updateProfileSchema, changePasswordSchema } = require('../validators/user.validator');
const bcrypt = require('bcryptjs');

/** GET /user/profile */
exports.getProfile = async (req, res) => {
  // req.user is already populated by auth middleware
  const user = await User.findById(req.user._id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

/** PUT /user/profile */
exports.updateProfile = async (req, res) => {
  const { error, value } = updateProfileSchema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Validation failed', errors: error.details.map(d => d.message) });
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  Object.assign(user, value);
  await user.save();
  const { password, ...userData } = user.toObject();
  res.json(userData);
};

/** PATCH /user/password */
exports.changePassword = async (req, res) => {
  const { error, value } = changePasswordSchema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Validation failed', errors: error.details.map(d => d.message) });
  const { currentPassword, newPassword } = value;
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) return res.status(401).json({ message: 'Current password incorrect' });
  const salt = await bcrypt.genSalt(12);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();
  res.json({ message: 'Password changed successfully' });
};
