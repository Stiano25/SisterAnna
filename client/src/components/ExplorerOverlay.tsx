import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search } from 'lucide-react'
import CategoryGrid from './CategoryGrid'
import QuickLinks from './QuickLinks'
import SearchResults from './SearchResults'
import type { PageId } from '../types'

interface ExplorerOverlayProps {
  onClose: () => void
  onNavigate: (pageId: PageId) => void
}

const ExplorerOverlay: React.FC<ExplorerOverlayProps> = ({ onClose, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('')

  const clearSearch = () => setSearchQuery('')

  return (
    <motion.div
      className="fixed inset-0 z-50 spiritual-page bg-memorial"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-8 border-b border-memorial-line spiritual-header">
          <h2 className="font-sans text-xl sm:text-2xl italic text-memorial-ink font-bold">
            Sister Anna Ali
          </h2>
          <motion.button
            onClick={onClose}
            className="p-3 rounded-full hover:bg-memorial-card/80 spiritual-depth transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center text-memorial-accent"
            whileHover={{ rotate: 90, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-6 h-6" strokeWidth={1.5} />
          </motion.button>
        </div>

        <div className="px-4 sm:px-8 pt-4 sm:pt-6 pb-4 border-b border-memorial-line">
          <div className="flex items-end gap-3">
            <Search className="w-5 h-5 text-memorial-accent flex-shrink-0 mb-2.5" strokeWidth={1.5} />
            <div className="flex-1 min-w-0 relative">
              <label htmlFor="explorer-search" className="sr-only">
                Search her story
              </label>
              <input
                id="explorer-search"
                type="search"
                placeholder="Search her story…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-0 border-b-2 border-memorial-line focus:border-memorial-accent focus:ring-0 focus:outline-none py-2 pr-10 text-base text-memorial-ink placeholder:text-memorial-muted/70 transition-colors rounded-none shadow-none"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-0 bottom-2 p-1 text-memorial-muted hover:text-memorial-accent transition-colors"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-memorial-card/50 to-memorial">
          <AnimatePresence mode="wait">
            {searchQuery ? (
              <SearchResults key="search" query={searchQuery} onNavigate={onNavigate} />
            ) : (
              <motion.div
                key="browse"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CategoryGrid onNavigate={onNavigate} />
                <QuickLinks onNavigate={onNavigate} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

export default ExplorerOverlay
