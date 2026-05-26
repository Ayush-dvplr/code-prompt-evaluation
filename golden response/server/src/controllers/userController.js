// userController.js — profile view, update display name/email, and password change
const User = require('../models/User.model')
const AppError = require('../utils/AppError')

/** GET /api/v1/user/profile */
async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select('-password')
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND')
    res.json({
      success: true,
      data: { id: user._id, email: user.email, displayName: user.displayName, avatar: user.avatar },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * PUT /api/v1/user/profile
 * Email change requires the current password to be supplied in the body.
 */
async function updateProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id)
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND')

    const { displayName, email, currentPassword, avatar } = req.body

    // If changing email, verify current password first
    if (email && email !== user.email) {
      if (!currentPassword) {
        throw new AppError('Current password is required to change email', 400, 'PASSWORD_REQUIRED')
      }
      const isMatch = await user.comparePassword(currentPassword)
      if (!isMatch) throw new AppError('Current password is incorrect', 401, 'INVALID_CREDENTIALS')
    }

    if (displayName !== undefined) user.displayName = displayName
    if (email !== undefined) user.email = email
    if (avatar !== undefined) user.avatar = avatar

    // isModified('password') in the pre-save hook ensures password is NOT re-hashed here
    await user.save()

    res.json({
      success: true,
      data: { id: user._id, email: user.email, displayName: user.displayName, avatar: user.avatar },
    })
  } catch (err) {
    next(err)
  }
}

/** PATCH /api/v1/user/password */
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.user._id)
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND')

    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) throw new AppError('Current password is incorrect', 401, 'INVALID_CREDENTIALS')

    user.password = newPassword
    await user.save()

    res.json({ success: true, data: { message: 'Password changed successfully' } })
  } catch (err) {
    next(err)
  }
}

module.exports = { getProfile, updateProfile, changePassword }
