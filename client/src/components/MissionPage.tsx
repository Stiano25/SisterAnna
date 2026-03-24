import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Compass, CheckCircle2 } from 'lucide-react'

interface MissionPageProps {
  onBack: () => void
}

const MissionPage: React.FC<MissionPageProps> = ({ onBack }) => {
  return (
    <motion.div
      className="min-h-screen spiritual-page"
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
    >
      <div className="sticky top-0 z-10 spiritual-header border-b border-memorial-line">
        <div className="flex items-center justify-between p-8">
          <div className="flex items-center gap-5">
            <motion.button
              onClick={onBack}
              className="p-3 rounded-full border border-memorial-line hover:bg-memorial-card/80 spiritual-depth transition-all duration-200 min-h-[48px] min-w-[48px] flex items-center justify-center text-memorial-accent"
              whileTap={{ scale: 0.95 }}
              whileHover={{ x: -2 }}
            >
              <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
            </motion.button>
            <h1 className="font-sans text-2xl italic text-memorial-ink font-bold">Mother&apos;s Home Project</h1>
          </div>
          <Compass className="w-10 h-10 text-memorial-accent" strokeWidth={0.8} />
        </div>
      </div>

      <div className="p-8 spiritual-inset space-y-8">
        <motion.blockquote
          className="spiritual-quote border-l-4 border-memorial-accent pl-8 bg-memorial-card/70 p-6 rounded-r-2xl shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="font-sans text-xl italic text-memorial-muted leading-relaxed">
            This mission focuses on one work: building a safe home for Sister Anna&apos;s mother.
          </p>
        </motion.blockquote>

        <motion.div
          className="grid grid-cols-1 gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <img
            src="/images/SisterHome.jpg"
            alt="Mother's home project visual"
            className="w-full h-64 object-contain bg-memorial-card border border-memorial-line rounded-xl p-2"
          />
        </motion.div>

        <div className="bg-memorial-card border border-memorial-line rounded-2xl p-6 spiritual-card-depth">
          <h2 className="text-xl text-memorial-ink mb-3">Project summary</h2>
          <p className="text-memorial-muted leading-relaxed mb-4">
            Funds support materials, labor, and finishing work for a permanent home. This replaces all previous mission items so support stays focused on one family need.
          </p>
          <div className="space-y-2 text-memorial-muted">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-memorial-accent" />
              <span>Foundation planning and site prep</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-memorial-accent" />
              <span>Walling and roofing phases</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-memorial-accent" />
              <span>Interior finishing and handover</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default MissionPage
