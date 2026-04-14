import express from 'express'
import { categories, quickLinks, allContent, missionCards } from '../data/seed.js'
import { pool, dbEnabled } from '../db.js'
import { normalizeCategoryRow, normalizeCategoryRows } from '../normalize/categoryRow.js'

const router = express.Router()

const VALID_MISSION_STATUS = new Set(['in-progress', 'unfunded', 'ongoing', 'planned'])

function normalizeMissionStatus(s: string | null | undefined): 'in-progress' | 'unfunded' | 'ongoing' | 'planned' {
  if (s && VALID_MISSION_STATUS.has(s)) return s as 'in-progress' | 'unfunded' | 'ongoing' | 'planned'
  return 'ongoing'
}

const quotes: Record<string, string> = {
  visions: 'I saw Jesus Christ in a vision. He spoke to me about the Eucharist and the need for devotion.',
  life: 'She was born Hadija, but God called her to become Sister Anna Ali, a vessel of His mercy.',
  stigmata: 'Every Thursday for 25 years, she wept tears of blood, sharing in Christ\'s passion.',
  miracles: 'Even in death, God continues to work wonders through her intercession.',
  book: 'Her book contains the divine messages she received about the Eucharist and proper worship.',
  mission: 'Her mission continues through those who carry forward her work of mercy and devotion.'
}

function mapDbTopicRow(r: any, pageId: string) {
  const base = {
    id: r.id,
    pageId: r.categoryId ?? r.categoryid ?? r.pageId ?? r.pageid ?? pageId,
    eyebrow: r.eyebrow,
    title: r.title,
    tag: r.tag,
    body: r.body,
    blocks: r.blocks,
    videoUrl: r.video_url ?? undefined,
    eventDate: r.event_date ?? undefined,
    recordingUrl: r.recording_url ?? undefined,
    thumbnailImageId: r.thumbnail_image_id ?? undefined
  }
  if (pageId === 'mission' || r.mission_status != null || (r.support_link != null && r.support_link !== '')) {
    return {
      ...base,
      status: normalizeMissionStatus(r.mission_status),
      ...(r.support_link ? { supportLink: r.support_link } : {})
    }
  }
  return base
}

// Get all categories
router.get('/categories', (req, res) => {
  if (!dbEnabled || !pool) {
    res.json(categories)
    return
  }
  pool
    .query(
      'SELECT id, label, sublabel, iconName, sortOrder, card_color, text_color FROM categories ORDER BY sortOrder, id ASC'
    )
    .then((r: { rows: any[] }) => res.json(normalizeCategoryRows(r.rows)))
    .catch((err: unknown) => {
      console.error(err)
      res.status(500).json({ error: 'Failed to load categories' })
    })
})

// Get all content
router.get('/content', (req, res) => {
  if (!dbEnabled || !pool) {
    const missionAsTopics = missionCards.map((m) => ({
      id: m.id,
      pageId: m.pageId,
      eyebrow: m.eyebrow,
      title: m.title,
      tag: m.tag,
      body: m.body,
      blocks: [{ type: 'text', value: m.body }],
      status: m.status,
      ...(m.supportLink ? { supportLink: m.supportLink } : {})
    }))
    res.json({
      categories,
      quickLinks,
      content: [...allContent, ...missionAsTopics]
    })
    return
  }
  Promise.all([
    pool.query(
      'SELECT id, label, sublabel, iconName, sortOrder, card_color, text_color FROM categories ORDER BY sortOrder, id ASC'
    ),
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
        t.mission_status,
        t.support_link,
        t.video_url,
        t.event_date,
        t.recording_url,
        t.thumbnail_image_id,
        cb.blocks
      FROM topics t
      JOIN topic_content_blocks cb ON cb.topicId = t.id
      ORDER BY t.categoryId, t.sortOrder, t.updatedAt DESC
      `
    )
  ])
    .then(([categoriesRes, topicsRes]: [{ rows: any[] }, { rows: any[] }]) => {
      res.json({
        categories: normalizeCategoryRows(categoriesRes.rows).map(
          ({ id, label, sublabel, iconName, cardColor, textColor }) => ({
            id,
            label,
            sublabel,
            iconName,
            ...(cardColor !== undefined ? { cardColor } : {}),
            ...(textColor !== undefined ? { textColor } : {})
          })
        ),
        quickLinks,
        content: topicsRes.rows.map((r: any) => mapDbTopicRow(r, r.pageId))
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

  if (!dbEnabled || !pool) {
    if (pageId === 'mission') {
      const content = missionCards.map((m) => ({
        id: m.id,
        pageId: m.pageId,
        eyebrow: m.eyebrow,
        title: m.title,
        tag: m.tag,
        body: m.body,
        blocks: [{ type: 'text', value: m.body }],
        status: m.status,
        ...(m.supportLink ? { supportLink: m.supportLink } : {})
      }))
      res.json({
        category: categories.find((c) => c.id === pageId) || null,
        content,
        quote: quotes[pageId] || ''
      })
      return
    }
    const content = allContent.filter((card) => card.pageId === pageId)
    const category = categories.find((c) => c.id === pageId) || null
    res.json({
      category,
      content,
      quote: quotes[pageId] || ''
    })
    return
  }

  Promise.all([
    pool.query(
      'SELECT id, label, sublabel, iconName, card_color, text_color FROM categories WHERE id=$1',
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
        t.mission_status,
        t.support_link,
        t.video_url,
        t.event_date,
        t.recording_url,
        t.thumbnail_image_id,
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
      const category = normalizeCategoryRow(categoryRes.rows[0])
      const content = topicsRes.rows.map((r: any) => mapDbTopicRow(r, pageId))

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
