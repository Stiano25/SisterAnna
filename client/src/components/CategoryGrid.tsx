import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, Cross, Compass, Image, Video, Calendar } from 'lucide-react'
import { categories } from '../data/content'
import type { PageId } from '../types'

interface CategoryGridProps {
  onNavigate: (pageId: PageId) => void
}

const iconMap = {
  Eye,
  Cross,
  Compass,
  Image,
  Video,
  Calendar
}

type CategoryItem = {
  id: string
  label: string
  sublabel: string
  iconName: string
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ onNavigate }) => {
  const [items, setItems] = useState<CategoryItem[]>(categories)

  useEffect(() => {
    let cancelled = false
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (!response.ok) throw new Error('Failed to load categories')
        const data = (await response.json()) as CategoryItem[]
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setItems(data)
        }
      } catch {
        if (!cancelled) {
          setItems(categories)
        }
      }
    }

    void loadCategories()
    return () => {
      cancelled = true
    }
  }, [])

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
    <div className="p-3 sm:p-6">
      <motion.div
        className="grid grid-cols-2 gap-2.5 sm:gap-3.5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {items.map((category) => {
          const IconComponent = iconMap[category.iconName as keyof typeof iconMap] || Cross

          return (
            <motion.button
              key={category.id}
              onClick={() => onNavigate(category.id as PageId)}
              className="p-3 sm:p-4 border border-slate-200 rounded-xl hover:border-indigo-300 focus-visible:border-indigo-500 focus-visible:outline-none spiritual-depth text-left min-h-[90px] sm:min-h-[108px] flex flex-col items-start justify-start gap-1.5 bg-white/95 transition-all duration-200"
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" strokeWidth={1.5} />
              <div className="w-full">
                <div className="font-semibold text-sm sm:text-[15px] text-memorial-ink mb-0.5 leading-tight">
                  {category.label}
                </div>
                <div className="text-[11px] sm:text-xs text-memorial-muted leading-snug">{category.sublabel}</div>
              </div>
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}

export default CategoryGrid
