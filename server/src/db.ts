import dotenv from 'dotenv'
import path from 'path'
import { Pool } from 'pg'
import { categories as seedCategories, allContent as seedTopics, missionCards as seedMissionCards } from './data/seed.js'
import { randomUUID } from 'crypto'

// Ensure env vars are loaded even if this module initializes before `index.ts`.
dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') })

const DATABASE_URL = process.env.NEON_DATABASE_URL

/** Set false if NEON_DATABASE_URL is missing or DB init fails at startup. */
export let dbEnabled = Boolean(DATABASE_URL)

function createPool(): Pool | null {
  if (!DATABASE_URL) return null
  return new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 15_000
  })
}

export let pool: Pool | null = createPool()

function isUnreachableDbError(err: unknown): boolean {
  const e = err as { code?: string; errors?: Array<{ code?: string }> }
  if (e?.code === 'ETIMEDOUT' || e?.code === 'ECONNREFUSED' || e?.code === 'ENOTFOUND') return true
  if (Array.isArray(e?.errors)) {
    return e.errors.some((x) => x?.code === 'ETIMEDOUT' || x?.code === 'ECONNREFUSED')
  }
  return false
}

type ContentBlock =
  | { type: 'text'; value: string }
  | { type: 'image'; imageId: string }

const computeBlocksFromBody = (body: string): ContentBlock[] => [{ type: 'text', value: body }]

const computeSummaryFromBody = (body: string): string => {
  const text = body.trim()
  if (!text) return ''
  const maxLen = 180
  if (text.length <= maxLen) return text
  const slice = text.slice(0, maxLen)
  const lastSpace = slice.lastIndexOf(' ')
  const trimmed = (lastSpace > 40 ? slice.slice(0, lastSpace) : slice).trimEnd()
  return `${trimmed}…`
}

const initSql = `
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  sublabel TEXT NOT NULL,
  iconName TEXT NOT NULL,
  sortOrder INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY,
  categoryId TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  eyebrow TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  tag TEXT NOT NULL DEFAULT '',
  sortOrder INT NOT NULL DEFAULT 0,
  summaryText TEXT NOT NULL DEFAULT '',
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS topic_content_blocks (
  topicId TEXT PRIMARY KEY REFERENCES topics(id) ON DELETE CASCADE,
  blocks JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS images (
  id TEXT PRIMARY KEY,
  topicId TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  alt TEXT NOT NULL DEFAULT '',
  mimeType TEXT NOT NULL,
  filename TEXT NOT NULL,
  data BYTEA NOT NULL,
  sortOrder INT NOT NULL DEFAULT 0,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gallery_images (
  id TEXT PRIMARY KEY,
  categoryId TEXT,
  alt TEXT NOT NULL DEFAULT '',
  mimeType TEXT NOT NULL,
  filename TEXT NOT NULL,
  data BYTEA NOT NULL,
  sortOrder INT NOT NULL DEFAULT 0,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gallery_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  sortOrder INT NOT NULL DEFAULT 0,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_users (
  email TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE topics ADD COLUMN IF NOT EXISTS mission_status TEXT;
ALTER TABLE topics ADD COLUMN IF NOT EXISTS support_link TEXT;
ALTER TABLE gallery_images ADD COLUMN IF NOT EXISTS categoryId TEXT;
`

/** Categories are seeded separately; $1–$9 = topic row, $10 = blocks JSON. */
const seedSql = `
INSERT INTO topics (id, categoryId, eyebrow, title, tag, sortOrder, summaryText, mission_status, support_link, updatedAt)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
ON CONFLICT (id) DO UPDATE
SET eyebrow = EXCLUDED.eyebrow,
    title = EXCLUDED.title,
    tag = EXCLUDED.tag,
    sortOrder = EXCLUDED.sortOrder,
    summaryText = EXCLUDED.summaryText,
    mission_status = EXCLUDED.mission_status,
    support_link = EXCLUDED.support_link,
    updatedAt = NOW();

INSERT INTO topic_content_blocks (topicId, blocks)
VALUES ($1, $10::jsonb)
ON CONFLICT (topicId) DO UPDATE
SET blocks = EXCLUDED.blocks;
`

