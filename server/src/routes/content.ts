import express from 'express'
import { categories, quickLinks, allContent, missionCards } from '../data/seed.js'
import { pool, dbEnabled } from '../db.js'

const router = express.Router()

// Get all categories
router.get('/categories', (req, res) => {
  if (!dbEnabled || !pool) {
    res.json(categories)
    return
  }
  pool
    .query(
      'SELECT id, label, sublabel, iconName, sortOrder FROM categories ORDER BY sortOrder, id ASC'
    )
    .then((r: { rows: any[] }) => res.json(r.rows))
    .catch((err: unknown) => {
      console.error(err)
      res.status(500).json({ error: 'Failed to load categories' })
    })
})

// Get all content
router.get('/content', (req, res) => {
  if (!dbEnabled || !pool) {
    res.json({
      categories,
      quickLinks,
      content: allContent,
      missionCards
    })
    return
  }
  Promise.all([
    pool.query('SELECT id, label, sublabel, iconName, sortOrder FROM categories ORDER BY sortOrder, id ASC'),
    pool.query(
      `
      SELECT
        t.id,
        t.categoryId AS pageId,
        t.eyebrow,
        t.title,
        t.tag,
        t.summaryText AS body,
        t.sortOrder,
        cb.blocks
      FROM topics t
      JOIN topic_content_blocks cb ON cb.topicId = t.id
      ORDER BY t.sortOrder, t.updatedAt DESC
      `
    )
  ])
    .then(([categoriesRes, topicsRes]: [{ rows: any[] }, { rows: any[] }]) => {
      res.json({
        categories: categoriesRes.rows.map((c: any) => ({
          id: c.id,
          label: c.label,
          sublabel: c.sublabel,
          iconName: c.iconName
        })),
        quickLinks,
        content: topicsRes.rows,
        missionCards
      })
    })
    .catch((err: unknown) => {
      console.error(err)
      res.status(500).json({ error: 'Failed to load content' })
    })
})

// Get content for a specific page
router.get('/content/:pageId', (req, res) => {
  const { pageId } = req.params

  const quotes: Record<string, string> = {
    visions: 'I saw Jesus Christ in a vision. He spoke to me about the Eucharist and the need for devotion.',
    life: 'She was born Hadija, but God called her to become Sister Anna Ali, a vessel of His mercy.',
    stigmata: 'Every Thursday for 25 years, she wept tears of blood, sharing in Christ\'s passion.',
    miracles: 'Even in death, God continues to work wonders through her intercession.',
    book: 'Her book contains the divine messages she received about the Eucharist and proper worship.'
  }

  if (pageId === 'mission') {
    res.json({
      category: categories.find((c) => c.id === pageId) || null,
      content: missionCards,
      quote: 'Her mission continues through those who carry forward her work of mercy and devotion.'
    })
    return
  }

  if (!dbEnabled || !pool) {
    const content = allContent.filter((card) => card.pageId === pageId)
    const category = categories.find((c) => c.id === pageId) || null
    res.json({
      category,
      content,
      quote: quotes[pageId] || ''
    })
    return
  }

  // Story topics from DB
  Promise.all([
    pool.query(
      'SELECT id, label, sublabel, iconName FROM categories WHERE id=$1',
      [pageId]
    ),
    pool.query(
      `
      SELECT
        t.id,
        t.categoryId,
        t.eyebrow,
        t.title,
        t.tag,
        t.summaryText AS body,
        t.sortOrder,
        cb.blocks
      FROM topics t
      JOIN topic_content_blocks cb ON cb.topicId = t.id
      WHERE t.categoryId = $1
      ORDER BY t.sortOrder, t.updatedAt DESC
      `,
      [pageId]
    )
  ])
    .then(([categoryRes, topicsRes]: [{ rows: any[] }, { rows: any[] }]) => {
      const category = categoryRes.rows[0] || null
      const content = topicsRes.rows.map((r: any) => ({
        id: r.id,
        pageId: r.categoryId,
        eyebrow: r.eyebrow,
        title: r.title,
        tag: r.tag,
        body: r.body,
        blocks: r.blocks
      }))

      res.json({
        category,
        content,
        quote: quotes[pageId] || ''
      })
    })
    .catch((err: unknown) => {
      console.error(err)
      res.status(500).json({ error: 'Failed to load content' })
    })
})

export default router