import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { ContentCard as ContentCardType } from '../types'

interface ContentCardProps {
  card: ContentCardType
}

const ContentCard: React.FC<ContentCardProps> = ({ card }) => {
  return (
    <motion.div
      className="border border-memorial-line rounded-2xl p-8 hover:border-memorial-accent/50 spiritual-card-depth transition-all duration-300 cursor-pointer group relative overflow-hidden bg-memorial-card"
      whileHover="hover"
      initial="initial"
    >
      <motion.div
        className="absolute top-0 left-0 h-1 bg-memorial-accent"
        variants={{
          initial: { scaleX: 0 },
          hover: { scaleX: 1 }
        }}
        style={{ transformOrigin: 'left' }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />

      <div className="text-xs uppercase tracking-[0.15em] text-memorial-muted mb-3 font-bold">
        {card.eyebrow}
      </div>

      <h3 className="font-sans text-2xl text-memorial-ink mb-4 leading-tight font-bold">
        {card.title}
      </h3>

      <p className="text-memorial-muted leading-relaxed mb-6 text-base">
        {card.body}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-sm text-memorial-muted bg-memorial-line/50 px-4 py-2 rounded-full font-bold">
          {card.tag}
        </span>
        <motion.div
          className="flex items-center gap-2 text-memorial-muted group-hover:text-memorial-accent transition-colors"
          variants={{
            initial: { x: 0 },
            hover: { x: 6 }
          }}
          transition={{ duration: 0.3 }}
        >
          <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
        </motion.div>
      </div>
    </motion.div>
  )
}

export default ContentCard