const seedImagesSql = `
-- Images are not present in seed.ts, but the table exists for admin uploads.
SELECT 1;
`

export async function initDb() {
  if (!pool) return false

  try {
    await pool.query(initSql)

    // Seed only if categories table is empty.
    const categoriesCount = await pool.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM categories')

    if (categoriesCount.rows[0]?.count === '0') {
      await Promise.all(
        seedCategories.map(async (cat, idx) => {
          await pool!.query(
            'INSERT INTO categories (id, label, sublabel, iconName, sortOrder) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
            [cat.id, cat.label, cat.sublabel, cat.iconName, idx]
          )
        })
      )

      // Seed story topics (image blocks start empty).
      await Promise.all(
        seedTopics.map(async (t, idx) => {
          const blocks = computeBlocksFromBody(t.body)
          const summary = computeSummaryFromBody(t.body)
          await pool!.query(seedSql, [
            t.id,
            t.pageId,
            t.eyebrow,
            t.title,
            t.tag,
            idx,
            summary,
            null,
            null,
            JSON.stringify(blocks)
          ])
        })
      )

      await Promise.all(
        seedMissionCards.map(async (t, idx) => {
          const blocks = computeBlocksFromBody(t.body)
          const summary = computeSummaryFromBody(t.body)
          await pool!.query(seedSql, [
            t.id,
            t.pageId,
            t.eyebrow,
            t.title,
            t.tag,
            idx,
            summary,
            t.status,
            t.supportLink ?? null,
            JSON.stringify(blocks)
          ])
        })
      )
    }

    // Ensure gallery categories exist and existing images are assigned.
    await pool.query(
      `
      INSERT INTO gallery_categories (id, name, sortOrder)
      VALUES ('general', 'General', 0)
      ON CONFLICT (id) DO NOTHING
      `
    )
    await pool.query(
      `
      UPDATE gallery_images
      SET categoryId = 'general'
      WHERE categoryId IS NULL OR categoryId = ''
      `
    )
    await pool.query(
      `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.table_constraints
          WHERE table_name='gallery_images'
            AND constraint_name='gallery_images_category_fk'
        ) THEN
          ALTER TABLE gallery_images
          ADD CONSTRAINT gallery_images_category_fk
          FOREIGN KEY (categoryId) REFERENCES gallery_categories(id) ON DELETE RESTRICT;
        END IF;
      END $$;
      `
    )

    // Ensure at least one admin user exists in DB.
    const adminCount = await pool.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM admin_users')
    if (adminCount.rows[0]?.count === '0') {
      const defaultEmail = process.env.ADMIN_EMAIL || 'CTRLRoom369@gmail.com'
      const defaultPassword = process.env.ADMIN_PASSWORD || 'CTRLRoom@369'
      await pool.query(
        `
      INSERT INTO admin_users (email, password)
      VALUES ($1, $2)
      ON CONFLICT (email) DO NOTHING
      `,
        [defaultEmail, defaultPassword]
      )
    }

    // Touch images table (no-op) so schema is confirmed.
    await pool.query(seedImagesSql)
    return true
  } catch (err) {
    console.error('Database initialization failed:', err)
    if (isUnreachableDbError(err)) {
      console.error(
        'Could not reach PostgreSQL (timeout or refused). The API will use in-memory seed data until the database is reachable. Check: VPN/firewall, Neon project status, IP allowlist, and NEON_DATABASE_URL in .env.'
      )
    }
    try {
      await pool.end()
    } catch {
      /* ignore */
    }
    pool = null
    dbEnabled = false
    return false
  }
}

export function createId(prefix: string) {
  return `${prefix}_${randomUUID()}`
}

