const express = require('express')
const taskController = require('../controllers/taskController')
const authMiddleware = require('../middleware/authMiddleware')
const validate = require('../validators/validate')
const { createTaskSchema, updateTaskSchema } = require('../validators/taskValidator')

const router = express.Router()

// All task routes require authentication
router.use(authMiddleware)

router.get('/', taskController.listTasks)
router.post('/', validate(createTaskSchema), taskController.createTask)
router.get('/:id', taskController.getTask)
router.put('/:id', validate(updateTaskSchema), taskController.updateTask)
router.patch('/:id', validate(updateTaskSchema), taskController.updateTask)
router.delete('/:id', taskController.deleteTask)

module.exports = router
