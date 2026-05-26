// task.validator.js — Joi schemas for task endpoints
const Joi = require('joi');

const createTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200).trim().required(),
  description: Joi.string().max(7000).allow('', null).default(''),
  status: Joi.string().valid('pending', 'in-progress', 'completed').default('pending'),
  dueDate: Joi.date().allow(null).optional(), // past dates accepted — controller sends warning
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
});

// At least one field required for an update
const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200).trim().optional(),
  description: Joi.string().max(7000).allow('', null).optional(),
  status: Joi.string().valid('pending', 'in-progress', 'completed').optional(),
  dueDate: Joi.date().allow(null).optional(),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
}).min(1);

module.exports = { createTaskSchema, updateTaskSchema };
