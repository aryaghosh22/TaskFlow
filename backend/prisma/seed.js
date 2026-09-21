const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const SEED_PASSWORD = 'password123'

const USERS = [
  {
    id: 'usr_1',
    name: 'Arya Ghosh',
    email: 'arya.ghosh@taskflow.app',
    avatarColor: '#4f46e5',
    createdAt: new Date('2025-11-12T09:00:00.000Z'),
  },
  {
    id: 'usr_2',
    name: 'Jordan Lee',
    email: 'jordan.lee@taskflow.app',
    avatarColor: '#0f766e',
    createdAt: new Date('2025-10-02T12:00:00.000Z'),
  },
  {
    id: 'usr_3',
    name: 'Sam Patel',
    email: 'sam.patel@taskflow.app',
    avatarColor: '#c2410c',
    createdAt: new Date('2025-09-18T15:30:00.000Z'),
  },
  {
    id: 'usr_4',
    name: 'Maya Chen',
    email: 'maya.chen@taskflow.app',
    avatarColor: '#7c3aed',
    createdAt: new Date('2026-01-08T10:15:00.000Z'),
  },
]

const PROJECTS = [
  {
    id: 'prj_1',
    name: 'Portfolio Website',
    description: 'Build and deploy a personal portfolio with case studies, resume, and contact flow.',
    status: 'ACTIVE',
    ownerId: 'usr_1',
    deadline: new Date('2026-09-20T00:00:00.000Z'),
    createdAt: new Date('2026-07-14T10:00:00.000Z'),
    updatedAt: new Date('2026-09-01T16:20:00.000Z'),
  },
  {
    id: 'prj_2',
    name: 'E-Commerce Platform',
    description: 'Catalog, cart, and checkout experience for a small retail brand.',
    status: 'ACTIVE',
    ownerId: 'usr_2',
    deadline: new Date('2026-10-15T00:00:00.000Z'),
    createdAt: new Date('2026-06-02T09:30:00.000Z'),
    updatedAt: new Date('2026-08-30T11:05:00.000Z'),
  },
  {
    id: 'prj_3',
    name: 'Mobile Application',
    description: 'Cross-platform companion app for task capture and push reminders.',
    status: 'ACTIVE',
    ownerId: 'usr_4',
    deadline: new Date('2026-11-01T00:00:00.000Z'),
    createdAt: new Date('2026-08-01T14:00:00.000Z'),
    updatedAt: new Date('2026-09-02T08:40:00.000Z'),
  },
  {
    id: 'prj_4',
    name: 'Learning Management System',
    description: 'Course catalog, lessons, quizzes, and progress tracking for internal training.',
    status: 'ACTIVE',
    ownerId: 'usr_3',
    deadline: new Date('2026-12-12T00:00:00.000Z'),
    createdAt: new Date('2026-05-20T08:00:00.000Z'),
    updatedAt: new Date('2026-08-22T17:10:00.000Z'),
  },
  {
    id: 'prj_5',
    name: 'Design System Audit',
    description: 'Inventory existing UI patterns and document a shared component set.',
    status: 'COMPLETED',
    ownerId: 'usr_1',
    deadline: new Date('2026-08-01T00:00:00.000Z'),
    createdAt: new Date('2026-04-10T09:00:00.000Z'),
    updatedAt: new Date('2026-08-01T18:00:00.000Z'),
  },
  {
    id: 'prj_6',
    name: 'Legacy Wiki Migration',
    description: 'Archive outdated docs and migrate remaining pages to the new knowledge base.',
    status: 'ARCHIVED',
    ownerId: 'usr_2',
    deadline: null,
    createdAt: new Date('2026-02-11T09:00:00.000Z'),
    updatedAt: new Date('2026-06-15T12:00:00.000Z'),
  },
]

