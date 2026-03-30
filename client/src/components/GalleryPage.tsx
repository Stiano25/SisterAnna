import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Image as ImageIcon } from 'lucide-react'

interface GalleryPageProps {
  onBack: () => void
}

const GalleryPage: React.FC<GalleryPageProps> = ({ onBack }) => {
  return (
    <motion.div
      className="min-h-screen spiritual-page bg-memorial"
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
    >
      <div className="sticky top-0 z-10 spiritual-header border-b border-memorial-line">
        <div className="flex items-center justify-between p-4 sm:p-8">
          <div className="flex items-center gap-5">
            <motion.button
              onClick={onBack}
              className="p-3 rounded-full border border-memorial-line hover:bg-memorial-card/80 spiritual-depth transition-all duration-200 min-h-[48px] min-w-[48px] flex items-center justify-center text-memorial-accent"
              whileTap={{ scale: 0.95 }}
              whileHover={{ x: -2 }}
            >
              <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
            </motion.button>
            <h1 className="font-sans text-xl sm:text-2xl italic text-memorial-ink font-bold">
              Gallery
            </h1>
          </div>
          <ImageIcon className="w-10 h-10 text-memorial-accent" strokeWidth={0.8} />
        </div>
      </div>

      <div className="p-4 sm:p-8 spiritual-inset">
        <div className="rounded-2xl border border-dashed border-memorial-line bg-memorial-card spiritual-card-depth p-8 sm:p-12 text-center">
          <ImageIcon className="w-14 h-14 text-memorial-accent/50 mx-auto mb-6" strokeWidth={0.9} />
          <p className="text-memorial-muted text-lg leading-relaxed max-w-sm mx-auto">
            The images aren&apos;t uploaded yet. Please check back soon.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default GalleryPage
