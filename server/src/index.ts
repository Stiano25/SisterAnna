import dotenv from 'dotenv'
import path from 'path'
import express from 'express'
import cors from 'cors'
import contentRoutes from './routes/content.js'
import searchRoutes from './routes/search.js'
import imagesRoutes from './routes/images.js'
import adminRoutes from './routes/admin.js'
import { initDb } from './db.js'

// Load env from both `server/.env` and repo-root `.env` (root takes precedence if present).
dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') })

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Routes
app.use('/api', contentRoutes)
app.use('/api', searchRoutes)
app.use('/api', imagesRoutes)
app.use('/api/admin', adminRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

initDb()
  .then((dbOk) => {
    if (!dbOk) {
      console.warn('Server starting without Neon database (see errors above). Static seed data is used; admin/DB routes return 503 until the DB connects.')
    }
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Unexpected error during database init:', err)
    process.exit(1)
  })