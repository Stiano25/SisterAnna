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
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-memorial-line spiritual-header">
          <h2 className="font-sans text-lg sm:text-xl text-memorial-ink font-semibold">
            Sister Anna Ali
          </h2>
          <motion.button
            onClick={onClose}
            className="p-3 rounded-full hover:bg-slate-100 spiritual-depth transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center text-indigo-600"
            whileHover={{ rotate: 90, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-6 h-6" strokeWidth={1.5} />
          </motion.button>
        </div>

        <div className="px-4 sm:px-6 pt-3.5 sm:pt-4 pb-3.5 border-b border-memorial-line">
          <div className="flex items-center gap-3 rounded-xl border border-memorial-line bg-memorial-card px-3">
            <Search className="w-4 h-4 text-slate-500 flex-shrink-0" strokeWidth={1.8} />
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
                className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none py-2.5 pr-8 text-sm text-slate-900 placeholder:text-slate-400 transition-colors rounded-none shadow-none"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600 transition-colors"
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

        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-slate-100/70">
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
