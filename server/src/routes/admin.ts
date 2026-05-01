import express from "express"
import multer from "multer"
import { randomUUID } from "crypto"
import type { PoolClient } from "pg"
import { pool, dbEnabled } from "../db.js"
import {
    requireAdmin,
    adminLogin
} from "../middleware/adminAuth.js"
import { normalizeCategoryRows } from "../normalize/categoryRow.js"

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

type ContentBlock =
    | {
          type: "text"
          value: string
          align?: "left" | "center" | "right"
      }
    | { type: "image"; imageId: string }

function stripMarkdownLinks(input: string): string {
    return input.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
}

function stripStoryFormatting(input: string): string {
    return stripMarkdownLinks(input)
        .replace(/^#{1,3}\s+/gm, "")
        .replace(
            /==\{(?:yellow|green|blue|pink)\|([^}]+)\}==/g,
            "$1"
        )
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1")
        .replace(/==([^=]+)==/g, "$1")
}

function computeSummaryText(blocks: ContentBlock[]) {
    const full = blocks
        .filter(
            (
                b
            ): b is {
                type: "text"
                value: string
                align?: "left" | "center" | "right"
            } => b.type === "text"
        )
        .map(b => stripStoryFormatting(b.value))
        .join(" ")
        .trim()

    if (!full) return ""

    const maxLen = 180
    if (full.length <= maxLen) return full

    const slice = full.slice(0, maxLen)
    const lastSpace = slice.lastIndexOf(" ")
    const trimmed = (
        lastSpace > 40 ? slice.slice(0, lastSpace) : slice
    ).trimEnd()
    return `${trimmed}…`
}

function normalizeBlocks(raw: unknown): ContentBlock[] {
    if (!Array.isArray(raw)) return []

    const blocks: ContentBlock[] = []
    for (const item of raw) {
        if (!item || typeof item !== "object") continue
        const obj = item as any
        if (
            obj.type === "text" &&
            typeof obj.value === "string"
        ) {
            const align =
                obj.align === "center" ||
                obj.align === "right" ||
                obj.align === "left"
                    ? obj.align
                    : undefined
            blocks.push({
                type: "text",
                value: obj.value,
                ...(align ? { align } : {})
            })
        } else if (
            obj.type === "image" &&
            typeof obj.imageId === "string"
        ) {
            blocks.push({
                type: "image",
                imageId: obj.imageId
            })
        }
    }
    return blocks
}

function isUnreachableDbError(err: unknown): boolean {
    const e = err as {
        code?: string
        errors?: Array<{ code?: string }>
    }
    if (
        e?.code === "ETIMEDOUT" ||
        e?.code === "ECONNREFUSED" ||
        e?.code === "ENOTFOUND"
    )
        return true
    if (Array.isArray(e?.errors)) {
        return e.errors.some(
            x =>
                x?.code === "ETIMEDOUT" ||
                x?.code === "ECONNREFUSED"
        )
    }
    return false
}

function slugifyGalleryCategory(input: string) {
    return input
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
}

router.post("/login", adminLogin)
router.use(requireAdmin)
router.use((req, res, next) => {
    if (!dbEnabled || !pool) {
        res.status(503).json({
            error: "Neon DB not configured (NEON_DATABASE_URL missing)"
        })
        return
    }
    next()
})
// Middleware above guarantees `pool` exists at runtime.
const db = pool!

