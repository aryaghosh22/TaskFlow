const prisma = require('../config/prisma')

const getDashboardData = async (userId) => {
  const [projects, tasks] = await Promise.all([
    prisma.project.findMany({
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
          select: { tasks: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.task.findMany({
      where: {
        project: {
          OR: [
            { ownerId: userId },
            { tasks: { some: { assigneeId: userId } } },
          ],
        },
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
      orderBy: { updatedAt: 'desc' },
    }),
  ])

  const now = new Date()
  const totalProjects = projects.length
  const activeProjects = projects.filter((p) => p.status === 'ACTIVE').length
  const totalTasks = tasks.length
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length
  const myTasks = tasks.filter((t) => t.assigneeId === userId && t.status !== 'COMPLETED').length
  const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'COMPLETED').length

  return {
    stats: {
      totalProjects,
      activeProjects,
      totalTasks,
      inProgress,
      completed,
      myTasks,
      overdue,
    },
    recentProjects: projects.slice(0, 4),
    recentTasks: tasks.slice(0, 6),
  }
}

module.exports = {
  getDashboardData,
}
