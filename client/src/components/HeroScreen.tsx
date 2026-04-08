import React from 'react'
import { motion } from 'framer-motion'
import { Cross } from 'lucide-react'
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
    <div className="h-[100dvh] min-h-0 flex flex-col bg-memorial relative overflow-hidden spiritual-hero testimony-hero">
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-25"
        >
          <source src="/images/Rosary.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 testimony-hero-overlay" />
        <div className="absolute inset-0 pointer-events-none testimony-hero-vignette" />
      </div>

      <motion.div
        className="flex-1 flex flex-col justify-center px-6 py-8 min-h-0 relative z-10 max-h-[100dvh]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="flex justify-center mb-4 shrink-0"
          variants={itemVariants}
        >
          <Cross className="w-12 h-12 text-memorial-accent drop-shadow-sm" strokeWidth={0.9} />
        </motion.div>

        <motion.div className="text-center mb-3 shrink-0" variants={itemVariants}>
          <p className="text-[11px] md:text-xs text-slate-200/80 tracking-[0.14em] uppercase font-semibold">
            Testimony Of Sister Anna Ali
          </p>
          <h1 className="mt-2.5 font-sans text-3xl sm:text-4xl md:text-5xl text-white leading-tight tracking-tight max-w-3xl mx-auto text-balance">
            A Kenyan girl who experienced the wounds of Jesus on the cross
          </h1>
        </motion.div>

        <motion.div className="text-center mb-2 shrink-0" variants={itemVariants}>
          <p className="text-[11px] text-slate-200/80 tracking-[0.12em] uppercase font-semibold">
            29 Dec 1966 – 6 Jun 2012
          </p>
        </motion.div>

        <motion.div className="flex justify-center mb-5 shrink-0" variants={itemVariants}>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-indigo-300/80 to-transparent" />
        </motion.div>

        <motion.div
          className="text-center mb-6 min-h-[3rem] flex items-center justify-center px-2 sm:px-6 shrink-0"
          variants={itemVariants}
        >
          <p className="font-sans text-sm md:text-base text-slate-200/85 italic leading-snug text-balance max-w-xl font-medium min-h-0 line-clamp-2">
            {typewriterText}
            <span className="animate-pulse text-indigo-200/70">|</span>
          </p>
        </motion.div>

        <motion.div className="flex justify-center shrink-0 pt-1" variants={itemVariants}>
          <motion.button
            onClick={onExplore}
            className="flex items-center gap-3 px-8 py-3.5 testimony-cta-button rounded-full font-bold tracking-wide transition-shadow duration-200 min-h-[48px] shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-memorial-accent"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-base">Menu</span>
          </motion.button>
        </motion.div>

        <motion.p className="text-center mt-3 text-xs text-slate-300/80 max-w-xl mx-auto text-balance" variants={itemVariants}>
          Read prayerfully and with discernment.
        </motion.p>
      </motion.div>
    </div>
  )
}

export default HeroScreen
