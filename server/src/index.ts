import express from 'express'
import cors from 'cors'
import contentRoutes from './routes/content.js'
import searchRoutes from './routes/search.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Routes
app.use('/api', contentRoutes)
app.use('/api', searchRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})