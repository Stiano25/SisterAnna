import React from 'react'
import { motion } from 'framer-motion'
import type { ContentCard as ContentCardType } from '../types'

interface ContentCardProps {
  card: ContentCardType
  onOpen?: (card: ContentCardType) => void
}

const ContentCard: React.FC<ContentCardProps> = ({ card, onOpen }) => {
  const hasRecording = Boolean(card.recordingUrl)
  const isPastEvent =
    card.pageId === 'events' && card.eventDate ? new Date(card.eventDate).getTime() < Date.now() : false

  return (
    <motion.button
      type="button"
      className="p-4 border border-memorial-line rounded-xl hover:border-memorial-accent/60 focus-visible:border-memorial-accent focus-visible:outline-none spiritual-card-depth transition-all duration-300 cursor-pointer bg-memorial-card/95 min-h-[120px] flex flex-col items-start justify-start gap-2 text-left"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onOpen?.(card)}
    >
      <div className="text-[10px] uppercase tracking-[0.12em] text-memorial-muted font-semibold">
        {card.tag}
      </div>
      {hasRecording ? (
        <div className="text-[10px] uppercase tracking-[0.12em] text-green-700 font-bold bg-green-100 px-2 py-1 rounded-full">
          Recording available
        </div>
      ) : isPastEvent ? (
        <div className="text-[10px] uppercase tracking-[0.12em] text-amber-700 font-bold bg-amber-100 px-2 py-1 rounded-full">
          Event passed
        </div>
      ) : null}
      <h3 className="font-sans text-base text-memorial-ink leading-snug font-semibold">
        {card.title}
      </h3>
      <div className="text-[11px] text-memorial-muted font-medium">
        {card.eyebrow}
      </div>
    </motion.button>
  )
}

export default ContentCard
