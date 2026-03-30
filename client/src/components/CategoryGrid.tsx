import React from 'react'
import { motion } from 'framer-motion'
import { Eye, Cross, Compass, Image } from 'lucide-react'
import { categories } from '../data/content'
import type { PageId } from '../types'

interface CategoryGridProps {
  onNavigate: (pageId: PageId) => void
}

const iconMap = {
  Eye,
  Cross,
  Compass,
  Image
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ onNavigate }) => {
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

  return (
    <div className="p-4 sm:p-8">
      <motion.div
        className="grid grid-cols-2 gap-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {categories.map((category) => {
          const IconComponent = iconMap[category.iconName as keyof typeof iconMap]

          return (
            <motion.button
              key={category.id}
              onClick={() => onNavigate(category.id as PageId)}
              className="p-5 border border-memorial-line rounded-2xl hover:border-memorial-accent/60 focus-visible:border-memorial-accent focus-visible:outline-none spiritual-card-depth text-center min-h-[128px] flex flex-col items-center justify-center gap-2 bg-memorial-card/90"
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <IconComponent className="w-8 h-8 text-memorial-accent" strokeWidth={1.2} />
              <div>
                <div className="font-bold text-sm text-memorial-ink mb-1 leading-tight">
                  {category.label}
                </div>
                <div className="text-xs text-memorial-muted leading-snug">{category.sublabel}</div>
              </div>
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}

export default CategoryGrid
