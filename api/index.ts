import { app, ensureDbInit } from '../server/src/app.js'

export default async function handler(req: any, res: any) {
  try {
    await ensureDbInit()
  } catch (err) {
    console.error('Vercel API init error:', err)
  }
  return app(req, res)
}

