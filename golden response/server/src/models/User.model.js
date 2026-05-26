// User.model.js
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Password is optional — Google OAuth users are created without one
    password: {
      type: String,
      minlength: 8,
      default: null,
    },
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
      maxlength: 50,
    },
    avatar: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
)

// Hash password before saving — the isModified guard prevents re-hashing
// when other fields (displayName, email) are updated, and skips null passwords
// (Google OAuth users).
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12
  const salt = await bcrypt.genSalt(saltRounds)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Compare a plain password against the stored hash
userSchema.methods.comparePassword = function (candidatePassword) {
  if (!this.password) return Promise.resolve(false)
  return bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('User', userSchema)
