const prisma = require('../config/prisma')
const ApiError = require('../utils/apiError')

const getUserProfile = async (userId) => {
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
    throw ApiError.notFound('User not found')
  }

  const [ownedProjects, totalProjects, myTasks, completedTasks] = await Promise.all([
    prisma.project.count({ where: { ownerId: userId } }),
    prisma.project.count({
      where: {
        OR: [{ ownerId: userId }, { tasks: { some: { assigneeId: userId } } }],
      },
    }),
    prisma.task.count({ where: { assigneeId: userId } }),
    prisma.task.count({ where: { assigneeId: userId, status: 'COMPLETED' } }),
  ])

  return {
    user,
    stats: {
      ownedProjects,
      totalProjects,
      completedTasks,
      pendingTasks: myTasks - completedTasks,
    },
  }
}

const updateUserProfile = async (userId, payload) => {
  const updateData = {}

  if (payload.name !== undefined) {
    updateData.name = payload.name.trim()
  }

  if (payload.email !== undefined) {
    const normalizedEmail = payload.email.toLowerCase().trim()
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })
    if (existing && existing.id !== userId) {
      throw ApiError.conflict('Email address is already in use by another account', {
        email: 'Email address is already in use',
      })
    }
    updateData.email = normalizedEmail
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      avatarColor: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return updatedUser
}

const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      avatarColor: true,
      createdAt: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  return users
}

module.exports = {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
}
