import React from 'react'
import { sanitizeUrlForHref } from '../utils/sanitizeUrl'

const MD_LINK = /\[([^\]]+)\]\(([^)]+)\)/g
const INLINE_FORMAT = /(==\{(yellow|green|blue|pink)\|([^}]+)\}==|==[^=]+==|\*\*[^*]+\*\*|\*[^*]+\*)/g

function linkClassNameForHref(href: string): string {
  const base =
    'underline underline-offset-[3px] break-words font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 rounded-sm'
  try {
    const u = new URL(href)
    const h = u.hostname.replace(/^www\./, '')
    if (h === 'wa.me' || h === 'api.whatsapp.com' || h === 'web.whatsapp.com') {
      return `${base} text-emerald-700 decoration-emerald-500/70 hover:text-emerald-900`
    }
    if (h === 'youtu.be' || h === 'm.youtube.com' || h.includes('youtube.com')) {
      return `${base} text-red-600 decoration-red-500/70 hover:text-red-800`
    }
  } catch {
    /* ignore */
  }
  return `${base} text-sky-700 decoration-sky-500/70 hover:text-sky-950`
}

type InlineLinkedTextProps = {
  text: string
  className?: string
}

function renderFormattedPlainText(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  const re = new RegExp(INLINE_FORMAT.source, INLINE_FORMAT.flags)
  let k = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      nodes.push(<React.Fragment key={`${keyPrefix}-t-${k++}`}>{text.slice(last, m.index)}</React.Fragment>)
    }
    const token = m[0]
    if (token.startsWith('**') && token.endsWith('**')) {
      nodes.push(<strong key={`${keyPrefix}-b-${k++}`}>{token.slice(2, -2)}</strong>)
    } else if (token.startsWith('=={') && token.endsWith('}==')) {
      const colorMatch = token.match(/^==\{(yellow|green|blue|pink)\|([^}]+)\}==$/)
      const color = colorMatch?.[1] ?? 'yellow'
      const content = colorMatch?.[2] ?? token
      const colorClassName =
        color === 'green'
          ? 'bg-emerald-200/80'
          : color === 'blue'
            ? 'bg-sky-200/80'
            : color === 'pink'
              ? 'bg-pink-200/80'
              : 'bg-amber-200/80'
      nodes.push(
        <mark key={`${keyPrefix}-m-${k++}`} className={`${colorClassName} text-inherit px-0.5 rounded`}>
          {content}
        </mark>
      )
    } else if (token.startsWith('==') && token.endsWith('==')) {
      nodes.push(
        <mark key={`${keyPrefix}-m-${k++}`} className="bg-amber-200/80 text-inherit px-0.5 rounded">
          {token.slice(2, -2)}
        </mark>
      )
    } else if (token.startsWith('*') && token.endsWith('*')) {
      nodes.push(<em key={`${keyPrefix}-i-${k++}`}>{token.slice(1, -1)}</em>)
    } else {
      nodes.push(<React.Fragment key={`${keyPrefix}-r-${k++}`}>{token}</React.Fragment>)
    }
    last = m.index + token.length
  }
  if (last < text.length) {
    nodes.push(<React.Fragment key={`${keyPrefix}-t-${k++}`}>{text.slice(last)}</React.Fragment>)
  }
  return nodes
}

/**
 * Renders plain text with markdown-style inline links: [label](url).
 * URLs are sanitized; invalid links are shown as plain text.
 */
const InlineLinkedText: React.FC<InlineLinkedTextProps> = ({ text, className }) => {
  const nodes: React.ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  const re = new RegExp(MD_LINK.source, MD_LINK.flags)
  let k = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      nodes.push(...renderFormattedPlainText(text.slice(last, m.index), `plain-${k++}`))
    }
    const label = m[1]
    const href = sanitizeUrlForHref(m[2])
    if (href) {
      nodes.push(
        <a
          key={`a-${k++}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassNameForHref(href)}
        >
          {label}
        </a>
      )
    } else {
      nodes.push(<React.Fragment key={`raw-${k++}`}>{m[0]}</React.Fragment>)
    }
    last = m.index + m[0].length
  }
  if (last < text.length) {
    nodes.push(...renderFormattedPlainText(text.slice(last), `plain-${k++}`))
  }

  if (nodes.length === 0) {
    return <span className={className}>{text}</span>
  }

  return <span className={className}>{nodes}</span>
}

export default InlineLinkedText
