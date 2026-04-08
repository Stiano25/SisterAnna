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

  const imageBlockIds = useMemo(
    () => blocks.filter((b): b is { type: 'image'; imageId: string } => b.type === 'image').map((b) => b.imageId),
    [blocks]
  )
  const imageBlockIdsKey = useMemo(() => imageBlockIds.join('|'), [imageBlockIds])
  const [imageCaptions, setImageCaptions] = useState<Record<string, string>>({})

  useEffect(() => {
    let cancelled = false
    const loadCaptions = async () => {
      if (imageBlockIds.length === 0) {
        setImageCaptions({})
        return
      }
      const entries = await Promise.all(
        imageBlockIds.map(async (id) => {
          try {
            const res = await fetch(`/api/images/${id}/meta`)
            if (!res.ok) return [id, ''] as const
            const data = (await res.json()) as { alt?: string }
            return [id, data.alt || ''] as const
          } catch {
            return [id, ''] as const
          }
        })
      )
      if (!cancelled) {
        setImageCaptions(Object.fromEntries(entries))
      }
    }
    void loadCaptions()
    return () => {
      cancelled = true
    }
  }, [imageBlockIdsKey])

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
            {card.thumbnailImageId ? (
              <div className="w-full rounded-xl border border-memorial-line bg-memorial-card/60 overflow-hidden mb-4">
                <img
                  src={`/api/images/${card.thumbnailImageId}`}
                  alt={card.title}
                  className="w-full max-h-[260px] object-cover bg-memorial-card"
                />
              </div>
            ) : null}
            <p className="text-[11px] normal-case tracking-[0.02em] text-memorial-muted font-medium mb-1.5">
              {card.eyebrow}
            </p>
            <h2 className="font-sans text-xl font-semibold text-memorial-ink leading-snug">{card.title}</h2>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs text-memorial-muted bg-memorial-line/50 px-3 py-1.5 rounded-full font-semibold">
                {card.tag}
              </span>
              {card.videoUrl ? (
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
            {blocks.map((block, idx) => {
              if (block.type === 'image') {
                return (
                  <figure
                    key={`${block.imageId}_${idx}`}
                    className="w-full rounded-xl border border-slate-200 bg-white overflow-hidden"
                  >
                    <img
                      src={`/api/images/${block.imageId}`}
                      alt={card.title}
                      className="w-full max-h-[70vh] object-cover bg-slate-100"
                    />
                    <figcaption className="px-4 py-2 text-xs text-slate-500 bg-slate-50 border-t border-slate-200">
                      {imageCaptions[block.imageId] || card.title}
                    </figcaption>
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

