const { test, describe, before, after } = require('node:test')
const assert = require('node:assert')
const http = require('node:http')
const app = require('../src/app')
const { signToken } = require('../src/utils/jwt')

describe('TaskFlow REST API Test Suite', () => {
  let server
  let baseUrl

  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port
        baseUrl = `http://localhost:${port}`
        resolve()
      })
    })
  })

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve))
    }
  })

  describe('1. System & Health Check', () => {
    test('GET /api/health should return 200 with standard health status', async () => {
      const res = await fetch(`${baseUrl}/api/health`)
      const data = await res.json()

      assert.strictEqual(res.status, 200)
      assert.strictEqual(data.success, true)
      assert.strictEqual(data.message, 'TaskFlow API is running')
      assert.ok(data.database !== undefined)
    })

    test('GET /api/does-not-exist should return 404 JSON', async () => {
      const res = await fetch(`${baseUrl}/api/does-not-exist`)
      const data = await res.json()

      assert.strictEqual(res.status, 404)
      assert.strictEqual(data.success, false)
      assert.match(data.message, /not found/i)
    })
  })

  describe('2. Input Validation (422 Unprocessable Entity)', () => {
    test('POST /api/auth/register with empty body should return 422 with validation errors', async () => {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()

      assert.strictEqual(res.status, 422)
      assert.strictEqual(data.success, false)
      assert.strictEqual(data.message, 'Validation failed')
      assert.ok(data.errors)
      assert.ok(data.errors.name)
      assert.ok(data.errors.email)
      assert.ok(data.errors.password)
    })

    test('POST /api/auth/register with invalid email and short password should return 422', async () => {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'A',
          email: 'not-an-email',
          password: 'short',
        }),
      })
      const data = await res.json()

      assert.strictEqual(res.status, 422)
      assert.strictEqual(data.success, false)
      assert.ok(data.errors.email)
      assert.ok(data.errors.password)
    })

    test('POST /api/auth/login with missing credentials should return 422', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()

      assert.strictEqual(res.status, 422)
      assert.strictEqual(data.success, false)
      assert.ok(data.errors.email)
      assert.ok(data.errors.password)
    })
  })

  describe('3. Authentication Middleware & Token Verification', () => {
    test('Protected route GET /api/projects without token should return 401', async () => {
      const res = await fetch(`${baseUrl}/api/projects`)
      const data = await res.json()

      assert.strictEqual(res.status, 401)
      assert.strictEqual(data.success, false)
      assert.match(data.message, /token is required/i)
    })

    test('Protected route GET /api/tasks without token should return 401', async () => {
      const res = await fetch(`${baseUrl}/api/tasks`)
      const data = await res.json()

      assert.strictEqual(res.status, 401)
      assert.strictEqual(data.success, false)
    })

    test('Protected route GET /api/users/me without token should return 401', async () => {
      const res = await fetch(`${baseUrl}/api/users/me`)
      const data = await res.json()

      assert.strictEqual(res.status, 401)
      assert.strictEqual(data.success, false)
    })

    test('Protected route with invalid Bearer token should return 401', async () => {
      const res = await fetch(`${baseUrl}/api/projects`, {
        headers: { Authorization: 'Bearer this-is-a-completely-fake-jwt-token' },
      })
      const data = await res.json()

      assert.strictEqual(res.status, 401)
      assert.strictEqual(data.success, false)
      assert.match(data.message, /invalid/i)
    })

    test('Protected route with malformed Authorization header should return 401', async () => {
      const res = await fetch(`${baseUrl}/api/projects`, {
        headers: { Authorization: 'Basic user:pass' },
      })
      const data = await res.json()

      assert.strictEqual(res.status, 401)
      assert.strictEqual(data.success, false)
    })
  })

  describe('4. Security Headers & CORS Policy', () => {
    test('Responses should include Helmet security headers', async () => {
      const res = await fetch(`${baseUrl}/api/health`)

      assert.ok(res.headers.get('x-content-type-options'))
      assert.ok(res.headers.get('x-frame-options') || res.headers.get('content-security-policy'))
      assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff')
    })

    test('CORS headers should be present for allowed origin', async () => {
      const res = await fetch(`${baseUrl}/api/health`, {
        headers: { Origin: 'http://localhost:5173' },
      })

      assert.strictEqual(res.headers.get('access-control-allow-credentials'), 'true')
    })
  })

  describe('5. JWT Generation and Decryption Integrity', () => {
    test('signToken generates valid signed JWT and verifyToken extracts payload', () => {
      const { signToken, verifyToken } = require('../src/utils/jwt')
      const payload = { userId: 'usr_test_123' }
      const token = signToken(payload)

      assert.ok(typeof token === 'string' && token.length > 20)

      const decoded = verifyToken(token)
      assert.strictEqual(decoded.userId, 'usr_test_123')
      assert.ok(decoded.exp)
    })
  })
})
