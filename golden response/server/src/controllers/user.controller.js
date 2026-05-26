// user.controller.js — profile view, update, and password change
const User = require('../models/User.model');

/** GET /api/v2/user/profile */
async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user._id, email: user.email, displayName: user.displayName, avatar: user.avatar });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/v2/user/profile */
async function updateProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { displayName, email, avatar } = req.body;
    if (displayName !== undefined) user.displayName = displayName;
    if (email !== undefined) user.email = email;
    if (avatar !== undefined) user.avatar = avatar;

    // isModified('password') in the pre-save hook ensures password is NOT re-hashed here
    await user.save();

    res.json({ id: user._id, email: user.email, displayName: user.displayName, avatar: user.avatar });
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/v2/user/password */
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // comparePassword is defined on the User model instance
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

    // Assigning to user.password + save() triggers the pre-save bcrypt hook
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile, changePassword };
