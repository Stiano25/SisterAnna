import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import {
  buildWhatsappUrl,
  buildYoutubeWatchUrl,
  sanitizeLinkLabel,
  sanitizeOtherPageUrl
} from '../utils/storyLinkBuilders'

export type StoryLinkKind = 'whatsapp' | 'youtube' | 'other'

type StoryLinkInsertDialogProps = {
  open: boolean
  onClose: () => void
  /** Called with markdown fragment `[label](url)` to append to the text block. */
  onInsert: (markdown: string) => void
}

const StoryLinkInsertDialog: React.FC<StoryLinkInsertDialogProps> = ({ open, onClose, onInsert }) => {
  const [kind, setKind] = useState<StoryLinkKind>('whatsapp')
  const [linkText, setLinkText] = useState('')
  const [whatsappDigits, setWhatsappDigits] = useState('')
  const [youtubeInput, setYoutubeInput] = useState('')
  const [otherUrl, setOtherUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    setKind('whatsapp')
    setLinkText('')
    setWhatsappDigits('')
    setYoutubeInput('')
    setOtherUrl('')
  }, [open])

  if (!open) return null

  const handleInsert = () => {
    setError(null)
    const label = sanitizeLinkLabel(linkText)
    let url: string | null = null
    if (kind === 'whatsapp') {
      url = buildWhatsappUrl(whatsappDigits)
      if (!url) {
        setError('Enter a WhatsApp number with country code (numbers only, e.g. 254712345678).')
        return
      }
    } else if (kind === 'youtube') {
      url = buildYoutubeWatchUrl(youtubeInput)
      if (!url) {
        setError('Paste a YouTube link or the 11-character video ID.')
        return
      }
    } else {
      url = sanitizeOtherPageUrl(otherUrl)
      if (!url) {
        setError('Enter a full web address starting with https://')
        return
      }
    }
    onInsert(`[${label}](${url})`)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="story-link-dialog-title"
        className="w-full max-w-md rounded-2xl border border-memorial-line bg-memorial-card shadow-xl p-5 sm:p-6"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <h2 id="story-link-dialog-title" className="font-sans text-lg font-bold text-memorial-ink">
            Insert link
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-memorial-line/50 text-memorial-muted"
            aria-label="Close"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {(
            [
              ['whatsapp', 'WhatsApp'],
              ['youtube', 'YouTube'],
              ['other', 'Other page']
            ] as const
          ).map(([k, lab]) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                setKind(k)
                setError(null)
              }}
              className={`px-3 py-2 rounded-xl text-sm font-bold border transition-colors ${
                kind === k
                  ? 'bg-memorial-accent text-memorial-card border-memorial-accent'
                  : 'bg-white/80 text-memorial-muted border-memorial-line hover:border-memorial-accent/50'
              }`}
            >
              {lab}
            </button>
          ))}
        </div>

        <label className="block text-sm font-bold text-memorial-ink mb-1">Words for the link</label>
        <input
          value={linkText}
          onChange={(e) => setLinkText(e.target.value)}
          className="w-full mb-4 bg-transparent border border-memorial-line rounded-xl px-3 py-2.5 text-sm text-memorial-ink outline-none"
          placeholder="e.g. Message us"
        />

        {kind === 'whatsapp' ? (
          <div>
            <label className="block text-sm font-bold text-memorial-ink mb-1">WhatsApp number</label>
            <input
              value={whatsappDigits}
              onChange={(e) => setWhatsappDigits(e.target.value)}
              className="w-full bg-transparent border border-memorial-line rounded-xl px-3 py-2.5 text-sm text-memorial-ink outline-none font-mono"
              placeholder="Country code + number, digits only"
              inputMode="numeric"
              autoComplete="tel"
            />
          </div>
        ) : null}

        {kind === 'youtube' ? (
          <div>
            <label className="block text-sm font-bold text-memorial-ink mb-1">YouTube</label>
            <input
              value={youtubeInput}
              onChange={(e) => setYoutubeInput(e.target.value)}
              className="w-full bg-transparent border border-memorial-line rounded-xl px-3 py-2.5 text-sm text-memorial-ink outline-none"
              placeholder="Paste link or video ID"
            />
          </div>
        ) : null}

        {kind === 'other' ? (
          <div>
            <label className="block text-sm font-bold text-memorial-ink mb-1">Page address</label>
            <input
              value={otherUrl}
              onChange={(e) => setOtherUrl(e.target.value)}
              className="w-full bg-transparent border border-memorial-line rounded-xl px-3 py-2.5 text-sm text-memorial-ink outline-none"
              placeholder="https://…"
            />
          </div>
        ) : null}

        {error ? <p className="text-sm text-red-600 mt-3">{error}</p> : null}

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-memorial-line text-sm font-bold text-memorial-muted hover:bg-white/80"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleInsert}
            className="px-4 py-2.5 rounded-xl bg-memorial-ink text-memorial-card text-sm font-bold shadow hover:opacity-95"
          >
            Add link
          </button>
        </div>
      </div>
    </div>
  )
}

export default StoryLinkInsertDialog
