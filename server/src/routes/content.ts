import express from 'express'
import { categories, quickLinks, allContent, missionCards } from '../data/seed.js'

const router = express.Router()

// Get all categories
router.get('/categories', (req, res) => {
  res.json(categories)
})

// Get all content
router.get('/content', (req, res) => {
  res.json({
    categories,
    quickLinks,
    content: allContent,
    missionCards
  })
})

// Get content for a specific page
router.get('/content/:pageId', (req, res) => {
  const { pageId } = req.params
  
  if (pageId === 'mission') {
    const content = missionCards
    const category = categories.find(c => c.id === pageId)
    
    res.json({
      category,
      content,
      quote: "Her mission continues through those who carry forward her work of mercy and devotion."
    })
  } else {
    const content = allContent.filter(card => card.pageId === pageId)
    const category = categories.find(c => c.id === pageId)
    
    const quotes: Record<string, string> = {
      visions: "I saw Jesus Christ in a vision. He spoke to me about the Eucharist and the need for devotion.",
      life: "She was born Hadija, but God called her to become Sister Anna Ali, a vessel of His mercy.",
      stigmata: "Every Thursday for 25 years, she wept tears of blood, sharing in Christ's passion.",
      miracles: "Even in death, God continues to work wonders through her intercession.",
      book: "Her book contains the divine messages she received about the Eucharist and proper worship."
    }
    
    res.json({
      category,
      content,
      quote: quotes[pageId] || ""
    })
  }
})

export default router