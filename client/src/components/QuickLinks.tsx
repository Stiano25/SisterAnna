import React from 'react'
import { motion } from 'framer-motion'
import { Dot, ChevronRight } from 'lucide-react'
import { quickLinks } from '../data/content'
import type { PageId } from '../types'

interface QuickLinksProps {
  onNavigate: (pageId: PageId) => void
}

const QuickLinks: React.FC<QuickLinksProps> = ({ onNavigate }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' }
    }
  }

  return (
    <div className="px-4 sm:px-6 pb-6 sm:pb-7">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h3 
          className="text-xs font-semibold text-memorial-muted mb-4 uppercase tracking-[0.1em]"
          variants={itemVariants}
        >
          Quick Questions
        </motion.h3>
        
        <div className="space-y-2">
          {quickLinks.map((link) => (
            <motion.button
              key={link.id}
              onClick={() => onNavigate(link.pageId as PageId)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white spiritual-depth transition-all duration-200 text-left group min-h-[50px] bg-white/80 border border-slate-200"
              variants={itemVariants}
              whileTap={{ scale: 0.98 }}
              whileHover={{ x: 3 }}
            >
              <Dot className="w-4 h-4 text-indigo-600 flex-shrink-0" strokeWidth={2} />
              <span className="font-sans text-memorial-ink flex-1 text-sm leading-snug">
                {link.question}
              </span>
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-4 h-4 text-indigo-600 group-hover:text-indigo-700 transition-colors" strokeWidth={1.5} />
              </motion.div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default QuickLinks