function sanitizeCssColor(input: unknown): string | null {
    if (input == null) return null
    const s = String(input).trim()
    if (!s) return null
    if (s.length > 64) return null
    if (/[<>"`;]/.test(s)) return null
    return s
}

async function runInTransaction<T>(
    fn: (client: PoolClient) => Promise<T>
): Promise<T> {
    const client = await db.connect()
    try {
        await client.query("BEGIN")
        const result = await fn(client)
        await client.query("COMMIT")
        return result
    } catch (err) {
        await client.query("ROLLBACK")
        throw err
    } finally {
        client.release()
    }
}

// Categories (editable)
router.get("/categories", async (req, res) => {
    try {
        const r = await db.query(
            "SELECT id, label, sublabel, iconName, sortOrder, card_color, text_color FROM categories ORDER BY sortOrder, id ASC"
        )
        res.json(
            normalizeCategoryRows(
                r.rows as Record<string, unknown>[]
            )
        )
    } catch (err) {
        console.error(err)
        res.status(500).json({
            error: "Failed to load categories"
        })
    }
})

router.post("/categories", async (req, res) => {
    const {
        id,
        label,
        sublabel,
        iconName,
        cardColor,
        textColor
    } = req.body as {
        id: string
        label: string
        sublabel: string
        iconName: string
        cardColor?: string | null
        textColor?: string | null
    }

    const slug = id?.trim().toLowerCase()
    if (
        !slug ||
        !label?.trim() ||
        !sublabel?.trim() ||
        !iconName?.trim()
    ) {
        res.status(400).json({
            error: "id, label, sublabel, and iconName are required"
        })
        return
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
        res.status(400).json({
            error: "Section id may only use lowercase letters, numbers, and hyphens"
        })
        return
    }

    const card = sanitizeCssColor(cardColor)
    const text = sanitizeCssColor(textColor)

    try {
        const orderRes = await db.query<{ m: string }>(
            `SELECT COALESCE(MAX(sortOrder), -1)::text AS m FROM categories`
        )
        const sortOrder =
            Number(orderRes.rows[0]?.m ?? -1) + 1

        await db.query(
            `
      INSERT INTO categories (id, label, sublabel, iconName, sortOrder, card_color, text_color)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
            [
                slug,
                label.trim(),
                sublabel.trim(),
                iconName.trim(),
                sortOrder,
                card,
                text
            ]
        )
        res.json({ ok: true, id: slug })
    } catch (err: any) {
        if (err?.code === "23505") {
            res.status(409).json({
                error: "A section with this id already exists"
            })
            return
        }
        console.error(err)
        res.status(500).json({
            error: "Failed to create category"
        })
    }
})

router.put("/categories/order", async (req, res) => {
    const { categoryIds } = req.body as {
        categoryIds?: string[]
    }

    if (
        !Array.isArray(categoryIds) ||
        categoryIds.length === 0
    ) {
        res.status(400).json({
            error: "categoryIds is required"
        })
        return
    }

    try {
        await runInTransaction(async client => {
            for (let i = 0; i < categoryIds.length; i++) {
                await client.query(
                    `
        UPDATE categories
        SET sortorder = $1
        WHERE id = $2
        `,
                    [i, categoryIds[i]]
                )
            }
        })
        res.json({ ok: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({
            error: "Failed to reorder sections"
        })
    }
})

router.put("/categories/:categoryId", async (req, res) => {
    const { categoryId } = req.params
    const {
        label,
        sublabel,
        iconName,
        cardColor,
        textColor
    } = req.body as {
        label: string
        sublabel: string
        iconName: string
        cardColor?: string | null
        textColor?: string | null
    }

    const card = sanitizeCssColor(cardColor)
    const text = sanitizeCssColor(textColor)

    try {
        const r = await db.query(
            `
      UPDATE categories
      SET label = $1, sublabel = $2, iconname = $3, card_color = $4, text_color = $5
      WHERE id = $6
      `,
            [
                label,
                sublabel,
                iconName,
                card,
                text,
                categoryId
            ]
        )
        if (r.rowCount === 0) {
            res.status(404).json({
                error: "Section not found"
            })
            return
        }
        res.json({ ok: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({
            error: "Failed to update category"
        })
    }
})

router.delete(
    "/categories/:categoryId",
    async (req, res) => {
        const { categoryId } = req.params

        try {
            await runInTransaction(async client => {
                const topicIdsRes = await client.query<{
                    id: string
                }>(
                    `
      SELECT id
      FROM topics
      WHERE categoryId=$1
      `,
                    [categoryId]
                )
                const topicIds = topicIdsRes.rows.map(
                    r => r.id
                )

                if (topicIds.length > 0) {
                    await client.query(
                        `
        DELETE FROM images
        WHERE topicId = ANY($1::text[])
        `,
                        [topicIds]
                    )
                    await client.query(
                        `
        DELETE FROM topic_content_blocks
        WHERE topicId = ANY($1::text[])
        `,
                        [topicIds]
                    )
                    await client.query(
                        `
        DELETE FROM topics
        WHERE id = ANY($1::text[])
        `,
                        [topicIds]
                    )
                }

                const deleteCategoryRes =
                    await client.query(
                        `
      DELETE FROM categories
      WHERE id=$1
      `,
                        [categoryId]
                    )
                if (deleteCategoryRes.rowCount === 0) {
                    const e = new Error(
                        "CATEGORY_NOT_FOUND"
                    ) as Error & { code: string }
                    e.code = "CATEGORY_NOT_FOUND"
                    throw e
                }
            })
            res.json({ ok: true })
        } catch (err: unknown) {
            const code = (err as { code?: string })?.code
            if (code === "CATEGORY_NOT_FOUND") {
                res.status(404).json({
                    error: "Category not found"
                })
                return
            }
            console.error(err)
            res.status(500).json({
                error: "Failed to delete category"
            })
        }
    }
)

// Topics list for a category
router.get(
    "/categories/:categoryId/topics",
    async (req, res) => {
        const { categoryId } = req.params

        try {
            const r = await db.query(
                `
      SELECT id, categoryId, eyebrow, title, tag, sortOrder, summaryText, mission_status, support_link, updatedAt
      , video_url, event_date, recording_url, thumbnail_image_id
      FROM topics
      WHERE categoryId=$1
      ORDER BY sortOrder, updatedAt DESC
      `,
                [categoryId]
            )
            res.json(r.rows)
        } catch (err) {
            console.error(err)
            res.status(500).json({
                error: "Failed to load topics"
            })
        }
    }
)

router.post(
    "/categories/:categoryId/topics",
    async (req, res) => {
        const { categoryId } = req.params
        const { eyebrow, title, tag } = req.body as {
            eyebrow?: string
            title: string
            tag?: string
        }

        // Generate a stable-ish id for future blocks reference.
        const id = `topic_${randomUUID()}`
        const isMission = categoryId === "mission"

        try {
            const orderRes = await db.query<{ m: string }>(
                `SELECT COALESCE(MAX(sortOrder), -1)::text AS m FROM topics WHERE categoryId=$1`,
                [categoryId]
            )
            const sortOrder =
                Number(orderRes.rows[0]?.m ?? -1) + 1

            await db.query(
                `
      INSERT INTO topics (id, categoryId, eyebrow, title, tag, sortOrder, summaryText, mission_status, support_link, updatedAt)
      VALUES ($1, $2, COALESCE($3,''), $4, COALESCE($5,''), $6, '', $7, $8, NOW())
      ON CONFLICT (id) DO NOTHING
      `,
                [
                    id,
                    categoryId,
                    eyebrow ?? "",
                    title,
                    tag ?? "",
                    sortOrder,
                    isMission ? "ongoing" : null,
                    isMission ? "" : null
                ]
            )

            // Initialize empty blocks row.
            await db.query(
                `
      INSERT INTO topic_content_blocks (topicId, blocks)
      VALUES ($1, '[]'::jsonb)
      ON CONFLICT (topicId) DO NOTHING
      `,
                [id]
            )

            res.json({ id })
        } catch (err) {
            console.error(err)
            res.status(500).json({
                error: "Failed to create topic"
            })
        }
    }
)

router.put(
    "/categories/:categoryId/topics/order",
    async (req, res) => {
        const { categoryId } = req.params
        const { topicIds } = req.body as {
            topicIds?: string[]
        }

        if (
            !Array.isArray(topicIds) ||
            topicIds.length === 0
        ) {
            res.status(400).json({
                error: "topicIds is required"
            })
            return
        }

        try {
            await runInTransaction(async client => {
                for (let i = 0; i < topicIds.length; i++) {
                    await client.query(
                        `
        UPDATE topics
        SET sortOrder=$1, updatedAt=NOW()
        WHERE id=$2 AND categoryId=$3
        `,
                        [i, topicIds[i], categoryId]
                    )
                }
            })
            res.json({ ok: true })
        } catch (err) {
            console.error(err)
            res.status(500).json({
                error: "Failed to reorder topics"
            })
        }
    }
)

router.get("/topics/:topicId", async (req, res) => {
    const { topicId } = req.params

    try {
        const topicRes = await db.query(
            `
      SELECT id, categoryId, eyebrow, title, tag, sortOrder, summaryText, mission_status, support_link, updatedAt
      , video_url, event_date, recording_url, thumbnail_image_id
      FROM topics
      WHERE id=$1
      `,
            [topicId]
        )

        const blocksRes = await db.query(
            `
      SELECT blocks
      FROM topic_content_blocks
      WHERE topicId=$1
      `,
            [topicId]
        )

        const imagesRes = await db.query(
            `
      SELECT id, alt, mimeType, filename, sortOrder, createdAt
      FROM images
      WHERE topicId=$1
      ORDER BY sortOrder, createdAt DESC
      `,
            [topicId]
        )

        res.json({
            topic: topicRes.rows[0] || null,
            blocks: blocksRes.rows[0]?.blocks ?? [],
            images: imagesRes.rows
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({
            error: "Failed to load topic"
        })
    }
})

router.put(
    "/topics/:topicId/category",
    async (req, res) => {
        const { topicId } = req.params
        const { categoryId: destinationCategoryId } =
            req.body as { categoryId?: string }

        const dest = destinationCategoryId?.trim()
        if (!dest) {
            res.status(400).json({
                error: "categoryId is required"
            })
            return
        }

        try {
            const topicRes = await db.query<{
                categoryId: string
            }>(
                `SELECT categoryId AS "categoryId" FROM topics WHERE id=$1`,
                [topicId]
            )
            const currentCategoryId =
                topicRes.rows[0]?.categoryId
            if (!currentCategoryId) {
                res.status(404).json({
                    error: "Story not found"
                })
                return
            }
            if (currentCategoryId === dest) {
                res.status(400).json({
                    error: "Story is already in this section"
                })
                return
            }

            const catCheck = await db.query(
                `SELECT 1 FROM categories WHERE id=$1`,
                [dest]
            )
            if (catCheck.rowCount === 0) {
                res.status(404).json({
                    error: "Destination section not found"
                })
                return
            }

            const result = await runInTransaction(
                async client => {
                    const orderRes = await client.query<{
                        m: string
                    }>(
                        `SELECT COALESCE(MAX(sortOrder), -1)::text AS m FROM topics WHERE categoryId=$1`,
                        [dest]
                    )
                    const sortOrder =
                        Number(orderRes.rows[0]?.m ?? -1) +
                        1

                    // Some older rows may not have a blocks row; ensure transfer can't make them disappear
                    // from public content queries that join on topic_content_blocks.
                    await client.query(
                        `
        INSERT INTO topic_content_blocks (topicId, blocks)
        VALUES ($1, '[]'::jsonb)
        ON CONFLICT (topicId) DO NOTHING
        `,
                        [topicId]
                    )

                    const updateRes = await client.query(
                        `
        UPDATE topics
        SET categoryId=$1, sortOrder=$2, updatedAt=NOW()
        WHERE id=$3
        RETURNING id, categoryId, eyebrow, title, tag, sortOrder, summaryText, mission_status, support_link, updatedAt
        , video_url, event_date, recording_url, thumbnail_image_id
        `,
                        [dest, sortOrder, topicId]
                    )

                    return updateRes.rows[0]
                }
            )

            res.json({ ok: true, topic: result })
        } catch (err) {
            console.error(err)
            if (isUnreachableDbError(err)) {
                res.status(503).json({
                    error: "Neon DB temporarily unavailable (timeout). Please try again."
                })
                return
            }
            res.status(500).json({
                error: "Failed to transfer story"
            })
        }
    }
)

router.put("/topics/:topicId", async (req, res) => {
    const { topicId } = req.params
    const {
        eyebrow,
        title,
        tag,
        blocks,
        missionStatus,
        supportLink,
        videoUrl,
        eventDate,
        recordingUrl,
        thumbnailImageId
    } = req.body as {
        eyebrow?: string
        title: string
        tag?: string
        blocks: unknown
        missionStatus?: string | null
        supportLink?: string | null
        videoUrl?: string | null
        eventDate?: string | null
        recordingUrl?: string | null
        thumbnailImageId?: string | null
    }

    const normalizedBlocks = normalizeBlocks(blocks)
    const summaryText = computeSummaryText(normalizedBlocks)

    try {
        const catRes = await db.query<{
            categoryId: string
        }>(
            `SELECT categoryId AS "categoryId" FROM topics WHERE id=$1`,
            [topicId]
        )
        const categoryId = catRes.rows[0]?.categoryId
        const isMission = categoryId === "mission"

        await db.query(
            `
      UPDATE topics
      SET eyebrow=COALESCE($1,''),
          title=$2,
          tag=COALESCE($3,''),
          summaryText=$4,
          mission_status=$5,
          support_link=$6,
          video_url=$7,
          event_date=$8,
          recording_url=$9,
          thumbnail_image_id=$10,
          updatedAt=NOW()
      WHERE id=$11
      `,
            [
                eyebrow ?? "",
                title,
                tag ?? "",
                summaryText,
                isMission
                    ? (missionStatus ?? "ongoing")
                    : null,
                isMission ? (supportLink ?? "") : null,
                videoUrl ?? null,
                eventDate || null,
                recordingUrl ?? null,
                thumbnailImageId ?? null,
                topicId
            ]
        )

        await db.query(
            `
      INSERT INTO topic_content_blocks (topicId, blocks)
      VALUES ($1, $2::jsonb)
      ON CONFLICT (topicId) DO UPDATE
      SET blocks = EXCLUDED.blocks
      `,
            [topicId, JSON.stringify(normalizedBlocks)]
        )

        res.json({ ok: true })
    } catch (err) {
        console.error(err)
        if (isUnreachableDbError(err)) {
            res.status(503).json({
                error: "Neon DB temporarily unavailable (timeout). Please try again."
            })
            return
        }
        res.status(500).json({
            error: "Failed to update topic"
        })
    }
})

router.delete("/topics/:topicId", async (req, res) => {
    const { topicId } = req.params

    try {
        await db.query("DELETE FROM topics WHERE id=$1", [
            topicId
        ])
        res.json({ ok: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({
            error: "Failed to delete topic"
        })
    }
})

// Images upload for a topic (admin only, stored as bytea)
router.post(
    "/topics/:topicId/images",
    upload.array("images", 10),
    async (req, res) => {
        const { topicId } = req.params

        try {
            const files = req.files as
                | Express.Multer.File[]
                | undefined
            if (!files || files.length === 0) {
                res.status(400).json({
                    error: "No images uploaded"
                })
                return
            }

            // Optional: admin can send `alts` aligned with file order, but we default to filename.
            const alts =
                typeof req.body?.alts === "string"
                    ? JSON.parse(req.body.alts)
                    : req.body?.alts

            for (let i = 0; i < files.length; i++) {
                const f = files[i]
                const alt =
                    Array.isArray(alts) &&
                    typeof alts[i] === "string"
                        ? alts[i]
                        : f.originalname
                const id = `img_${randomUUID()}`

                await db.query(
                    `
        INSERT INTO images (id, topicId, alt, mimeType, filename, data, sortOrder, createdAt)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        `,
                    [
                        id,
                        topicId,
                        alt,
                        f.mimetype,
                        f.originalname,
                        f.buffer,
                        i
                    ]
                )
            }

            res.json({ ok: true })
        } catch (err) {
            console.error(err)
            res.status(500).json({
                error: "Failed to upload images"
            })
        }
    }
)

router.put(
    "/topics/:topicId/images/:imageId",
    async (req, res) => {
        const { topicId, imageId } = req.params
        const alt =
            typeof req.body?.alt === "string"
                ? req.body.alt.trim()
                : ""
        if (!alt) {
            res.status(400).json({
                error: "Image tag/alt is required"
            })
            return
        }
        try {
            const r = await db.query(
                `
      UPDATE images
      SET alt=$1
      WHERE id=$2 AND topicId=$3
      `,
                [alt, imageId, topicId]
            )
            if (r.rowCount === 0) {
                res.status(404).json({
                    error: "Topic image not found"
                })
                return
            }
            res.json({ ok: true })
        } catch (err) {
            console.error(err)
            res.status(500).json({
                error: "Failed to update topic image tag"
            })
        }
    }
)

// Gallery images (site-wide, not tied to a topic)
router.get("/gallery/categories", async (req, res) => {
    try {
        const r = await db.query(
            `
      SELECT id, name, sortOrder AS "sortOrder", createdAt AS "createdAt"
      FROM gallery_categories
      ORDER BY sortOrder, createdAt DESC
      `
        )
        res.json(r.rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({
            error: "Failed to load gallery categories"
        })
    }
})

router.post("/gallery/categories", async (req, res) => {
    const { name } = req.body as { name?: string }
    const cleanName = (name || "").trim()
    const id = slugifyGalleryCategory(cleanName)
    if (!cleanName || !id) {
        res.status(400).json({
            error: "Category name is required"
        })
        return
    }

    try {
        const orderRes = await db.query<{ m: string }>(
            `SELECT COALESCE(MAX(sortOrder), -1)::text AS m FROM gallery_categories`
        )
        const sortOrder =
            Number(orderRes.rows[0]?.m ?? -1) + 1

        await db.query(
            `
      INSERT INTO gallery_categories (id, name, sortOrder, createdAt)
      VALUES ($1, $2, $3, NOW())
      `,
            [id, cleanName, sortOrder]
        )
        res.json({ ok: true, id })
    } catch (err: any) {
        if (err?.code === "23505") {
            res.status(409).json({
                error: "That gallery category already exists"
            })
            return
        }
        console.error(err)
        res.status(500).json({
            error: "Failed to create gallery category"
        })
    }
})

router.put(
    "/gallery/categories/:categoryId",
    async (req, res) => {
        const { categoryId } = req.params
        const { name } = req.body as { name?: string }
        const cleanName = (name || "").trim()
        if (!cleanName) {
            res.status(400).json({
                error: "Category name is required"
            })
            return
        }

        try {
            await db.query(
                `
      UPDATE gallery_categories
      SET name=$1
      WHERE id=$2
      `,
                [cleanName, categoryId]
            )
            res.json({ ok: true })
        } catch (err: any) {
            if (err?.code === "23505") {
                res.status(409).json({
                    error: "That gallery category name already exists"
                })
                return
            }
            console.error(err)
            res.status(500).json({
                error: "Failed to rename gallery category"
            })
        }
    }
)

router.put(
    "/gallery/categories/order",
    async (req, res) => {
        const { categoryIds } = req.body as {
            categoryIds?: string[]
        }
        if (
            !Array.isArray(categoryIds) ||
            categoryIds.length === 0
        ) {
            res.status(400).json({
                error: "categoryIds is required"
            })
            return
        }

        try {
            await db.query("BEGIN")
            for (let i = 0; i < categoryIds.length; i++) {
                await db.query(
                    `
        UPDATE gallery_categories
        SET sortOrder=$1
        WHERE id=$2
        `,
                    [i, categoryIds[i]]
                )
            }
            await db.query("COMMIT")
            res.json({ ok: true })
        } catch (err) {
            await db.query("ROLLBACK")
            console.error(err)
            res.status(500).json({
                error: "Failed to reorder gallery categories"
            })
        }
    }
)

router.put("/gallery/images/order", async (req, res) => {
    const { categoryId, imageIds } = req.body as {
        categoryId?: string
        imageIds?: string[]
    }
    if (
        typeof categoryId !== "string" ||
        !categoryId.trim()
    ) {
        res.status(400).json({
            error: "categoryId is required"
        })
        return
    }
    if (!Array.isArray(imageIds) || imageIds.length === 0) {
        res.status(400).json({
            error: "imageIds is required"
        })
        return
    }

    const cat = categoryId.trim()
    try {
        await runInTransaction(async client => {
            await client.query(
                `
        UPDATE gallery_images AS g
        SET sortOrder = ord.sort_order
        FROM (
          SELECT u.id, (u.ord - 1)::int AS sort_order
          FROM unnest($1::text[]) WITH ORDINALITY AS u(id, ord)
        ) AS ord
        WHERE g.id = ord.id AND COALESCE(g.categoryId, 'uncategorized') = $2
        `,
                [imageIds, cat]
            )
        })
        res.json({ ok: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({
            error: "Failed to reorder gallery images"
        })
    }
})

router.delete(
    "/gallery/categories/:categoryId",
    async (req, res) => {
        const { categoryId } = req.params
        const fallbackCategoryId =
            typeof req.body?.fallbackCategoryId ===
                "string" &&
            req.body.fallbackCategoryId.trim()
                ? req.body.fallbackCategoryId.trim()
                : "general"

        if (categoryId === "general") {
            res.status(400).json({
                error: "The General category cannot be deleted"
            })
            return
        }
        if (fallbackCategoryId === categoryId) {
            res.status(400).json({
                error: "Fallback category must be different"
            })
            return
        }

        try {
            const fallback = await db.query(
                "SELECT id FROM gallery_categories WHERE id=$1",
                [fallbackCategoryId]
            )
            if (fallback.rowCount === 0) {
                res.status(400).json({
                    error: "Fallback gallery category not found"
                })
                return
            }

            await db.query("BEGIN")
            await db.query(
                `
      UPDATE gallery_images
      SET categoryId=$1
      WHERE categoryId=$2
      `,
                [fallbackCategoryId, categoryId]
            )
            await db.query(
                "DELETE FROM gallery_categories WHERE id=$1",
                [categoryId]
            )
            await db.query("COMMIT")
            res.json({ ok: true })
        } catch (err) {
            await db.query("ROLLBACK")
            console.error(err)
            res.status(500).json({
                error: "Failed to delete gallery category"
            })
        }
    }
)

router.get("/gallery/images", async (req, res) => {
    try {
        const r = await db.query(
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
        res.status(500).json({
            error: "Failed to load gallery images"
        })
    }
})

router.post(
    "/gallery/images",
    upload.array("images", 20),
    async (req, res) => {
        try {
            const files = req.files as
                | Express.Multer.File[]
                | undefined
            if (!files || files.length === 0) {
                res.status(400).json({
                    error: "No images uploaded"
                })
                return
            }
            const categoryId =
                typeof req.body?.categoryId === "string"
                    ? req.body.categoryId.trim()
                    : ""
            if (!categoryId) {
                res.status(400).json({
                    error: "gallery category is required"
                })
                return
            }
            const categoryCheck = await db.query(
                "SELECT id FROM gallery_categories WHERE id=$1",
                [categoryId]
            )
            if (categoryCheck.rowCount === 0) {
                res.status(400).json({
                    error: "Invalid gallery category"
                })
                return
            }

            const alts =
                typeof req.body?.alts === "string"
                    ? JSON.parse(req.body.alts)
                    : req.body?.alts

            for (let i = 0; i < files.length; i++) {
                const f = files[i]
                const alt =
                    Array.isArray(alts) &&
                    typeof alts[i] === "string"
                        ? alts[i]
                        : f.originalname
                const id = `gallery_${randomUUID()}`

                await db.query(
                    `
        INSERT INTO gallery_images (id, categoryId, alt, mimeType, filename, data, sortOrder, createdAt)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        `,
                    [
                        id,
                        categoryId,
                        alt,
                        f.mimetype,
                        f.originalname,
                        f.buffer,
                        i
                    ]
                )
            }

            res.json({ ok: true })
        } catch (err) {
            console.error(err)
            res.status(500).json({
                error: "Failed to upload gallery images"
            })
        }
    }
)

router.put(
    "/gallery/images/:imageId/category",
    async (req, res) => {
        const { imageId } = req.params
        const categoryId =
            typeof req.body?.categoryId === "string"
                ? req.body.categoryId.trim()
                : ""
        if (!categoryId) {
            res.status(400).json({
                error: "categoryId is required"
            })
            return
        }

        try {
            const categoryCheck = await db.query(
                "SELECT id FROM gallery_categories WHERE id=$1",
                [categoryId]
            )
            if (categoryCheck.rowCount === 0) {
                res.status(400).json({
                    error: "Invalid gallery category"
                })
                return
            }

            await db.query(
                `
      UPDATE gallery_images
      SET categoryId=$1
      WHERE id=$2
      `,
                [categoryId, imageId]
            )
            res.json({ ok: true })
        } catch (err) {
            console.error(err)
            res.status(500).json({
                error: "Failed to update gallery image category"
            })
        }
    }
)

router.put("/gallery/images/:imageId", async (req, res) => {
    const { imageId } = req.params
    const alt =
        typeof req.body?.alt === "string"
            ? req.body.alt.trim()
            : ""
    if (!alt) {
        res.status(400).json({
            error: "Image tag/alt is required"
        })
        return
    }
    try {
        const r = await db.query(
            `
      UPDATE gallery_images
      SET alt=$1
      WHERE id=$2
      `,
            [alt, imageId]
        )
        if (r.rowCount === 0) {
            res.status(404).json({
                error: "Gallery image not found"
            })
            return
        }
        res.json({ ok: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({
            error: "Failed to update gallery image tag"
        })
    }
})

router.delete(
    "/gallery/images/:imageId",
    async (req, res) => {
        const { imageId } = req.params
        try {
            const r = await db.query(
                "DELETE FROM gallery_images WHERE id=$1",
                [imageId]
            )
            if (r.rowCount === 0) {
                res.status(404).json({
                    error: "Gallery image not found"
                })
                return
            }
            res.json({ ok: true })
        } catch (err) {
            console.error(err)
            res.status(500).json({
                error: "Failed to delete gallery image"
            })
        }
    }
)

export default router
