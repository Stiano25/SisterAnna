import { app, ensureDbInit } from './app.js'
const PORT = process.env.PORT || 3001
ensureDbInit()
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