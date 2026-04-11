import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import type { ContentBlock, ContentCard } from '../types'

interface StoryReadingViewProps {
  card: ContentCard
  onBack: () => void
  categoryLabel?: string
  // Lucide icons have a `strokeWidth` type that doesn't always match a strict `number`.
  CategoryIcon?: React.ElementType<any>
}

const renderTextParagraphs = (value: string) => {
  return value
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean)
}

const getEmbedUrl = (url: string): string | null => {
  const trimmed = url.trim()
  if (!trimmed) return null
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(trimmed)) return trimmed
  try {
    const parsed = new URL(trimmed)
    const host = parsed.hostname.replace(/^www\./, '')
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname === '/watch') {
        const id = parsed.searchParams.get('v')
        if (id) return `https://www.youtube.com/embed/${id}`
      }
      if (parsed.pathname.startsWith('/embed/')) return trimmed
    }
    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1)
      if (id) return `https://www.youtube.com/embed/${id}`
    }
    if (host === 'vimeo.com') {
      const id = parsed.pathname.split('/').filter(Boolean)[0]
      if (id) return `https://player.vimeo.com/video/${id}`
    }
    if (host === 'player.vimeo.com') return trimmed
  } catch {
    return null
  }
  return null
}

const StoryReadingView: React.FC<StoryReadingViewProps> = ({
  card,
  onBack,
  categoryLabel,
  CategoryIcon
}) => {
  const blocks: ContentBlock[] = useMemo(
    () =>
      card.blocks && card.blocks.length > 0
        ? card.blocks
        : [{ type: 'text', value: card.body } as ContentBlock],
    [card.blocks, card.body]
  )
  const videoEmbedUrl = useMemo(() => (card.videoUrl ? getEmbedUrl(card.videoUrl) : null), [card.videoUrl])
  const isDirectVideoFile = useMemo(
    () => Boolean(videoEmbedUrl && /\.(mp4|webm|ogg)(\?.*)?$/i.test(videoEmbedUrl)),
    [videoEmbedUrl]
  )

  const imageIdsInStory = useMemo(() => {
    const ids = blocks
      .filter((b): b is Extract<ContentBlock, { type: 'image' }> => b.type === 'image')
      .map((b) => b.imageId)
    return [...new Set(ids)]
  }, [blocks])

  const [imageCaptions, setImageCaptions] = useState<Record<string, string>>({})

  useEffect(() => {
    if (imageIdsInStory.length === 0) {
      setImageCaptions({})
      return
    }
    const ac = new AbortController()
    void (async () => {
      const entries = await Promise.all(
        imageIdsInStory.map(async (id) => {
          try {
            const res = await fetch(`/api/images/${id}/meta`, { signal: ac.signal })
            if (!res.ok) return [id, ''] as const
            const data = (await res.json()) as { alt?: string }
            return [id, (data.alt || '').trim()] as const
          } catch {
            return [id, ''] as const
          }
        })
      )
      if (ac.signal.aborted) return
      setImageCaptions(Object.fromEntries(entries))
    })()
    return () => ac.abort()
  }, [imageIdsInStory])

  return (
    <motion.div
      key={card.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen"
    >
      <div className="sticky top-0 z-20 spiritual-header border-b border-memorial-line">
        <div className="flex items-center justify-between p-4 sm:p-6">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={onBack}
              className="p-3 rounded-full border border-memorial-line hover:bg-memorial-card/80 spiritual-depth transition-all duration-200 min-h-[48px] min-w-[48px] flex items-center justify-center text-memorial-accent"
              aria-label="Back to topics"
            >
              <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
            </button>
            <div className="flex flex-col">
              <h1 className="font-sans text-lg sm:text-xl text-memorial-ink font-semibold leading-tight">
                {categoryLabel ?? 'Story'}
              </h1>
            </div>
          </div>
          {CategoryIcon ? <CategoryIcon className="w-10 h-10 text-memorial-accent" strokeWidth={0.8} /> : null}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-4 sm:gap-6">
          <aside className="rounded-xl border border-memorial-line bg-white/90 p-4 spiritual-depth h-fit lg:sticky lg:top-24">
            <p className="text-[11px] normal-case tracking-[0.02em] text-memorial-muted font-medium mb-1.5">
              {card.eyebrow}
            </p>
            <h2 className="font-sans text-xl font-semibold text-memorial-ink leading-snug">{card.title}</h2>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs text-memorial-muted bg-memorial-line/50 px-3 py-1.5 rounded-full font-semibold">
                {card.tag}
              </span>
              {card.videoUrl && !videoEmbedUrl ? (
                <a
                  href={card.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-memorial-ink bg-memorial-card px-3 py-1.5 rounded-full font-semibold border border-memorial-line hover:border-memorial-accent/60 transition-colors"
                >
                  Watch video
                </a>
              ) : null}
              {card.recordingUrl ? (
                <a
                  href={card.recordingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-green-800 bg-green-100 px-3 py-1.5 rounded-full font-semibold border border-green-200"
                >
                  View recording
                </a>
              ) : null}
            </div>
          </aside>

          <article className="space-y-4">
            {videoEmbedUrl ? (
              <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                {isDirectVideoFile ? (
                  <video controls className="w-full max-h-[60vh] bg-slate-100" src={videoEmbedUrl} />
                ) : (
                  <div className="relative w-full pt-[56.25%] bg-slate-100">
                    <iframe
                      title={`${card.title} video`}
                      src={videoEmbedUrl}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                )}
              </section>
            ) : null}

            {blocks.map((block, idx) => {
              if (block.type === 'image') {
                const caption = imageCaptions[block.imageId] || ''
                const imgAlt = caption || card.title
                return (
                  <figure
                    key={`${block.imageId}_${idx}`}
                    className="w-full rounded-xl border border-slate-200 bg-white overflow-hidden"
                  >
                    <img
                      src={`/api/images/${block.imageId}`}
                      alt={imgAlt}
                      className="w-full max-h-[70vh] object-cover bg-slate-100"
                    />
                    {caption ? (
                      <figcaption className="px-4 py-3 text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/90">
                        {caption}
                      </figcaption>
                    ) : null}
                  </figure>
                )
              }

              return (
                <section
                  key={`text_${idx}`}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-4 sm:px-6 sm:py-5"
                >
                  <div className="space-y-3">
                    {renderTextParagraphs(block.value).map((paragraph, pIdx) => (
                      <p
                        key={`text_${idx}_p_${pIdx}`}
                        className="text-[15px] sm:text-base text-slate-700 leading-7 sm:leading-8"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              )
            })}
          </article>
        </div>
      </div>
    </motion.div>
  )
}

export default StoryReadingView

