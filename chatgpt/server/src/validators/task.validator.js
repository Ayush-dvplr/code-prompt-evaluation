// src/validators/task.validator.js
const Joi = require('joi');

const createTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(5000).allow('', null),
  status: Joi.string().valid('pending', 'in-progress', 'completed').default('pending'),
  dueDate: Joi.date().greater('now').optional(), // allow past dates but warn in controller
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional(),
  description: Joi.string().max(5000).allow('', null).optional(),
  status: Joi.string().valid('pending', 'in-progress', 'completed').optional(),
  dueDate: Joi.date().optional(),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
});

module.exports = { createTaskSchema, updateTaskSchema };
