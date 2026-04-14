import type { QuickLink } from '../types'

/** Home explorer grid item (from `/api/content` `categories`). */
export type ExplorerCategoryItem = {
  id: string
  label: string
  sublabel: string
  iconName: string
  cardColor?: string
  textColor?: string
}

export function parseExplorerNavFromContentApi(data: unknown): {
  categories: ExplorerCategoryItem[]
  quickLinks: QuickLink[]
} | null {
  if (!data || typeof data !== 'object') return null
  const d = data as Record<string, unknown>
  const rawCats = d.categories
  const rawLinks = d.quickLinks
  if (!Array.isArray(rawCats) || !Array.isArray(rawLinks)) return null

  const categories: ExplorerCategoryItem[] = rawCats.map((row) => {
    const c = row as Record<string, unknown>
    const item: ExplorerCategoryItem = {
      id: String(c.id ?? ''),
      label: String(c.label ?? ''),
      sublabel: String(c.sublabel ?? ''),
      iconName: String(c.iconName ?? c.iconname ?? 'Cross')
    }
    const card = c.cardColor ?? c.card_color
    const text = c.textColor ?? c.text_color
    if (card != null && String(card).trim() !== '') item.cardColor = String(card).trim()
    if (text != null && String(text).trim() !== '') item.textColor = String(text).trim()
    return item
  })

  const quickLinks: QuickLink[] = rawLinks.map((row) => {
    const q = row as Record<string, unknown>
    const link: QuickLink = {
      id: String(q.id ?? ''),
      question: String(q.question ?? ''),
      pageId: String(q.pageId ?? '')
    }
    if (q.cardId != null && String(q.cardId) !== '') link.cardId = String(q.cardId)
    return link
  })

  return { categories, quickLinks }
}
