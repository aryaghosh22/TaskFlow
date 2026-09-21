const ApiError = require('../utils/apiError')
const env = require('../config/env')

const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal server error'
  let errors = err.errors || null

  // Handle JSON parse error in body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400
    message = 'Malformed JSON in request body'
  }

  // Handle Zod validation error
  if (err.name === 'ZodError' && Array.isArray(err.errors)) {
    statusCode = 422
    message = 'Validation failed'
    errors = {}
    for (const issue of err.errors) {
      const path = issue.path.join('.') || 'field'
      if (!errors[path]) {
        errors[path] = issue.message
      }
    }
  }

  // Handle Prisma errors
  if (err.code === 'P2002') {
    statusCode = 409
    const target = err.meta?.target ? (Array.isArray(err.meta.target) ? err.meta.target.join(', ') : err.meta.target) : 'field'
    message = `A record with this ${target} already exists`
    errors = { [target]: `${target} must be unique` }
  } else if (err.code === 'P2025') {
    statusCode = 404
    message = 'Requested record was not found'
  } else if (err.code === 'P2003') {
    statusCode = 400
    message = 'Invalid relation reference constraint'
  }

  const response = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  }

  res.status(statusCode).json(response)
}

module.exports = errorMiddleware
