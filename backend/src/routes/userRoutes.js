const express = require('express')
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')
const validate = require('../validators/validate')
const { updateProfileSchema } = require('../validators/userValidator')

const router = express.Router()

// All user routes require authentication
router.use(authMiddleware)

router.get('/me', userController.getProfile)
router.put('/me', validate(updateProfileSchema), userController.updateProfile)
router.get('/', userController.listUsers)

module.exports = router
