import React from 'react'
import { motion } from 'framer-motion'
import type { ExplorerCategoryItem } from '../utils/explorerNav'
import type { PageId } from '../types'
import LucideDynamicIcon from './LucideDynamicIcon'

interface CategoryGridProps {
  onNavigate: (pageId: PageId) => void
  /** `null` while loading — shows skeleton. Empty array shows a quiet empty state. */
  items: ExplorerCategoryItem[] | null
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ onNavigate, items }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
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

  if (items === null) {
    return (
      <div className="p-3 sm:p-6" aria-busy="true" aria-label="Loading sections">
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="min-h-[90px] sm:min-h-[108px] rounded-xl border border-slate-200/70 bg-white/50 animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="p-3 sm:p-6">
        <p className="text-sm text-memorial-muted text-center py-8">No sections available yet.</p>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-6">
      <motion.div
        className="grid grid-cols-2 gap-2.5 sm:gap-3.5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {items.map((category) => {
          const customFg = Boolean(category.textColor)
          return (
            <motion.button
              key={category.id}
              onClick={() => onNavigate(category.id as PageId)}
              className={`p-3 sm:p-4 border rounded-xl focus-visible:outline-none spiritual-depth text-left min-h-[90px] sm:min-h-[108px] flex flex-col items-start justify-start gap-1.5 transition-all duration-200 ${
                category.cardColor
                  ? 'border-white/20 hover:border-white/40'
                  : 'border-slate-200 bg-white/95 hover:border-indigo-300'
              } ${!customFg ? 'focus-visible:border-indigo-500' : 'focus-visible:border-white/50'}`}
              style={{
                ...(category.cardColor ? { backgroundColor: category.cardColor } : {}),
                ...(category.textColor ? { color: category.textColor } : {})
              }}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <LucideDynamicIcon
                name={category.iconName || 'Cross'}
                className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 ${customFg ? 'text-current' : 'text-indigo-600'}`}
                strokeWidth={1.5}
              />
              <div className="w-full">
                <div
                  className={`font-semibold text-sm sm:text-[15px] mb-0.5 leading-tight ${
                    customFg ? 'text-current' : 'text-memorial-ink'
                  }`}
                >
                  {category.label}
                </div>
                <div
                  className={`text-[11px] sm:text-xs leading-snug ${
                    customFg ? 'opacity-90' : 'text-memorial-muted'
                  }`}
                >
                  {category.sublabel}
                </div>
              </div>
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}

export default CategoryGrid
