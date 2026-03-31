import type { Request, Response, NextFunction } from 'express'
import { randomUUID } from 'crypto'
import { dbEnabled, pool } from '../db.js'

const sessions = new Map<string, string>()

interface LoginBody {
  email?: string
  password?: string
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

  const token = randomUUID()
  sessions.set(token, admin.email)
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
  if (!sessions.has(token)) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  next()
}

