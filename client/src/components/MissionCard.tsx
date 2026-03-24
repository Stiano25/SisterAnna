import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Loader, CircleDashed, RefreshCw, CalendarDays, HeartHandshake } from 'lucide-react'
import type { MissionCard as MissionCardType } from '../types'

interface MissionCardProps {
  card: MissionCardType
}

const statusConfig = {
  'in-progress': {
    icon: Loader,
    label: 'In Progress',
    color: 'text-memorial-muted',
    bgColor: 'bg-memorial-line/40'
  },
  'unfunded': {
    icon: CircleDashed,
    label: 'Unfunded',
    color: 'text-memorial-muted',
    bgColor: 'bg-memorial-line/25'
  },
  'ongoing': {
    icon: RefreshCw,
    label: 'Ongoing',
    color: 'text-memorial-muted',
    bgColor: 'bg-memorial-line/40'
  },
  'planned': {
    icon: CalendarDays,
    label: 'Planned',
    color: 'text-memorial-muted',
    bgColor: 'bg-memorial-line/40'
  }
}

const MissionCard: React.FC<MissionCardProps> = ({ card }) => {
  const status = statusConfig[card.status]
  const StatusIcon = status.icon

  return (
    <motion.div
      className="border border-memorial-line rounded-2xl p-8 hover:border-memorial-accent/50 spiritual-card-depth transition-all duration-300 group relative overflow-hidden bg-memorial-card"
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

      <div className="flex items-center justify-between mb-6">
        <div className="text-xs uppercase tracking-[0.15em] text-memorial-muted font-bold">
          {card.eyebrow}
        </div>
        <div className={`flex items-center gap-3 px-4 py-2 rounded-full ${status.bgColor} border border-memorial-line`}>
          <motion.div
            animate={card.status === 'in-progress' ? { rotate: 360 } : {}}
            transition={card.status === 'in-progress' ? { 
              duration: 2, 
              repeat: Infinity, 
              ease: "linear" 
            } : {}}
          >
            <StatusIcon className={`w-4 h-4 ${status.color}`} strokeWidth={1.5} />
          </motion.div>
          <span className={`text-sm font-bold ${status.color}`}>
            {status.label}
          </span>
        </div>
      </div>

      <h3 className="font-sans text-2xl text-memorial-ink mb-4 leading-tight font-bold">
        {card.title}
      </h3>

      <p className="text-memorial-muted leading-relaxed mb-6 text-base">
        {card.body}
      </p>

      <div className="flex items-center justify-between mb-4">
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

      {card.supportLink && (
        <motion.div 
          className="pt-6 border-t border-memorial-line"
          variants={{
            initial: { opacity: 0.8 },
            hover: { opacity: 1 }
          }}
        >
          <button className="flex items-center gap-3 text-base text-memorial-muted hover:text-memorial-accent transition-colors group/support font-bold">
            <HeartHandshake className="w-5 h-5 text-memorial-accent" strokeWidth={1.5} />
            <span>{card.supportLink}</span>
            <motion.div
              className="group-hover/support:translate-x-1 transition-transform"
            >
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </motion.div>
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}

export default MissionCard
