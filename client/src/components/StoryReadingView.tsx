import React from 'react'
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

const StoryReadingView: React.FC<StoryReadingViewProps> = ({
  card,
  onBack,
  categoryLabel,
  CategoryIcon
}) => {
  const blocks: ContentBlock[] =
    card.blocks && card.blocks.length > 0
      ? card.blocks
      : [{ type: 'text', value: card.body } as ContentBlock]

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
        <div className="flex items-center justify-between p-4 sm:p-8">
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
              <h1 className="font-sans text-xl sm:text-2xl italic text-memorial-ink font-bold leading-tight">
                {categoryLabel ?? 'Story'}
              </h1>
            </div>
          </div>
          {CategoryIcon ? <CategoryIcon className="w-10 h-10 text-memorial-accent" strokeWidth={0.8} /> : null}
        </div>
      </div>

      <div className="p-4 sm:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <p className="text-2xs uppercase tracking-[0.2em] text-memorial-accent font-bold mb-3">
              {card.eyebrow}
            </p>

            <h2 className="font-sans text-2xl sm:text-3xl font-bold text-memorial-ink leading-snug">
              {card.title}
            </h2>

            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-sm text-memorial-muted bg-memorial-line/50 px-3 py-2 rounded-full font-bold">
                {card.tag}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {blocks.map((block, idx) => {
              if (block.type === 'image') {
                return (
                  <div
                    key={`${block.imageId}_${idx}`}
                    className="w-full rounded-2xl border border-memorial-line bg-memorial-card/60 overflow-hidden"
                  >
                    <img
                      src={`/api/images/${block.imageId}`}
                      alt={card.title}
                      className="w-full max-h-[70vh] object-contain bg-memorial-card"
                    />
                  </div>
                )
              }

              return (
                <div
                  key={`text_${idx}`}
                  className="border border-memorial-line bg-memorial-card/40 rounded-2xl p-4 sm:p-6"
                >
                  <p className="text-base sm:text-lg text-memorial-muted leading-relaxed whitespace-pre-wrap">
                    {block.value}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default StoryReadingView

