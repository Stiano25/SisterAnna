import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Eye, Cross } from 'lucide-react'
import ContentCard from './ContentCard'
import StoryIntroModal from './StoryIntroModal'
import { categories } from '../data/content'
import type { PageId, ContentCard as ContentCardType } from '../types'

interface StorySection {
  id: string
  label: string
  cards: ContentCardType[]
}

interface SubPageProps {
  pageId: PageId
  onBack: () => void
}

const iconMap = {
  Eye,
  Cross
}

const pageContent: Record<string, { quote: string; sections: StorySection[] }> = {
  visions: {
    quote:
      'I saw Jesus Christ in a vision. He spoke to me about the Eucharist and the need for devotion.',
    sections: [
      {
        id: 'visions-encounters',
        label: 'Encounters',
        cards: [
          {
            id: 'vision-rome',
            pageId: 'visions',
            eyebrow: 'Rome 1987-1988',
            title: 'First Visions of Jesus',
            body:
              'During her time in Rome for religious formation, Sister Anna Ali received her first profound visions of Jesus Christ, who spoke to her about the importance of the Eucharist.',
            tag: 'Divine Encounter'
          }
        ]
      },
      {
        id: 'visions-messages',
        label: 'Messages',
        cards: [
          {
            id: 'vision-eucharist',
            pageId: 'visions',
            eyebrow: 'Ongoing Revelations',
            title: 'Messages about the Eucharist',
            body:
              'Jesus repeatedly appeared to her with messages about proper reverence for the Eucharist and the need for deeper devotion among the faithful.',
            tag: 'Sacred Teaching'
          }
        ]
      }
    ]
  },
  life: {
    quote:
      'From Hadija of Kipkelion to Sister Anna Ali, her life was marked by conversion, deep prayer, suffering with Christ, and mercy for others.',
    sections: [
      {
        id: 'life-origins',
        label: 'Origins',
        cards: [
          {
            id: 'birth-kipkelion',
            pageId: 'life',
            eyebrow: 'December 29, 1966',
            title: 'Born at Kipkelion',
            body:
              'Born as Hadija to a Muslim family in Kipkelion, Kenya. Her early life was marked by a mysterious seven-year illness that later appeared to prepare her for her calling.',
            tag: 'Early Life'
          },
          {
            id: 'healing-nairobi',
            pageId: 'life',
            eyebrow: '1983',
            title: 'Healing Crusade in Nairobi',
            body:
              'At age 17, she attended a healing crusade in Nairobi where she experienced a miraculous healing and conversion to Christianity.',
            tag: 'Conversion'
          }
        ]
      },
      {
        id: 'life-vocation',
        label: 'Vocation',
        cards: [
          {
            id: 'religious-life',
            pageId: 'life',
            eyebrow: '1986-1991',
            title: 'Entering Religious Life',
            body:
              'She joined the Daughters of the Sacred Heart and made her first profession in Rome in 1991, dedicating her life to God and service to the poor.',
            tag: 'Vocation'
          },
          {
            id: 'stigmata-thursday',
            pageId: 'life',
            eyebrow: '25 Years',
            title: 'Weekly Tears of Blood',
            body:
              "Every Thursday from her profession until her death, Sister Anna Ali wept tears of blood, mystically sharing in Christ's passion.",
            tag: 'Sacred Wounds'
          }
        ]
      },
      {
        id: 'life-legacy',
        label: 'Legacy',
        cards: [
          {
            id: 'grave-healings',
            pageId: 'life',
            eyebrow: 'Ongoing',
            title: 'Healings at Her Grave',
            body:
              'Pilgrims continue to report physical and spiritual healings after prayer at her grave in Burnt Forest.',
            tag: 'Intercession'
          },
          {
            id: 'peace-burnt-forest',
            pageId: 'life',
            eyebrow: 'Since 2012',
            title: 'Peace in Burnt Forest',
            body:
              'The region, once marked by conflict, has known unusual peace since the day of her death, which many believers connect to her intercession.',
            tag: 'Social Miracle'
          }
        ]
      }
    ]
  }
}

const SubPage: React.FC<SubPageProps> = ({ pageId, onBack }) => {
  const [content, setContent] = useState<{ quote: string; sections: StorySection[] } | null>(null)
  const [activeSectionId, setActiveSectionId] = useState('')

  const category = categories.find((c) => c.id === pageId)
  const IconComponent = category ? iconMap[category.iconName as keyof typeof iconMap] : Cross

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/content/${pageId}`)
        if (response.ok) {
          const data = await response.json()
          const cards = (data.content || []) as ContentCardType[]
          setContent({
            quote: data.quote,
            sections: [
              {
                id: `${pageId}-all`,
                label: 'Details',
                cards
              }
            ]
          })
        } else {
          throw new Error('API fetch failed')
        }
      } catch {
        setContent(pageContent[pageId] || null)
      }
    }

    fetchContent()
  }, [pageId])

  useEffect(() => {
    if (content?.sections?.length) {
      setActiveSectionId(content.sections[0].id)
    }
  }, [content])

  const activeSection = useMemo(() => {
    if (!content?.sections?.length) return null
    return content.sections.find((s) => s.id === activeSectionId) || content.sections[0]
  }, [activeSectionId, content])

  if (!content || !category || !activeSection) {
    return <div className="min-h-screen bg-memorial spiritual-page" />
  }

  return (
    <motion.div
      className="min-h-screen spiritual-page"
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
    >
      <StoryIntroModal onContinue={() => undefined} />

      <div className="sticky top-0 z-10 spiritual-header border-b border-memorial-line">
        <div className="flex items-center justify-between p-8">
          <div className="flex items-center gap-5">
            <motion.button
              onClick={onBack}
              className="p-3 rounded-full border border-memorial-line hover:bg-memorial-card/80 spiritual-depth transition-all duration-200 min-h-[48px] min-w-[48px] flex items-center justify-center text-memorial-accent"
              whileTap={{ scale: 0.95 }}
              whileHover={{ x: -2 }}
            >
              <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
            </motion.button>
            <h1 className="font-sans text-2xl italic text-memorial-ink font-bold">{category.label}</h1>
          </div>
          <IconComponent className="w-10 h-10 text-memorial-accent" strokeWidth={0.8} />
        </div>
      </div>

      <div className="p-8 spiritual-inset">
        <motion.blockquote
          className="spiritual-quote border-l-4 border-memorial-accent pl-8 mb-8 bg-memorial-card/60 p-6 rounded-r-2xl shadow-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="font-sans text-xl italic text-memorial-muted leading-relaxed">{content.quote}</p>
        </motion.blockquote>

        <div className="mb-6 overflow-x-auto">
          <div className="inline-flex gap-2 min-w-full pb-1">
            {content.sections.map((section) => {
              const active = section.id === activeSection.id
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSectionId(section.id)}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap border transition-colors ${
                    active
                      ? 'bg-memorial-accent text-memorial-card border-memorial-accent'
                      : 'bg-memorial-card text-memorial-muted border-memorial-line hover:border-memorial-accent/60'
                  }`}
                >
                  {section.label}
                </button>
              )
            })}
          </div>
        </div>

        <motion.div
          key={activeSection.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {activeSection.cards.map((card) => (
            <ContentCard key={card.id} card={card} />
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default SubPage
