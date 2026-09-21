const app = require('./app')
const env = require('./config/env')
const prisma = require('./config/prisma')

const PORT = env.PORT || 5000

async function startServer() {
  // Test Database Connectivity
  if (!env.DATABASE_URL || env.DATABASE_URL.includes('[INSERT-CONNECTION-HERE]')) {
    console.warn('\n' + '='.repeat(70))
    console.warn('DATABASE NOTICE:')
    console.warn('   DATABASE_URL in backend/.env contains [INSERT-CONNECTION-HERE].')
    console.warn('   To connect to a live PostgreSQL/Neon database:')
    console.warn('   1. Paste your connection string into backend/.env')
    console.warn('   2. Run: npm run db:push --prefix backend')
    console.warn('   3. Run: npm run db:seed --prefix backend')
    console.warn('='.repeat(70) + '\n')
  } else {
    try {
      await prisma.$connect()
      console.log('Connected to PostgreSQL database via Prisma')
    } catch (err) {
      console.error('Failed to connect to PostgreSQL database:', err.message)
      console.warn('   Please verify your DATABASE_URL in backend/.env.')
    }
  }

  const server = app.listen(PORT, () => {
    console.log(`TaskFlow REST API server running on http://localhost:${PORT}`)
    console.log(`   Health check: http://localhost:${PORT}/api/health`)
  })

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`)
    server.close(async () => {
      try {
        await prisma.$disconnect()
        console.log('Prisma disconnected. Server terminated cleanly.')
      } catch (err) {
        console.error('Error during database disconnection:', err)
      }
      process.exit(0)
    })
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

startServer()
