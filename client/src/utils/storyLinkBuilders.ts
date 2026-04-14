import { sanitizeUrlForHref } from './sanitizeUrl'

/** Digits only for wa.me (include country code, no leading +). */
export function normalizeWhatsappDigits(input: string): string {
  return input.replace(/\D/g, '')
}

export function buildWhatsappUrl(phoneRaw: string): string | null {
  const digits = normalizeWhatsappDigits(phoneRaw)
  if (digits.length < 8 || digits.length > 15) return null
  return `https://wa.me/${digits}`
}

/** Accepts watch URL, youtu.be, shorts, embed, or 11-char video id. */
export function extractYoutubeVideoId(input: string): string | null {
  const t = input.trim()
  if (!t) return null
  if (/^[a-zA-Z0-9_-]{11}$/.test(t)) return t
  try {
    const urlStr = t.includes('://') ? t : `https://${t}`
    const u = new URL(urlStr)
    const host = u.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      const id = u.pathname.split('/').filter(Boolean)[0]
      return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null
    }
    if (host.includes('youtube.com')) {
      const v = u.searchParams.get('v')
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v
      const embed = u.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/)
      if (embed) return embed[1]
      const shorts = u.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/)
      if (shorts) return shorts[1]
    }
  } catch {
    return null
  }
  return null
}

export function buildYoutubeWatchUrl(input: string): string | null {
  const id = extractYoutubeVideoId(input)
  return id ? `https://www.youtube.com/watch?v=${id}` : null
}

export function sanitizeLinkLabel(input: string): string {
  const s = input.replace(/\[/g, '').replace(/\]/g, '').trim()
  return s || 'Link'
}

export function sanitizeOtherPageUrl(raw: string): string | null {
  return sanitizeUrlForHref(raw.trim())
}
