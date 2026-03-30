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
      <div className="p-4 sm:p-8 flex justify-center">
        <div className="text-memorial-muted font-medium">Searching...</div>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <motion.div
        className="p-4 sm:p-8 flex flex-col items-center justify-center text-center py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <SearchX className="w-16 h-16 text-memorial-muted/50 mb-6" strokeWidth={1} />
        <p className="font-sans text-xl text-memorial-muted italic">
          No results found for &quot;{query}&quot;
        </p>
        <p className="text-memorial-muted mt-2">
          Try visions, personal life, missions, or gallery
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="p-4 sm:p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="mb-6">
        <p className="text-sm text-memorial-muted font-bold">
          {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
        </p>
      </div>

      <AnimatePresence>
        {results.map((result) => (
          <motion.button
            key={result.id}
            onClick={() => onNavigate(result.pageId as PageId)}
            className="w-full flex items-center gap-5 p-5 rounded-xl hover:bg-memorial-card spiritual-card-depth transition-all duration-200 text-left group mb-3 min-h-[64px] bg-memorial-card/70 border border-memorial-line"
            variants={itemVariants}
            layout
            whileTap={{ scale: 0.98 }}
            whileHover={{ x: 4 }}
          >
            <div className="flex-1">
              <div className="text-xs uppercase tracking-[0.1em] text-memorial-muted mb-2 font-bold">
                {result.category}
              </div>
              <div className="font-sans text-lg text-memorial-ink leading-snug font-bold">
                {result.title}
              </div>
            </div>
            <ChevronRight
              className="w-5 h-5 text-memorial-accent group-hover:text-memorial-accent transition-colors flex-shrink-0"
              strokeWidth={1.5}
            />
          </motion.button>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

export default SearchResults