const TASKS = [
  {
    id: 'tsk_1',
    projectId: 'prj_1',
    title: 'Design homepage layout',
    description: 'Define hero, featured work, and footer structure for desktop and mobile.',
    status: 'COMPLETED',
    priority: 'HIGH',
    assigneeId: 'usr_1',
    dueDate: new Date('2026-08-12T00:00:00.000Z'),
    labels: ['design', 'frontend'],
    createdAt: new Date('2026-07-15T10:00:00.000Z'),
    updatedAt: new Date('2026-08-12T15:00:00.000Z'),
  },
  {
    id: 'tsk_2',
    projectId: 'prj_1',
    title: 'Implement case study pages',
    description: 'Build reusable case study template with metrics, process, and outcomes.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    assigneeId: 'usr_1',
    dueDate: new Date('2026-09-08T00:00:00.000Z'),
    labels: ['frontend'],
    createdAt: new Date('2026-08-01T09:00:00.000Z'),
    updatedAt: new Date('2026-09-01T16:20:00.000Z'),
  },
  {
    id: 'tsk_3',
    projectId: 'prj_1',
    title: 'Add contact form validation',
    description: 'Client-side validation and success/error states before API wiring.',
    status: 'REVIEW',
    priority: 'MEDIUM',
    assigneeId: 'usr_2',
    dueDate: new Date('2026-09-05T00:00:00.000Z'),
    labels: ['frontend'],
    createdAt: new Date('2026-08-18T11:00:00.000Z'),
    updatedAt: new Date('2026-09-01T09:10:00.000Z'),
  },
  {
    id: 'tsk_4',
    projectId: 'prj_1',
    title: 'Deploy to production',
    description: 'Configure hosting, custom domain, and analytics.',
    status: 'TODO',
    priority: 'URGENT',
    assigneeId: 'usr_1',
    dueDate: new Date('2026-09-18T00:00:00.000Z'),
    labels: ['devops'],
    createdAt: new Date('2026-08-20T08:00:00.000Z'),
    updatedAt: new Date('2026-08-20T08:00:00.000Z'),
  },
  {
    id: 'tsk_5',
    projectId: 'prj_2',
    title: 'Product listing filters',
    description: 'Filter catalog by category, price, and availability.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    assigneeId: 'usr_2',
    dueDate: new Date('2026-09-10T00:00:00.000Z'),
    labels: ['frontend', 'catalog'],
    createdAt: new Date('2026-07-02T10:00:00.000Z'),
    updatedAt: new Date('2026-08-30T11:05:00.000Z'),
  },
  {
    id: 'tsk_6',
    projectId: 'prj_2',
    title: 'Checkout payment states',
    description: 'Handle success, failure, and retry states in checkout.',
    status: 'TODO',
    priority: 'URGENT',
    assigneeId: 'usr_3',
    dueDate: new Date('2026-09-14T00:00:00.000Z'),
    labels: ['payments'],
    createdAt: new Date('2026-08-04T13:00:00.000Z'),
    updatedAt: new Date('2026-08-22T09:00:00.000Z'),
  },
  {
    id: 'tsk_7',
    projectId: 'prj_2',
    title: 'Order confirmation email copy',
    description: 'Write transactional email copy for order confirmation.',
    status: 'REVIEW',
    priority: 'LOW',
    assigneeId: 'usr_4',
    dueDate: new Date('2026-09-04T00:00:00.000Z'),
    labels: ['content'],
    createdAt: new Date('2026-08-10T09:00:00.000Z'),
    updatedAt: new Date('2026-08-28T16:00:00.000Z'),
  },
  {
    id: 'tsk_8',
    projectId: 'prj_2',
    title: 'Inventory sync mapping',
    description: 'Map SKU fields from the warehouse export to catalog records.',
    status: 'COMPLETED',
    priority: 'MEDIUM',
    assigneeId: 'usr_3',
    dueDate: new Date('2026-08-20T00:00:00.000Z'),
    labels: ['backend'],
    createdAt: new Date('2026-07-12T09:00:00.000Z'),
    updatedAt: new Date('2026-08-19T17:30:00.000Z'),
  },
  {
    id: 'tsk_9',
    projectId: 'prj_3',
    title: 'Onboarding walkthrough',
    description: 'Three-step first-run experience with skip and complete actions.',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    assigneeId: 'usr_4',
    dueDate: new Date('2026-09-12T00:00:00.000Z'),
    labels: ['mobile', 'ux'],
    createdAt: new Date('2026-08-03T10:00:00.000Z'),
    updatedAt: new Date('2026-09-02T08:40:00.000Z'),
  },
  {
    id: 'tsk_10',
    projectId: 'prj_3',
    title: 'Push notification permissions',
    description: 'Request notification access with a clear rationale screen.',
    status: 'TODO',
    priority: 'HIGH',
    assigneeId: 'usr_1',
    dueDate: new Date('2026-09-22T00:00:00.000Z'),
    labels: ['mobile'],
    createdAt: new Date('2026-08-12T11:00:00.000Z'),
    updatedAt: new Date('2026-08-12T11:00:00.000Z'),
  },
  {
    id: 'tsk_11',
    projectId: 'prj_3',
    title: 'Offline task cache',
    description: 'Persist drafted tasks locally when the device is offline.',
    status: 'TODO',
    priority: 'MEDIUM',
    assigneeId: 'usr_2',
    dueDate: new Date('2026-10-02T00:00:00.000Z'),
    labels: ['mobile'],
    createdAt: new Date('2026-08-16T14:00:00.000Z'),
    updatedAt: new Date('2026-08-16T14:00:00.000Z'),
  },
  {
    id: 'tsk_12',
    projectId: 'prj_4',
    title: 'Quiz scoring rules',
    description: 'Define passing thresholds and retry limits per course.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    assigneeId: 'usr_3',
    dueDate: new Date('2026-09-16T00:00:00.000Z'),
    labels: ['lms'],
    createdAt: new Date('2026-07-01T09:00:00.000Z'),
    updatedAt: new Date('2026-08-22T17:10:00.000Z'),
  },
  {
    id: 'tsk_13',
    projectId: 'prj_4',
    title: 'Course progress dashboard',
    description: 'Show completion percentage and next recommended lesson.',
    status: 'REVIEW',
    priority: 'MEDIUM',
    assigneeId: 'usr_4',
    dueDate: new Date('2026-09-09T00:00:00.000Z'),
    labels: ['frontend', 'lms'],
    createdAt: new Date('2026-07-18T10:00:00.000Z'),
    updatedAt: new Date('2026-08-21T13:20:00.000Z'),
  },
  {
    id: 'tsk_14',
    projectId: 'prj_4',
    title: 'Certificate PDF export',
    description: 'Generate a completion certificate for finished courses.',
    status: 'TODO',
    priority: 'LOW',
    assigneeId: 'usr_1',
    dueDate: new Date('2026-10-20T00:00:00.000Z'),
    labels: ['export'],
    createdAt: new Date('2026-08-08T09:00:00.000Z'),
    updatedAt: new Date('2026-08-08T09:00:00.000Z'),
  },
  {
    id: 'tsk_15',
    projectId: 'prj_5',
    title: 'Component inventory spreadsheet',
    description: 'Catalog buttons, forms, and layout patterns currently in use.',
    status: 'COMPLETED',
    priority: 'MEDIUM',
    assigneeId: 'usr_1',
    dueDate: new Date('2026-07-20T00:00:00.000Z'),
    labels: ['design-system'],
    createdAt: new Date('2026-04-12T09:00:00.000Z'),
    updatedAt: new Date('2026-07-18T16:00:00.000Z'),
  },
  {
    id: 'tsk_16',
    projectId: 'prj_5',
    title: 'Publish usage guidelines',
    description: 'Document do/don’t examples for spacing, color, and type.',
    status: 'COMPLETED',
    priority: 'LOW',
    assigneeId: 'usr_4',
    dueDate: new Date('2026-07-30T00:00:00.000Z'),
    labels: ['docs'],
    createdAt: new Date('2026-05-01T09:00:00.000Z'),
    updatedAt: new Date('2026-07-29T11:00:00.000Z'),
  },
]

