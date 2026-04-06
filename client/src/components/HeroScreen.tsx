import React from 'react'
import { motion } from 'framer-motion'
import { Cross, Search } from 'lucide-react'
import { useTypewriter } from '../hooks/useTypewriter'

interface HeroScreenProps {
  onExplore: () => void
}

const HeroScreen: React.FC<HeroScreenProps> = ({ onExplore }) => {
  const typewriterText = useTypewriter()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  }

  return (
    <div className="h-[100dvh] min-h-0 flex flex-col bg-memorial relative overflow-hidden spiritual-hero">
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-10"
        >
          <source src="/images/Rosary.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-memorial/50 via-transparent to-memorial-ink/20" />
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(26,21,16,0.08)]" />
      </div>

      <motion.div
        className="flex-1 flex flex-col justify-center px-6 py-4 min-h-0 relative z-10 max-h-[100dvh]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="flex justify-center mb-4 shrink-0"
          variants={itemVariants}
        >
          <Cross className="w-14 h-14 text-memorial-accent drop-shadow-sm" strokeWidth={0.85} />
        </motion.div>

        <motion.div className="text-center mb-3 shrink-0" variants={itemVariants}>
          <h1 className="font-sans text-4xl md:text-5xl text-memorial-ink leading-[0.95] tracking-tight drop-shadow-sm">
            <div className="font-normal">Sister</div>
            <div className="italic font-bold">Anna Ali</div>
          </h1>
        </motion.div>

        <motion.div className="text-center mb-3 shrink-0" variants={itemVariants}>
          <p className="text-xs text-memorial-muted tracking-[0.15em] uppercase font-bold">
            29 Dec 1966 – 6 Jun 2012
          </p>
          <p className="mt-2 text-lg md:text-xl text-memorial-ink font-bold">
            Biography of Sister Anna Ali as narrated by the family
          </p>
        </motion.div>

        <motion.div className="flex justify-center mb-4 shrink-0" variants={itemVariants}>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-memorial-accent/45 to-transparent" />
        </motion.div>

        <motion.div
          className="text-center mb-5 min-h-[3.5rem] flex items-center justify-center px-6 shrink-0"
          variants={itemVariants}
        >
          <p className="font-sans text-sm md:text-lg text-memorial-muted italic leading-snug text-balance max-w-md font-medium line-clamp-3 min-h-0">
            {typewriterText}
            <span className="animate-pulse text-memorial-muted/70">|</span>
          </p>
        </motion.div>

        <motion.div className="flex justify-center shrink-0 pt-1" variants={itemVariants}>
          <motion.button
            onClick={onExplore}
            className="flex items-center gap-3 px-8 py-3.5 bg-memorial-ink text-memorial-card rounded-full font-bold tracking-wide transition-shadow duration-200 min-h-[48px] shadow-lg hover:bg-memorial-ink hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-memorial-accent"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <Search className="w-5 h-5 text-memorial-card" strokeWidth={1.5} />
            <span className="text-base">Menu</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default HeroScreen
