/**
 * PostgreSQL lowercases unquoted identifiers, so `iconName` / `sortOrder`
 * often arrive as `iconname` / `sortorder`. Normalize for JSON APIs.
 */
export function normalizeCategoryRow(r: Record<string, unknown> | null | undefined): {
  id: string
  label: string
  sublabel: string
  iconName: string
  sortOrder: number
  cardColor?: string
  textColor?: string
} | null {
  if (!r) return null
  const cardRaw = r.card_color ?? r.cardColor
  const textRaw = r.text_color ?? r.textColor
  const cardColor =
    cardRaw != null && String(cardRaw).trim() !== '' ? String(cardRaw).trim() : undefined
  const textColor =
    textRaw != null && String(textRaw).trim() !== '' ? String(textRaw).trim() : undefined
  return {
    id: String(r.id ?? ''),
    label: String(r.label ?? ''),
    sublabel: String(r.sublabel ?? ''),
    iconName: String(r.iconname ?? r.iconName ?? 'Cross'),
    sortOrder: Number(r.sortorder ?? r.sortOrder ?? 0),
    ...(cardColor !== undefined ? { cardColor } : {}),
    ...(textColor !== undefined ? { textColor } : {})
  }
}

export function normalizeCategoryRows(rows: Record<string, unknown>[]) {
  return rows.map((row) => normalizeCategoryRow(row)).filter(Boolean) as NonNullable<ReturnType<typeof normalizeCategoryRow>>[]
}
