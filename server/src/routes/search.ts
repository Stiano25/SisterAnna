import express from 'express'
import { allContent, missionCards, categories } from '../data/seed.js'

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

  // Search through regular content
  allContent.forEach(card => {
    const category = categories.find(c => c.id === card.pageId)
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

  // Search through mission cards
  missionCards.forEach(card => {
    const category = categories.find(c => c.id === 'mission')
    if (!category) return

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

  // Remove duplicates and limit results
  const uniqueResults = results.filter((result, index, self) => 
    index === self.findIndex(r => r.id === result.id)
  ).slice(0, 10)

  res.json(uniqueResults)
})

export default router