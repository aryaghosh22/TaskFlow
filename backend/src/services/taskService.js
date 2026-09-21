const prisma = require('../config/prisma')
const ApiError = require('../utils/apiError')

const getTasks = async (userId, query = {}) => {
  const { status, priority, projectId, assigneeId, search } = query
  const page = Math.max(1, parseInt(query.page, 10) || 1)
  const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 50))
  const skip = (page - 1) * limit

  // Projects accessible by this user
  const accessibleProjectFilter = {
    project: {
      OR: [
        { ownerId: userId },
        { tasks: { some: { assigneeId: userId } } },
      ],
    },
  }

  const where = {
    ...accessibleProjectFilter,
  }

  if (status && status !== 'ALL') {
    where.status = status
  }

  if (priority && priority !== 'ALL') {
    where.priority = priority
  }

  if (projectId && projectId !== 'ALL') {
    where.projectId = projectId
  }

  if (assigneeId && assigneeId !== 'ALL') {
    if (assigneeId === 'UNASSIGNED') {
      where.assigneeId = null
    } else {
      where.assigneeId = assigneeId
    }
  }

  if (search && search.trim()) {
    const q = search.trim()
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { labels: { has: q.toLowerCase() } },
    ]
  }

  const [total, tasks] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarColor: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      skip,
      take: limit,
    }),
  ])

  return {
    tasks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  }
}

const getTaskById = async (taskId, userId) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarColor: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
          ownerId: true,
        },
      },
    },
  })

  if (!task) {
    throw ApiError.notFound('Task not found')
  }

  // Access check: User must be project owner or have access to project
  const isOwner = task.project.ownerId === userId
  const isAssignee = task.assigneeId === userId

  if (!isOwner && !isAssignee) {
    // Check if user is a collaborator on the project
    const isProjectCollaborator = await prisma.task.count({
      where: {
        projectId: task.projectId,
        assigneeId: userId,
      },
    })
    if (!isProjectCollaborator) {
      throw ApiError.forbidden('You do not have access to view this task')
    }
  }

  return task
}

const createTask = async (userId, payload) => {
  // Verify target project exists and user has access
  const project = await prisma.project.findUnique({
    where: { id: payload.projectId },
    include: {
      tasks: {
        where: { assigneeId: userId },
      },
    },
  })

  if (!project) {
    throw ApiError.notFound('Project specified for this task does not exist')
  }

  const isOwner = project.ownerId === userId
  const isCollaborator = project.tasks.length > 0
  if (!isOwner && !isCollaborator) {
    throw ApiError.forbidden('You do not have permission to create tasks in this project')
  }

  // If assignee provided, verify assignee exists
  if (payload.assigneeId) {
    const assignee = await prisma.user.findUnique({
      where: { id: payload.assigneeId },
    })
    if (!assignee) {
      throw ApiError.badRequest('Assigned user does not exist')
    }
  }

  const task = await prisma.task.create({
    data: {
      title: payload.title.trim(),
      description: payload.description ? payload.description.trim() : null,
      projectId: payload.projectId,
      status: payload.status || 'TODO',
      priority: payload.priority || 'MEDIUM',
      assigneeId: payload.assigneeId || null,
      dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
      labels: Array.isArray(payload.labels) ? payload.labels : [],
    },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarColor: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  // Touch project updatedAt
  await prisma.project.update({
    where: { id: payload.projectId },
    data: { updatedAt: new Date() },
  })

  return task
}

const updateTask = async (taskId, userId, payload) => {
  const existingTask = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: true,
    },
  })

  if (!existingTask) {
    throw ApiError.notFound('Task not found')
  }

  // Access check: User must be project owner or have access to project
  const isOwner = existingTask.project.ownerId === userId
  const isAssignee = existingTask.assigneeId === userId
  if (!isOwner && !isAssignee) {
    const hasAccess = await prisma.task.count({
      where: {
        projectId: existingTask.projectId,
        assigneeId: userId,
      },
    })
    if (!hasAccess) {
      throw ApiError.forbidden('You are not authorized to modify this task')
    }
  }

  // If changing assignee, verify user exists
  if (payload.assigneeId) {
    const assignee = await prisma.user.findUnique({
      where: { id: payload.assigneeId },
    })
    if (!assignee) {
      throw ApiError.badRequest('Assigned user does not exist')
    }
  }

  // If changing project, verify target project exists & user has access
  if (payload.projectId && payload.projectId !== existingTask.projectId) {
    const targetProject = await prisma.project.findUnique({
      where: { id: payload.projectId },
    })
    if (!targetProject) {
      throw ApiError.notFound('Target project does not exist')
    }
    if (targetProject.ownerId !== userId) {
      throw ApiError.forbidden('Cannot move task to a project you do not own')
    }
  }

  const updateData = {}
  if (payload.title !== undefined) updateData.title = payload.title.trim()
  if (payload.description !== undefined) {
    updateData.description = payload.description ? payload.description.trim() : null
  }
  if (payload.projectId !== undefined) updateData.projectId = payload.projectId
  if (payload.status !== undefined) updateData.status = payload.status
  if (payload.priority !== undefined) updateData.priority = payload.priority
  if (payload.assigneeId !== undefined) updateData.assigneeId = payload.assigneeId || null
  if (payload.dueDate !== undefined) {
    updateData.dueDate = payload.dueDate ? new Date(payload.dueDate) : null
  }
  if (payload.labels !== undefined) {
    updateData.labels = Array.isArray(payload.labels) ? payload.labels : []
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: updateData,
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarColor: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  // Touch project updatedAt
  await prisma.project.update({
    where: { id: updatedTask.projectId },
    data: { updatedAt: new Date() },
  })

  return updatedTask
}

const deleteTask = async (taskId, userId) => {
  const existingTask = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: true,
    },
  })

  if (!existingTask) {
    throw ApiError.notFound('Task not found')
  }

  // Authorization: Project owner or task assignee
  const isOwner = existingTask.project.ownerId === userId
  const isAssignee = existingTask.assigneeId === userId
  if (!isOwner && !isAssignee) {
    throw ApiError.forbidden('You are not authorized to delete this task')
  }

  await prisma.task.delete({
    where: { id: taskId },
  })

  return { ok: true, message: 'Task deleted successfully' }
}

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
}
