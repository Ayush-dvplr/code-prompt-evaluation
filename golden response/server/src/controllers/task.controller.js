// task.controller.js — CRUD with pagination, filters, user isolation, and edge cases
const Task = require('../models/Task.model');

/** GET /api/v2/tasks?page=1&limit=20&status=pending&priority=high&search=keyword */
async function getTasks(req, res, next) {
  try {
    const { page = 1, limit = 20, status, priority, search } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    // Always scope to the authenticated user — prevents cross-user access
    const filter = { userId: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const skip = (pageNum - 1) * limitNum;

    // Run count and find in parallel for efficiency
    const [tasks, total] = await Promise.all([
      Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Task.countDocuments(filter),
    ]);

    res.json({
      tasks,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
}

/** GET /api/v2/tasks/:id */
async function getTask(req, res, next) {
  try {
    // userId in query ensures a user can't read another user's task
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    next(err);
  }
}

/** POST /api/v2/tasks */
async function createTask(req, res, next) {
  try {
    const taskData = { ...req.body, userId: req.user._id };
    const task = await Task.create(taskData);

    // Warn if due date is in the past — but still create the task (as per requirement)
    const warning =
      task.dueDate && new Date(task.dueDate) < new Date() ? 'Due date is in the past' : null;

    res.status(201).json({ task, warning });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v2/tasks/:id
 * Uses findOneAndUpdate with userId check — implements last-write-wins for concurrent edits.
 * Mongoose timestamps auto-updates updatedAt on every save.
 */
async function updateTask(req, res, next) {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id }, // user isolation built in
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/v2/tasks/:id */
async function deleteTask(req, res, next) {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask };
