// src/routes/task.routes.js
const express = require('express');
const taskController = require('../controllers/taskController');
const protect = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validation.middleware');
const { createTaskSchema, updateTaskSchema } = require('../validators/task.validator');

const router = express.Router();

// All task routes require authentication
router.use(protect);

router.get('/', taskController.getTasks);
router.post('/', validateBody(createTaskSchema), taskController.createTask);
router.get('/:id', taskController.getTask);
router.patch('/:id', validateBody(updateTaskSchema), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
