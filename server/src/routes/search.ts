import express from 'express'
import { allContent, missionCards, categories } from '../data/seed.js'
import { pool, dbEnabled } from '../db.js'

const router = express.Router()

interface SearchResult {
  id: string
  title: string
  category: string
  pageId: string
  excerpt?: string
}

router.get('/search', (req, res) => {
  const query = req.query.q as string
  
  if (!query || query.trim().length === 0) {
    return res.json([])
  }

  const searchTerm = query.toLowerCase().trim()
  const results: SearchResult[] = []

  if (!dbEnabled || !pool) {
    // Fallback to seed data if Neon isn't configured.
    allContent.forEach((card) => {
      const category = categories.find((c) => c.id === card.pageId)
      if (!category) return

      const titleMatch = card.title.toLowerCase().includes(searchTerm)
      const bodyMatch = card.body.toLowerCase().includes(searchTerm)
      const eyebrowMatch = card.eyebrow.toLowerCase().includes(searchTerm)
      const tagMatch = card.tag.toLowerCase().includes(searchTerm)
      const categoryMatch = category.label.toLowerCase().includes(searchTerm)

      if (titleMatch || bodyMatch || eyebrowMatch || tagMatch || categoryMatch) {
        results.push({
          id: card.id,
          title: card.title,
          category: category.label,
          pageId: card.pageId,
          excerpt: card.body.substring(0, 120) + '...'
        })
      }
    })

    missionCards.forEach((card) => {
      const titleMatch = card.title.toLowerCase().includes(searchTerm)
      const bodyMatch = card.body.toLowerCase().includes(searchTerm)
      const eyebrowMatch = card.eyebrow.toLowerCase().includes(searchTerm)
      const tagMatch = card.tag.toLowerCase().includes(searchTerm)
      const statusMatch = card.status.toLowerCase().includes(searchTerm)

      if (titleMatch || bodyMatch || eyebrowMatch || tagMatch || statusMatch) {
        results.push({
          id: card.id,
          title: card.title,
          category: 'Mission',
          pageId: 'mission',
          excerpt: card.body.substring(0, 120) + '...'
        })
      }
    })

    const uniqueResults = results
      .filter((result, index, self) => index === self.findIndex((r) => r.id === result.id))
      .slice(0, 10)
    res.json(uniqueResults)
    return
  }

  // Search story topics from DB (summaryText is stored for fast searching).
  pool
    .query(
      `
      SELECT
        t.id,
        t.title,
        c.label AS category,
        t.categoryId AS pageId,
        t.summaryText AS summary
      FROM topics t
      JOIN categories c ON c.id = t.categoryId
      WHERE (
        LOWER(t.title) LIKE $1 OR
        LOWER(t.summaryText) LIKE $1 OR
        LOWER(t.eyebrow) LIKE $1 OR
        LOWER(t.tag) LIKE $1 OR
        LOWER(COALESCE(t.mission_status, '')) LIKE $1 OR
        LOWER(COALESCE(t.support_link, '')) LIKE $1 OR
        LOWER(c.label) LIKE $1
      )
      ORDER BY t.updatedAt DESC
      LIMIT 10
      `,
      [`%${searchTerm}%`]
    )
    .then((r: { rows: any[] }) => {
      results.push(
        ...r.rows.map((row: any) => ({
          id: row.id,
          title: row.title,
          category: row.category,
          pageId: row.pageId,
          excerpt: row.summary.substring(0, 120) + '...'
        }))
      )

      // Remove duplicates and limit results.
      const uniqueResults = results
        .filter((result, index, self) => index === self.findIndex((r) => r.id === result.id))
        .slice(0, 10)

      res.json(uniqueResults)
    })
    .catch((err: unknown) => {
      console.error(err)
      res.status(500).json({ error: 'Search failed' })
    })
})

export default router