const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const env = require('./config/env')

const authRoutes = require('./routes/authRoutes')
const projectRoutes = require('./routes/projectRoutes')
const taskRoutes = require('./routes/taskRoutes')
const userRoutes = require('./routes/userRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')

const notFoundMiddleware = require('./middleware/notFoundMiddleware')
const errorMiddleware = require('./middleware/errorMiddleware')

const app = express()

// Security HTTP headers
app.use(helmet())

// Configure CORS with explicit allowed origins (configurable via FRONTEND_URL or CORS_ORIGIN)
const allowedOrigins = Array.from(
  new Set([
    ...(env.FRONTEND_URL ? env.FRONTEND_URL.split(',').map((o) => o.trim()) : []),
    ...(env.CORS_ORIGIN ? env.CORS_ORIGIN.split(',').map((o) => o.trim()) : []),
    'http://localhost:5173',
  ]),
)

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true)
      }
      if (env.NODE_ENV === 'development') {
        return callback(null, true)
      }
      return callback(new Error('Origin not allowed by CORS policy'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)

// Global Rate Limiter for general API protection
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
})
app.use('/api', generalLimiter)

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health Check Endpoint (matches Section 46 requirement)
app.get('/api/health', (req, res) => {
  let dbStatus = 'disconnected'
  if (env.DATABASE_URL && !env.DATABASE_URL.includes('[INSERT-CONNECTION-HERE]')) {
    dbStatus = 'configured'
  } else {
    dbStatus = 'pending_configuration'
  }

  res.status(200).json({
    success: true,
    message: 'TaskFlow API is running',
    database: dbStatus,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
})

// Mount REST API Routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/users', userRoutes)
app.use('/api/dashboard', dashboardRoutes)

// 404 handler for unknown routes
app.use(notFoundMiddleware)

// Centralized error handler
app.use(errorMiddleware)

module.exports = app
