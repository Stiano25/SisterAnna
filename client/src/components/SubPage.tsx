import React, { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import ContentCard from "./ContentCard"
import StoryReadingView from "./StoryReadingView"
import PageLoader from "./PageLoader"
import LucideDynamicIcon from "./LucideDynamicIcon"
import DonationLauncher from "./DonationLauncher"
import { categories } from "../data/content"
import { CONTENT_UNAVAILABLE_MESSAGE } from "../constants/messages"
import type {
    PageId,
    ContentCard as ContentCardType
} from "../types"

interface StorySection {
    id: string
    label: string
    cards: ContentCardType[]
}

interface SubPageProps {
    pageId: PageId
    onBack: () => void
}

const pageContent: Record<
    string,
    { quote: string; sections: StorySection[] }
> = {
    visions: {
        quote: "I saw Jesus Christ in a vision. He spoke to me about the Eucharist and the need for devotion.",
        sections: [
            {
                id: "visions-encounters",
                label: "Encounters",
                cards: [
                    {
                        id: "vision-rome",
                        pageId: "visions",
                        eyebrow: "Rome 1987-1988",
                        title: "First Visions of Jesus",
                        body: "During her time in Rome for religious formation, Sister Anna Ali received her first profound visions of Jesus Christ, who spoke to her about the importance of the Eucharist.",
                        tag: "Divine Encounter"
                    }
                ]
            },
            {
                id: "visions-messages",
                label: "Messages",
                cards: [
                    {
                        id: "vision-eucharist",
                        pageId: "visions",
                        eyebrow: "Ongoing Revelations",
                        title: "Messages about the Eucharist",
                        body: "Jesus repeatedly appeared to her with messages about proper reverence for the Eucharist and the need for deeper devotion among the faithful.",
                        tag: "Sacred Teaching"
                    }
                ]
            }
        ]
    },
    life: {
        quote: "From Hadija of Kipkelion to Sister Anna Ali, her life was marked by conversion, deep prayer, suffering with Christ, and mercy for others.",
        sections: [
            {
                id: "life-origins",
                label: "Origins",
                cards: [
                    {
                        id: "birth-kipkelion",
                        pageId: "life",
                        eyebrow: "December 29, 1966",
                        title: "Born at Kipkelion",
                        body: "Born as Hadija to a Muslim family in Kipkelion, Kenya. Her early life was marked by a mysterious seven-year illness that later appeared to prepare her for her calling.",
                        tag: "Early Life"
                    },
                    {
                        id: "healing-nairobi",
                        pageId: "life",
                        eyebrow: "1983",
                        title: "Healing Crusade in Nairobi",
                        body: "At age 17, she attended a healing crusade in Nairobi where she experienced a miraculous healing and conversion to Christianity.",
                        tag: "Conversion"
                    }
                ]
            },
            {
                id: "life-vocation",
                label: "Vocation",
                cards: [
                    {
                        id: "religious-life",
                        pageId: "life",
                        eyebrow: "1986-1991",
                        title: "Entering Religious Life",
                        body: "She joined the Daughters of the Sacred Heart and made her first profession in Rome in 1991, dedicating her life to God and service to the poor.",
                        tag: "Vocation"
                    },
                    {
                        id: "stigmata-thursday",
                        pageId: "life",
                        eyebrow: "25 Years",
                        title: "Weekly Tears of Blood",
                        body: "Every Thursday from her profession until her death, Sister Anna Ali wept tears of blood, mystically sharing in Christ's passion.",
                        tag: "Sacred Wounds"
                    }
                ]
            },
            {
                id: "life-legacy",
                label: "Legacy",
                cards: [
                    {
                        id: "grave-healings",
                        pageId: "life",
                        eyebrow: "Ongoing",
                        title: "Healings at Her Grave",
                        body: "Pilgrims continue to report physical and spiritual healings after prayer at her grave in Burnt Forest.",
                        tag: "Intercession"
                    },
                    {
                        id: "peace-burnt-forest",
                        pageId: "life",
                        eyebrow: "Since 2012",
                        title: "Peace in Burnt Forest",
                        body: "The region, once marked by conflict, has known unusual peace since the day of her death, which many believers connect to her intercession.",
                        tag: "Social Miracle"
                    }
                ]
            }
        ]
    },
    videos: {
        quote: "Watch moments of testimony, prayer, and witness that help tell Sister Anna Ali’s story in living voice and image.",
        sections: [
            {
                id: "videos-testimonies",
                label: "Testimonies",
                cards: [
                    {
                        id: "video-family-testimony",
                        pageId: "videos",
                        eyebrow: "Video Witness",
                        title: "Family Narration: The Journey of Sister Anna",
                        body: "A guided narration by family members sharing key moments from her conversion, vocation, and mystical life. This section can later embed or link to the full video archive.",
                        tag: "Family Story"
                    }
                ]
            },
            {
                id: "videos-devotion",
                label: "Devotions",
                cards: [
                    {
                        id: "video-prayer-reflections",
                        pageId: "videos",
                        eyebrow: "Prayer Collection",
                        title: "Prayer Reflections and Eucharistic Devotions",
                        body: "A curated collection of prayer clips and devotion reflections inspired by her witness, prepared for pilgrims and prayer groups.",
                        tag: "Prayer"
                    }
                ]
            }
        ]
    },
    events: {
        quote: "Join prayer gatherings, remembrance dates, and mission events that continue the grace and witness of Sister Anna Ali.",
        sections: [
            {
                id: "events-upcoming",
                label: "Upcoming",
                cards: [
                    {
                        id: "event-prayer-day",
                        pageId: "events",
                        eyebrow: "Next Gathering",
                        title: "Monthly Prayer and Reflection Day",
                        body: "A recurring gathering for worship, personal testimonies, and intercessory prayer. Replace this placeholder with your confirmed venue, date, and registration details.",
                        tag: "Prayer Event"
                    }
                ]
            },
            {
                id: "events-remembrance",
                label: "Remembrance",
                cards: [
                    {
                        id: "event-anniversary",
                        pageId: "events",
                        eyebrow: "Annual Commemoration",
                        title: "Anniversary Memorial and Pilgrimage",
                        body: "An annual remembrance event centered on thanksgiving, charity outreach, and prayer in memory of Sister Anna Ali’s life and mission.",
                        tag: "Memorial"
                    }
                ]
            }
        ]
    }
}

const SubPage: React.FC<SubPageProps> = ({
    pageId,
    onBack
}) => {
    const [content, setContent] = useState<{
        quote: string
        sections: StorySection[]
    } | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [activeSectionId, setActiveSectionId] =
        useState("")
    const [activeCard, setActiveCard] =
        useState<ContentCardType | null>(null)
    const [apiCategory, setApiCategory] = useState<{
        id: string
        label: string
        iconName?: string
    } | null>(null)

    const category = apiCategory ||
        categories.find(c => c.id === pageId) || {
            id: pageId,
            label:
                pageId.charAt(0).toUpperCase() +
                pageId.slice(1),
            iconName: "Cross"
        }
    const sectionIconName = category.iconName || "Cross"

    useEffect(() => {
        const fetchContent = async () => {
            setIsLoading(true)
            try {
                const response = await fetch(
                    `/api/content/${pageId}`
                )
                if (response.ok) {
                    const data = await response.json()
                    const cards = (data.content ||
                        []) as ContentCardType[]
                    const categoryData = data.category as {
                        id: string
                        label: string
                        iconName?: string
                        iconname?: string
                    } | null
                    setApiCategory(
                        categoryData
                            ? {
                                  ...categoryData,
                                  iconName: String(
                                      categoryData.iconName ??
                                          categoryData.iconname ??
                                          "Cross"
                                  )
                              }
                            : null
                    )
                    setContent({
                        quote: data.quote,
                        sections: [
                            {
                                id: `${pageId}-all`,
                                label: "Details",
                                cards
                            }
                        ]
                    })
                } else {
                    throw new Error("API fetch failed")
                }
            } catch {
                setApiCategory(null)
                setContent(pageContent[pageId] || null)
            } finally {
                setIsLoading(false)
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
        return (
            content.sections.find(
                s => s.id === activeSectionId
            ) || content.sections[0]
        )
    }, [activeSectionId, content])

    if (isLoading) {
        return <PageLoader label="Loading section..." />
    }

    if (!category) {
        return (
            <div className="min-h-screen spiritual-page flex items-center justify-center p-6">
                <p className="text-memorial-muted text-center">
                    {CONTENT_UNAVAILABLE_MESSAGE}
                </p>
            </div>
        )
    }

    if (!content || !activeSection) {
        return (
            <div className="min-h-screen spiritual-page flex items-center justify-center p-6">
                <p className="text-memorial-muted text-center">
                    {CONTENT_UNAVAILABLE_MESSAGE}
                </p>
            </div>
        )
    }

    return (
        <motion.div
            className="min-h-screen spiritual-page"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{
                type: "spring",
                damping: 30,
                stiffness: 300
            }}
        >
            {activeCard ? (
                <StoryReadingView
                    card={activeCard}
                    onBack={() => setActiveCard(null)}
                    categoryLabel={category.label}
                    CategoryIcon={iconProps => (
                        <LucideDynamicIcon
                            name={sectionIconName}
                            {...iconProps}
                        />
                    )}
                />
            ) : (
                <>
                    <div className="sticky top-0 z-10 spiritual-header border-b border-memorial-line">
                        <div className="flex items-center justify-between p-4 sm:p-6">
                            <div className="flex items-center gap-5">
                                <motion.button
                                    onClick={onBack}
                                    className="p-3 rounded-full border border-memorial-line hover:bg-memorial-card/80 spiritual-depth transition-all duration-200 min-h-[48px] min-w-[48px] flex items-center justify-center text-memorial-accent"
                                    whileTap={{
                                        scale: 0.95
                                    }}
                                    whileHover={{ x: -2 }}
                                >
                                    <ArrowLeft
                                        className="w-6 h-6"
                                        strokeWidth={1.5}
                                    />
                                </motion.button>
                                <h1 className="font-sans text-lg sm:text-xl text-memorial-ink font-semibold">
                                    {category.label}
                                </h1>
                            </div>
                            <div className="flex items-center gap-3">
                                <DonationLauncher />
                                <LucideDynamicIcon
                                    name={sectionIconName}
                                    className="w-8 h-8 text-memorial-accent"
                                    strokeWidth={1}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6 spiritual-inset">
                        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-4 sm:gap-5">
                            <aside className="rounded-xl border border-memorial-line bg-white/90 p-4 spiritual-depth h-fit lg:sticky lg:top-24">
                                <motion.blockquote
                                    initial={{
                                        opacity: 0,
                                        y: 12
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0
                                    }}
                                >
                                    <p className="font-sans text-sm text-memorial-muted leading-relaxed">
                                        {content.quote}
                                    </p>
                                </motion.blockquote>
                                <div className="mt-4 overflow-x-auto">
                                    <div className="inline-flex lg:flex lg:flex-col gap-2 min-w-full pb-1">
                                        {content.sections.map(
                                            section => {
                                                const active =
                                                    section.id ===
                                                    activeSection.id
                                                return (
                                                    <button
                                                        key={
                                                            section.id
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            setActiveSectionId(
                                                                section.id
                                                            )
                                                        }
                                                        className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap border transition-colors text-left ${
                                                            active
                                                                ? "bg-indigo-600 text-white border-indigo-600"
                                                                : "bg-white text-memorial-muted border-memorial-line hover:border-indigo-300"
                                                        }`}
                                                    >
                                                        {
                                                            section.label
                                                        }
                                                    </button>
                                                )
                                            }
                                        )}
                                    </div>
                                </div>
                            </aside>

                            <div>
                                <motion.div
                                    key={activeSection.id}
                                    initial={{
                                        opacity: 0,
                                        y: 10
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0
                                    }}
                                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
                                >
                                    {activeSection.cards
                                        .length > 0 ? (
                                        activeSection.cards.map(
                                            card => (
                                                <ContentCard
                                                    key={
                                                        card.id
                                                    }
                                                    card={
                                                        card
                                                    }
                                                    onOpen={c =>
                                                        setActiveCard(
                                                            c
                                                        )
                                                    }
                                                />
                                            )
                                        )
                                    ) : (
                                        <div className="sm:col-span-2 rounded-xl border border-memorial-line bg-white/90 p-6 text-center text-memorial-muted">
                                            {
                                                CONTENT_UNAVAILABLE_MESSAGE
                                            }
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </motion.div>
    )
}

export default SubPage
