const bcrypt = require('bcryptjs')
const prisma = require('../config/prisma')
const ApiError = require('../utils/apiError')
const { signToken } = require('../utils/jwt')

const AVATAR_COLORS = ['#4f46e5', '#0f766e', '#c2410c', '#7c3aed', '#0284c7']

const register = async ({ name, email, password }) => {
  const normalizedEmail = email.toLowerCase().trim()

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  })

  if (existingUser) {
    throw ApiError.conflict('An account with this email address already exists', {
      email: 'Email address is already in use',
    })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      avatarColor,
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatarColor: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  const token = signToken({ userId: user.id })

  return { token, user }
}

const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim()

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  })

  // Avoid revealing whether email or password specifically was incorrect
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password')
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password')
  }

  const token = signToken({ userId: user.id })

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarColor: user.avatarColor,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }

  return { token, user: safeUser }
}

const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
    throw ApiError.notFound('User account not found')
  }

  return user
}

module.exports = {
  register,
  login,
  getCurrentUser,
}
