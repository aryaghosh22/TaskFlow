const express = require('express')
const projectController = require('../controllers/projectController')
const authMiddleware = require('../middleware/authMiddleware')
const validate = require('../validators/validate')
const { createProjectSchema, updateProjectSchema } = require('../validators/projectValidator')

const router = express.Router()

// All project routes require authentication
router.use(authMiddleware)

router.get('/', projectController.listProjects)
router.post('/', validate(createProjectSchema), projectController.createProject)
router.get('/:id', projectController.getProject)
router.put('/:id', validate(updateProjectSchema), projectController.updateProject)
router.patch('/:id', validate(updateProjectSchema), projectController.updateProject)
router.delete('/:id', projectController.deleteProject)

module.exports = router
