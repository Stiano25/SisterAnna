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
      className="border border-memorial-line rounded-xl p-5 sm:p-6 hover:border-memorial-accent/50 spiritual-card-depth transition-all duration-300 group relative overflow-hidden bg-memorial-card"
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

      <div className="flex items-center justify-between mb-4">
        <div className="text-[11px] uppercase tracking-[0.12em] text-memorial-muted font-semibold">
          {card.eyebrow}
        </div>
        <div className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full ${status.bgColor} border border-memorial-line`}>
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
          <span className={`text-xs font-semibold ${status.color}`}>
            {status.label}
          </span>
        </div>
      </div>

      <h3 className="font-sans text-lg sm:text-xl text-memorial-ink mb-3 leading-tight font-semibold">
        {card.title}
      </h3>

      <p className="text-memorial-muted leading-relaxed mb-5 text-sm sm:text-base">
        {card.body}
      </p>

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-memorial-muted bg-memorial-line/50 px-3 py-1.5 rounded-full font-semibold">
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
          className="pt-4 border-t border-memorial-line"
          variants={{
            initial: { opacity: 0.8 },
            hover: { opacity: 1 }
          }}
        >
          <button className="flex items-center gap-2 text-sm text-memorial-muted hover:text-memorial-accent transition-colors group/support font-semibold">
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
