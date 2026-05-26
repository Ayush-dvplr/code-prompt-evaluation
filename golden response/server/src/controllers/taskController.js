// taskController.js — CRUD with pagination, filters, soft delete, and user isolation
const Task = require('../models/Task.model')
const AppError = require('../utils/AppError')

/**
 * GET /api/v1/tasks
 * Accepts: page, limit, status, priority, search, sortBy, sortOrder
 */
async function getTasks(req, res, next) {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query

    const pageNum = Math.max(1, parseInt(page, 10))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)))

    // Always scope to the authenticated user — prevents cross-user access
    const filter = { userId: req.user._id }
    if (status) filter.status = status
    if (priority) filter.priority = priority
    if (search) filter.title = { $regex: search, $options: 'i' }

    const allowedSortFields = ['createdAt', 'dueDate']
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt'
    const sortDir = sortOrder === 'asc' ? 1 : -1

    const skip = (pageNum - 1) * limitNum

    // Run count and find in parallel for efficiency
    const [tasks, total] = await Promise.all([
      Task.find(filter).sort({ [sortField]: sortDir }).skip(skip).limit(limitNum),
      Task.countDocuments(filter),
    ])

    res.json({
      success: true,
      data: tasks,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    })
  } catch (err) {
    next(err)
  }
}

/** GET /api/v1/tasks/:id */
async function getTask(req, res, next) {
  try {
    // userId in query ensures a user can't read another user's task
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id })
    if (!task) throw new AppError('Task not found', 404, 'NOT_FOUND')
    res.json({ success: true, data: task })
  } catch (err) {
    next(err)
  }
}

/** POST /api/v1/tasks */
async function createTask(req, res, next) {
  try {
    const taskData = { ...req.body, userId: req.user._id }
    const task = await Task.create(taskData)

    // Warn if due date is in the past — still create the task
    const warning =
      task.dueDate && new Date(task.dueDate) < new Date() ? 'Due date is in the past' : undefined

    const response = { success: true, data: task }
    if (warning) response.warning = warning

    res.status(201).json(response)
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/v1/tasks/:id
 * Verifies userId before updating — 403 if mismatch.
 * Last-write-wins: Mongoose timestamps auto-updates updatedAt on every save.
 */
async function updateTask(req, res, next) {
  try {
    // First confirm ownership to return 403 (not 404) on auth failure
    const existing = await Task.findById(req.params.id)
    if (!existing) throw new AppError('Task not found', 404, 'NOT_FOUND')
    if (existing.userId.toString() !== req.user._id.toString()) {
      throw new AppError('You do not have permission to update this task', 403, 'FORBIDDEN')
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )

    res.json({ success: true, data: task })
  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /api/v1/tasks/:id
 * Soft delete only — sets isDeleted=true and deletedAt=now.
 * The pre-find hook on the Task model ensures deleted tasks never appear in queries.
 */
async function deleteTask(req, res, next) {
  try {
    const existing = await Task.findById(req.params.id)
    if (!existing) throw new AppError('Task not found', 404, 'NOT_FOUND')
    if (existing.userId.toString() !== req.user._id.toString()) {
      throw new AppError('You do not have permission to delete this task', 403, 'FORBIDDEN')
    }

    // Bypass the pre-find hook by using updateOne directly with isDeleted=false check
    await Task.updateOne(
      { _id: req.params.id },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    )

    res.json({ success: true, data: { message: 'Task deleted successfully' } })
  } catch (err) {
    next(err)
  }
}

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask }
