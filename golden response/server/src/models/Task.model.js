// Task.model.js
const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

// Compound index — speeds up the most common query: user's tasks filtered by status
taskSchema.index({ userId: 1, status: 1 })

// Pre-find hook — every query automatically skips soft-deleted documents
// This covers find, findOne, findOneAndUpdate, findOneAndDelete, etc.
taskSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false })
  next()
})

module.exports = mongoose.model('Task', taskSchema)
