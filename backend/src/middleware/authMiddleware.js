const { verifyToken } = require('../utils/jwt')
const ApiError = require('../utils/apiError')
const prisma = require('../config/prisma')

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(ApiError.unauthorized('Authentication token is required'))
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      return next(ApiError.unauthorized('Invalid authorization header format'))
    }

    let decoded
    try {
      decoded = verifyToken(token)
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(ApiError.unauthorized('Authentication token has expired'))
      }
      return next(ApiError.unauthorized('Invalid authentication token'))
    }

    if (!decoded.userId) {
      return next(ApiError.unauthorized('Malformed authentication token'))
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarColor: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return next(ApiError.unauthorized('Authenticated user no longer exists'))
    }

    // Attach verified user to request
    req.user = user
    next()
  } catch (error) {
    next(error)
  }
}

module.exports = authMiddleware
