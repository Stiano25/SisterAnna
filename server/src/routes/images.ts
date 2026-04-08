import express from 'express'
import { dbEnabled, pool } from '../db.js'

const router = express.Router()

router.get('/gallery/categories', async (req, res) => {
  if (!dbEnabled || !pool) {
    res.status(503).json({ error: 'Gallery not available (Neon DB not configured)' })
    return
  }

  try {
    const r = await pool.query(
      `
      SELECT id, name, sortOrder AS "sortOrder", createdAt AS "createdAt"
      FROM gallery_categories
      ORDER BY sortOrder, createdAt DESC
      `
    )
    res.json(r.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load gallery categories' })
  }
})

router.get('/gallery/images', async (req, res) => {
  if (!dbEnabled || !pool) {
    res.status(503).json({ error: 'Gallery not available (Neon DB not configured)' })
    return
  }

  try {
    const r = await pool.query(
      `
      SELECT
        gi.id,
        gi.alt,
        gi.filename,
        gi.sortOrder AS "sortOrder",
        gi.createdAt AS "createdAt",
        COALESCE(gi.categoryId, 'uncategorized') AS "categoryId",
        COALESCE(gc.name, 'Uncategorized') AS "categoryName"
      FROM gallery_images gi
      LEFT JOIN gallery_categories gc ON gc.id = gi.categoryId
      ORDER BY gc.sortOrder, gi.sortOrder, gi.createdAt DESC
      `
    )
    res.json(r.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load gallery images' })
  }
})

router.get('/images/:imageId', async (req, res) => {
  const { imageId } = req.params

  if (!dbEnabled || !pool) {
    res.status(503).json({ error: 'Images not available (Neon DB not configured)' })
    return
  }

  try {
    const r = await pool.query(
      `
      SELECT id, alt, mimeType, data
      FROM images
      WHERE id=$1
      `,
      [imageId]
    )

    const row = r.rows[0]
    if (!row) {
      res.status(404).json({ error: 'Image not found' })
      return
    }

    // Some existing rows may have `mimeType` missing/undefined (older imports/schema differences).
    // Express will throw if we set an invalid header value, so we fall back to a safe default.
    const mimeType = typeof row.mimeType === 'string' && row.mimeType.trim() ? row.mimeType : 'application/octet-stream'
    res.setHeader('Content-Type', mimeType)
    res.send(row.data)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load image' })
  }
})

router.get('/images/:imageId/meta', async (req, res) => {
  const { imageId } = req.params
  if (!dbEnabled || !pool) {
    res.status(503).json({ error: 'Images not available (Neon DB not configured)' })
    return
  }
  try {
    const r = await pool.query(
      `
      SELECT id, alt
      FROM images
      WHERE id=$1
      `,
      [imageId]
    )
    const row = r.rows[0]
    if (!row) {
      res.status(404).json({ error: 'Image not found' })
      return
    }
    res.json({ id: row.id, alt: row.alt || '' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load image metadata' })
  }
})

router.get('/images/gallery/:imageId', async (req, res) => {
  const { imageId } = req.params

  if (!dbEnabled || !pool) {
    res.status(503).json({ error: 'Images not available (Neon DB not configured)' })
    return
  }

  try {
    const r = await pool.query(
      `
      SELECT id, alt, mimeType, data
      FROM gallery_images
      WHERE id=$1
      `,
      [imageId]
    )

    const row = r.rows[0]
    if (!row) {
      res.status(404).json({ error: 'Image not found' })
      return
    }

    const mimeType = typeof row.mimeType === 'string' && row.mimeType.trim() ? row.mimeType : 'application/octet-stream'
    res.setHeader('Content-Type', mimeType)
    res.send(row.data)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load image' })
  }
})

router.get('/images/gallery/:imageId/meta', async (req, res) => {
  const { imageId } = req.params
  if (!dbEnabled || !pool) {
    res.status(503).json({ error: 'Images not available (Neon DB not configured)' })
    return
  }
  try {
    const r = await pool.query(
      `
      SELECT id, alt
      FROM gallery_images
      WHERE id=$1
      `,
      [imageId]
    )
    const row = r.rows[0]
    if (!row) {
      res.status(404).json({ error: 'Image not found' })
      return
    }
    res.json({ id: row.id, alt: row.alt || '' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load gallery image metadata' })
  }
})

export default router

