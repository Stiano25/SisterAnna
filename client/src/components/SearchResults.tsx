import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, SearchX } from 'lucide-react'
import type { PageId } from '../types'

interface SearchResult {
  id: string
  title: string
  category: string
  pageId: string
}

interface SearchResultsProps {
  query: string
  onNavigate: (pageId: PageId) => void
}

const mockResults: SearchResult[] = [
  {
    id: '1',
    title: 'Visions of Jesus in Rome (1987-1988)',
    category: 'Visions',
    pageId: 'visions'
  },
  {
    id: '2',
    title: 'Weekly tears of blood every Thursday',
    category: 'Personal life',
    pageId: 'life'
  },
  {
    id: '3',
    title: 'The floating Host at her funeral',
    category: 'Personal life',
    pageId: 'life'
  },
  {
    id: '4',
    title: 'Born Hadija at Kipkelion (1966)',
    category: 'Personal life',
    pageId: 'life'
  },
  {
    id: '5',
    title: 'On the Eucharist: A Divine Appeal',
    category: 'Personal life',
    pageId: 'life'
  },
  {
    id: '6',
    title: 'Canonization process underway',
    category: 'Missions',
    pageId: 'mission'
  },
  {
    id: '7',
    title: 'Photographs and gallery',
    category: 'Gallery',
    pageId: 'gallery'
  },
  {
    id: '8',
    title: 'Watch testimonies and devotion videos',
    category: 'Videos',
    pageId: 'videos'
  },
  {
    id: '9',
    title: 'Upcoming prayer gatherings and remembrance events',
    category: 'Events',
    pageId: 'events'
  }
]

const SearchResults: React.FC<SearchResultsProps> = ({ query, onNavigate }) => {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setLoading(true)

    const searchAPI = async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (response.ok) {
          const apiResults = await response.json()
          setResults(apiResults)
        } else {
          throw new Error('API search failed')
        }
      } catch {
        const filtered = mockResults.filter(
          (result) =>
            result.title.toLowerCase().includes(query.toLowerCase()) ||
            result.category.toLowerCase().includes(query.toLowerCase())
        )
        setResults(filtered)
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(searchAPI, 200)
    return () => clearTimeout(timeoutId)
  }, [query])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 flex justify-center">
        <div className="text-memorial-muted text-sm font-medium">Searching...</div>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <motion.div
        className="p-4 sm:p-6 flex flex-col items-center justify-center text-center py-14"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <SearchX className="w-12 h-12 text-memorial-muted/50 mb-4" strokeWidth={1} />
        <p className="font-sans text-lg text-memorial-muted font-medium">
          No results found for &quot;{query}&quot;
        </p>
        <p className="text-memorial-muted mt-1 text-sm">
          Try visions, personal life, missions, gallery, videos, or events
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="p-4 sm:p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="mb-4">
        <p className="text-xs text-memorial-muted font-semibold uppercase tracking-[0.08em]">
          {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
        </p>
      </div>

      <AnimatePresence>
        {results.map((result) => (
          <motion.button
            key={result.id}
            onClick={() => onNavigate(result.pageId as PageId)}
            className="w-full flex items-center gap-4 p-3.5 rounded-xl hover:bg-white spiritual-depth transition-all duration-200 text-left group mb-2.5 min-h-[56px] bg-white/85 border border-slate-200"
            variants={itemVariants}
            layout
            whileTap={{ scale: 0.98 }}
            whileHover={{ x: 4 }}
          >
            <div className="flex-1">
              <div className="text-[11px] uppercase tracking-[0.08em] text-memorial-muted mb-1 font-semibold">
                {result.category}
              </div>
              <div className="font-sans text-base text-memorial-ink leading-snug font-semibold">
                {result.title}
              </div>
            </div>
            <ChevronRight
              className="w-4 h-4 text-indigo-600 group-hover:text-indigo-700 transition-colors flex-shrink-0"
              strokeWidth={1.5}
            />
          </motion.button>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

export default SearchResults
