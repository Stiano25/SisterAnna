import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

interface StoryIntroModalProps {
  onContinue: () => void
  buttonLabel?: string
}

const StoryIntroModal: React.FC<StoryIntroModalProps> = ({
  onContinue,
  buttonLabel = 'Continue reading'
}) => {
  const [open, setOpen] = useState(true)

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  const handleContinue = () => {
    setOpen(false)
    onContinue()
  }

  const modalContent = (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[300] grid place-items-center p-4 bg-memorial-ink/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="house-fund-title"
        >
          <motion.div
            className="relative z-[301] spiritual-modal max-w-md w-full max-h-[90dvh] overflow-y-auto p-6 rounded-2xl shadow-2xl border border-memorial-line bg-memorial-card"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <p className="text-2xs uppercase tracking-[0.2em] text-memorial-accent font-bold mb-3">
              Before you read
            </p>
            <h2
              id="house-fund-title"
              className="font-sans text-xl font-bold text-memorial-ink mb-4 leading-snug"
            >
              A home for Sister Anna&apos;s mother
            </h2>
            <p className="text-memorial-muted text-sm leading-relaxed mb-6">
              Before reading, please see the house-construction project for Sister Anna&apos;s mother.
            </p>
            <img
              src="/images/SisterHome.jpg"
              alt="Mother's house project"
              className="w-full h-52 object-contain rounded-xl border border-memorial-line mb-5 bg-memorial-card p-2"
            />
            <div className="rounded-xl bg-memorial-card border border-memorial-line p-4 mb-6 text-sm text-memorial-muted space-y-2">
              <p className="font-bold text-memorial-ink">Payment details</p>
              <p>
                <span className="text-memorial-muted">M-Pesa / Pay bill:</span>{' '}
                <span className="font-mono text-memorial-ink">[To be announced]</span>
              </p>
              <p>
                <span className="text-memorial-muted">Bank / reference:</span>{' '}
                <span className="font-mono text-memorial-ink">[To be announced]</span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleContinue}
              className="w-full py-3.5 px-4 rounded-full bg-memorial-ink text-memorial-card font-bold text-sm tracking-wide shadow-lg hover:opacity-95 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-memorial-accent"
            >
              {buttonLabel}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  if (typeof document === 'undefined') {
    return null
  }

  return (
    createPortal(modalContent, document.body)
  )
}

export default StoryIntroModal
