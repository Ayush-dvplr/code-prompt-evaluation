// src/controllers/taskController.js
const Task = require('../models/Task.model');
const { createTaskSchema, updateTaskSchema } = require('../validators/task.validator');

/**
 * GET /tasks
 * Supports pagination (page, limit) and filters: status, priority, search (title)
 */
exports.getTasks = async (req, res) => {
  const { page = 1, limit = 20, status, priority, search } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (search) filter.title = { $regex: search, $options: 'i' };
  // Only fetch tasks belonging to the authenticated user (req.user set by auth middleware)
  filter.userId = req.user._id;

  const skip = (page - 1) * limit;
  const tasks = await Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10));
  const total = await Task.countDocuments(filter);
  res.json({ tasks, total, page: +page, limit: +limit });
};

/**
 * GET /tasks/:id
 */
exports.getTask = async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
};

/**
 * POST /tasks
 */
exports.createTask = async (req, res) => {
  const { error, value } = createTaskSchema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Validation failed', errors: error.details.map(d => d.message) });

  // Warn if dueDate is in the past (client will receive warning in response)
  const now = new Date();
  if (value.dueDate && new Date(value.dueDate) < now) {
    // Still allow creation but include a warning flag
    const task = await Task.create({ ...value, userId: req.user._id });
    return res.status(201).json({ task, warning: 'Due date is in the past' });
  }
  const task = await Task.create({ ...value, userId: req.user._id });
  res.status(201).json(task);
};

/**
 * PATCH /tasks/:id
 * Implements last-write-wins based on updatedAt timestamp.
 */
exports.updateTask = async (req, res) => {
  const { error, value } = updateTaskSchema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Validation failed', errors: error.details.map(d => d.message) });

  const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
  if (!task) return res.status(404).json({ message: 'Task not found' });

  // Apply updates
  Object.assign(task, value);
  task.updatedAt = new Date(); // ensure timestamp changes
  await task.save();
  res.json(task);
};

/**
 * DELETE /tasks/:id
 */
exports.deleteTask = async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json({ message: 'Task deleted' });
};
