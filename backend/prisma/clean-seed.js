const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const SEED_USER_IDS = ['usr_1', 'usr_2', 'usr_3', 'usr_4']
const SEED_PROJECT_IDS = ['prj_1', 'prj_2', 'prj_3', 'prj_4', 'prj_5', 'prj_6']

async function cleanSeedData() {
  console.log('🧹 Starting cleanup of demo seed data from database...')

  // 1. Delete tasks belonging to seed projects or assigned to seed users
  const deletedTasks = await prisma.task.deleteMany({
    where: {
      OR: [
        { projectId: { in: SEED_PROJECT_IDS } },
        { assigneeId: { in: SEED_USER_IDS } },
      ],
    },
  })
  console.log(`✅ Deleted ${deletedTasks.count} demo tasks`)

  // 2. Delete seed projects
  const deletedProjects = await prisma.project.deleteMany({
    where: {
      OR: [
        { id: { in: SEED_PROJECT_IDS } },
        { ownerId: { in: SEED_USER_IDS } },
      ],
    },
  })
  console.log(`✅ Deleted ${deletedProjects.count} demo projects`)

  // 3. Delete seed users
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      id: { in: SEED_USER_IDS },
    },
  })
  console.log(`✅ Deleted ${deletedUsers.count} demo users (${SEED_USER_IDS.join(', ')})`)

  // 4. Verify remaining users
  const remainingUsers = await prisma.user.findMany({
    select: { id: true, name: true, email: true, createdAt: true },
  })

  console.log('\n✨ Database is clean! Preserved accounts:')
  remainingUsers.forEach((u) => {
    console.log(` - [${u.id}] ${u.name} (${u.email})`)
  })
}

cleanSeedData()
  .catch((e) => {
    console.error('❌ Error while cleaning seed data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