async function main() {
  console.log('🌱 Starting TaskFlow database seed...')

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10)

  // Seed Users
  for (const u of USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        avatarColor: u.avatarColor,
        passwordHash,
      },
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        avatarColor: u.avatarColor,
        passwordHash,
        createdAt: u.createdAt,
      },
    })
  }
  console.log(`✅ Seeded ${USERS.length} users`)

  // Seed Projects
  for (const p of PROJECTS) {
    await prisma.project.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        description: p.description,
        status: p.status,
        deadline: p.deadline,
        ownerId: p.ownerId,
        updatedAt: p.updatedAt,
      },
      create: {
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        deadline: p.deadline,
        ownerId: p.ownerId,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      },
    })
  }
  console.log(`✅ Seeded ${PROJECTS.length} projects`)

  // Seed Tasks
  for (const t of TASKS) {
    await prisma.task.upsert({
      where: { id: t.id },
      update: {
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        projectId: t.projectId,
        assigneeId: t.assigneeId,
        dueDate: t.dueDate,
        labels: t.labels,
        updatedAt: t.updatedAt,
      },
      create: {
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        projectId: t.projectId,
        assigneeId: t.assigneeId,
        dueDate: t.dueDate,
        labels: t.labels,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      },
    })
  }
  console.log(`✅ Seeded ${TASKS.length} tasks`)
  console.log('✨ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error while seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
