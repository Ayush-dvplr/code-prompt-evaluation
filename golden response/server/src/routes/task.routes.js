// task.routes.js — all routes are protected by authMiddleware
const express = require('express')
const router = express.Router()
const taskController = require('../controllers/taskController')
const protect = require('../middlewares/authMiddleware')
const { validateBody } = require('../middlewares/validationMiddleware')
const { createTaskSchema, updateTaskSchema } = require('../validators/task.validator')

router.use(protect) // every task route requires a valid JWT

router.get('/', taskController.getTasks)
router.post('/', validateBody(createTaskSchema), taskController.createTask)
router.get('/:id', taskController.getTask)
router.patch('/:id', validateBody(updateTaskSchema), taskController.updateTask)
router.delete('/:id', taskController.deleteTask)

module.exports = router
