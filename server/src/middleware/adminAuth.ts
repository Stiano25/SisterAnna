import type { Request, Response, NextFunction } from 'express'
import { createHmac, timingSafeEqual } from 'crypto'
import { dbEnabled, pool } from '../db.js'

const TOKEN_TTL_SECONDS = 60 * 60 * 12 // 12 hours
const signingSecret = process.env.ADMIN_TOKEN_SECRET || process.env.ADMIN_PASSWORD || 'sister-anna-admin-secret'

interface LoginBody {
  email?: string
  password?: string
}

function toBase64Url(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function signPayload(payloadBase64: string) {
  return createHmac('sha256', signingSecret).update(payloadBase64).digest('base64url')
}

function createToken(email: string) {
  const payload = JSON.stringify({
    email,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
  })
  const payloadBase64 = toBase64Url(payload)
  const signature = signPayload(payloadBase64)
  return `${payloadBase64}.${signature}`
}

function verifyToken(token: string) {
  const [payloadBase64, signature] = token.split('.')
  if (!payloadBase64 || !signature) return false
  const expectedSignature = signPayload(payloadBase64)
  const expected = Buffer.from(expectedSignature)
  const actual = Buffer.from(signature)
  if (expected.length !== actual.length) return false
  if (!timingSafeEqual(expected, actual)) return false

  try {
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8')) as {
      email?: string
      exp?: number
    }
    if (!payload.email || !payload.exp) return false
    if (payload.exp < Math.floor(Date.now() / 1000)) return false
    return true
  } catch {
    return false
  }
}

export async function adminLogin(req: Request, res: Response) {
  if (!dbEnabled || !pool) {
    res.status(503).json({ error: 'Neon DB not configured (NEON_DATABASE_URL missing)' })
    return
  }

  const body = req.body as LoginBody
  const email = body.email?.trim()
  const password = body.password

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }

  const r = await pool.query<{ email: string; password: string }>(
    'SELECT email, password FROM admin_users WHERE email=$1',
    [email]
  )

  const admin = r.rows[0]
  if (!admin || admin.password !== password) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  const token = createToken(admin.email)
  res.json({ token })
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  // Expected format: `Authorization: Bearer <password>`
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const token = authHeader.slice('Bearer '.length)
  if (!verifyToken(token)) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  next()
}

