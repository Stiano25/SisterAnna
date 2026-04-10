import React from 'react'
import { motion } from 'framer-motion'
import { Cross } from 'lucide-react'

interface HeroScreenProps {
  onExplore: () => void
}

const HeroScreen: React.FC<HeroScreenProps> = ({ onExplore }) => {
  const familyMembers = [
    { id: 'f1', role: 'Father', name: 'Abdulrahmani Ali', imageSrc: '/images/family-member-placeholder.svg' },
    { id: 'f2', role: 'Mother', name: 'Priscah Nyambura', imageSrc: '/images/family-member-placeholder.svg' },
    { id: 'f3', role: 'Brother', name: 'Emmanuel AbdulRahmani Ali', imageSrc: '/images/family-member-placeholder.svg' },
    { id: 'f4', role: 'Sister', name: 'Caroline Asha', imageSrc: '/images/family-member-placeholder.svg' },
    { id: 'f5', role: 'Sister', name: 'Mariam Ali', imageSrc: '/images/family-member-placeholder.svg' },
    { id: 'f6', role: 'Brother', name: 'Anthony Amusi', imageSrc: '/images/family-member-placeholder.svg' }
  ]

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
        className="flex-1 flex flex-col justify-center px-4 sm:px-6 py-4 sm:py-6 min-h-0 relative z-10 max-h-[100dvh]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="flex justify-center mb-2 shrink-0" variants={itemVariants}>
          <Cross className="w-10 h-10 text-memorial-accent drop-shadow-sm" strokeWidth={1} />
        </motion.div>

        <div className="mb-3">
          <motion.div className="text-center" variants={itemVariants}>
            <h1 className="font-sans text-3xl sm:text-4xl md:text-[2.7rem] text-white leading-tight tracking-tight text-balance">
              Untold Stories of Sister Anna Ali.
            </h1>
            <p className="mt-1.5 text-sm sm:text-base text-slate-200 font-medium">By Her Parents and Siblings</p>
          </motion.div>
        </div>

        <motion.div className="mb-3" variants={itemVariants}>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-3 max-w-[290px] sm:max-w-[380px] xl:max-w-none mx-auto">
            {familyMembers.map((member) => (
              <div key={member.id} className="w-[88px] sm:w-[112px] justify-self-center text-center">
                <div className="w-full aspect-square overflow-hidden rounded-md border border-white/25 bg-white/10">
                  <img src={member.imageSrc} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <div className="mt-1.5 flex items-center justify-center gap-1.5">
                  <span className="inline-block w-3 h-px bg-indigo-200/90" />
                  <span className="text-[10px] sm:text-[11px] text-indigo-100 font-semibold uppercase tracking-[0.06em]">
                    {member.role}
                  </span>
                </div>
                <p className="mt-1 text-[10px] sm:text-[11px] text-slate-100 font-medium leading-tight text-balance">
                  {member.name}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div className="flex justify-center shrink-0 pt-0.5" variants={itemVariants}>
          <motion.button
            onClick={onExplore}
            className="flex items-center gap-3 px-7 py-3 testimony-cta-button rounded-full font-bold tracking-wide transition-shadow duration-200 min-h-[44px] shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-memorial-accent"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-base">Menu</span>
          </motion.button>
        </motion.div>

      </motion.div>
    </div>
  )
}

export default HeroScreen
