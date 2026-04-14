/**
 * Returns a safe href for <a> or null if the URL must not be used.
 * Allows http(s), mailto, tel. Blocks javascript:, data:, etc.
 */
export function sanitizeUrlForHref(raw: string): string | null {
  const u = raw.trim()
  if (!u) return null
  const lower = u.toLowerCase()
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return null
  }
  if (/^https?:\/\//i.test(u)) {
    try {
      const parsed = new URL(u)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
      return parsed.href
    } catch {
      return null
    }
  }
  if (/^mailto:/i.test(u)) {
    return u
  }
  if (/^tel:/i.test(u)) {
    return u
  }
  return null
}
