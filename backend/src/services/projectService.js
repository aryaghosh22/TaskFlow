const prisma = require('../config/prisma')
const ApiError = require('../utils/apiError')

const getProjects = async (userId) => {
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { tasks: { some: { assigneeId: userId } } },
      ],
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarColor: true,
        },
      },
      _count: {
        select: {
          tasks: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  return projects
}

const getProjectById = async (projectId, userId) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarColor: true,
        },
      },
      tasks: {
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarColor: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  })

  if (!project) {
    throw ApiError.notFound('Project not found')
  }

  // Check authorization: owner or has assigned tasks in this project
  const isOwner = project.ownerId === userId
  const isCollaborator = project.tasks.some((t) => t.assigneeId === userId)

  if (!isOwner && !isCollaborator) {
    throw ApiError.forbidden('You do not have access to view this project')
  }

  return project
}

const createProject = async (userId, payload) => {
  const project = await prisma.project.create({
    data: {
      name: payload.name.trim(),
      description: payload.description ? payload.description.trim() : null,
      status: payload.status || 'ACTIVE',
      deadline: payload.deadline ? new Date(payload.deadline) : null,
      ownerId: userId, // Always derive ownership from authenticated JWT identity
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarColor: true,
        },
      },
    },
  })

  return project
}

const updateProject = async (projectId, userId, payload) => {
  const existingProject = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!existingProject) {
    throw ApiError.notFound('Project not found')
  }

  // Authorization check: Only project owner can modify project metadata
  if (existingProject.ownerId !== userId) {
    throw ApiError.forbidden('Only the project owner is authorized to update this project')
  }

  const updateData = {}
  if (payload.name !== undefined) updateData.name = payload.name.trim()
  if (payload.description !== undefined) {
    updateData.description = payload.description ? payload.description.trim() : null
  }
  if (payload.status !== undefined) updateData.status = payload.status
  if (payload.deadline !== undefined) {
    updateData.deadline = payload.deadline ? new Date(payload.deadline) : null
  }

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: updateData,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarColor: true,
        },
      },
    },
  })

  return updatedProject
}

const deleteProject = async (projectId, userId) => {
  const existingProject = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!existingProject) {
    throw ApiError.notFound('Project not found')
  }

  // Authorization check: Only project owner can delete project
  if (existingProject.ownerId !== userId) {
    throw ApiError.forbidden('Only the project owner is authorized to delete this project')
  }

  // Cascade delete tasks is configured via Prisma schema onDelete: Cascade
  await prisma.project.delete({
    where: { id: projectId },
  })

  return { ok: true, message: 'Project and all associated tasks deleted successfully' }
}

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
}
