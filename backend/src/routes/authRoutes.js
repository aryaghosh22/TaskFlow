const express = require('express')
const rateLimit = require('express-rate-limit')
const authController = require('../controllers/authController')
const authMiddleware = require('../middleware/authMiddleware')
const validate = require('../validators/validate')
const { registerSchema, loginSchema } = require('../validators/authValidator')

const router = express.Router()

// Dedicated strict rate limiter for login/register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 requests per 15 minutes
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

router.post('/register', authLimiter, validate(registerSchema), authController.register)
router.post('/login', authLimiter, validate(loginSchema), authController.login)
router.get('/me', authMiddleware, authController.me)
router.post('/logout', authMiddleware, authController.logout)

module.exports = router
