import React from 'react'
import { motion } from 'framer-motion'
import type { ContentCard as ContentCardType } from '../types'

interface ContentCardProps {
  card: ContentCardType
  onOpen?: (card: ContentCardType) => void
}

const ContentCard: React.FC<ContentCardProps> = ({ card, onOpen }) => {
  return (
    <motion.button
      type="button"
      className="p-5 border border-memorial-line rounded-2xl hover:border-memorial-accent/60 focus-visible:border-memorial-accent focus-visible:outline-none spiritual-card-depth transition-all duration-300 cursor-pointer bg-memorial-card/90 min-h-[128px] flex flex-col items-center justify-center gap-2 text-center"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onOpen?.(card)}
    >
      <div className="text-xs uppercase tracking-[0.15em] text-memorial-muted font-bold">
        {card.tag}
      </div>
      <h3 className="font-sans text-base sm:text-lg text-memorial-ink leading-tight font-bold">
        {card.title}
      </h3>
      <div className="text-2xs uppercase tracking-[0.18em] text-memorial-muted font-bold">
        {card.eyebrow}
      </div>
    </motion.button>
  )
}

export default ContentCard
