import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Compass } from "lucide-react"
import MissionCard from "./MissionCard"
import StoryReadingView from "./StoryReadingView"
import { CONTENT_UNAVAILABLE_MESSAGE } from "../constants/messages"
import DonationLauncher from "./DonationLauncher"
import type {
    MissionCard as MissionCardType,
    ContentCard
} from "../types"

interface MissionPageProps {
    onBack: () => void
}

const MissionPage: React.FC<MissionPageProps> = ({
    onBack
}) => {
    const [quote, setQuote] = useState("")
    const [cards, setCards] = useState<MissionCardType[]>(
        []
    )
    const [categoryLabel, setCategoryLabel] =
        useState("Missions")
    const [activeCard, setActiveCard] =
        useState<MissionCardType | null>(null)

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            try {
                const response = await fetch(
                    "/api/content/mission"
                )
                if (!response.ok)
                    throw new Error(
                        "Failed to load mission"
                    )
                const data = (await response.json()) as {
                    category: { label?: string } | null
                    content: MissionCardType[]
                    quote: string
                }
                if (cancelled) return
                setQuote(data.quote || "")
                setCategoryLabel(
                    data.category?.label ?? "Missions"
                )
                setCards(
                    Array.isArray(data.content)
                        ? data.content
                        : []
                )
            } catch {
                if (!cancelled) {
                    setCards([])
                }
            }
        }
        void load()
        return () => {
            cancelled = true
        }
    }, [])

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
                    card={activeCard as ContentCard}
                    onBack={() => setActiveCard(null)}
                    categoryLabel={categoryLabel}
                    CategoryIcon={Compass}
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
                                    {categoryLabel}
                                </h1>
                            </div>
                            <div className="flex items-center gap-3">
                                <DonationLauncher />
                                <Compass
                                    className="w-10 h-10 text-memorial-accent"
                                    strokeWidth={0.8}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6 spiritual-inset space-y-6">
                        {quote ? (
                            <motion.blockquote
                                className="spiritual-quote border border-memorial-line bg-memorial-card/80 p-4 sm:p-5 rounded-xl shadow-sm"
                                initial={{
                                    opacity: 0,
                                    y: 10
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0
                                }}
                            >
                                <p className="font-sans text-base sm:text-lg text-memorial-muted leading-relaxed">
                                    {quote}
                                </p>
                            </motion.blockquote>
                        ) : null}

                        {cards.length === 0 ? (
                            <p className="text-memorial-muted text-center py-12 text-sm">
                                {
                                    CONTENT_UNAVAILABLE_MESSAGE
                                }
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-4 sm:gap-5">
                                <aside className="rounded-xl border border-memorial-line bg-white/90 p-4 spiritual-depth h-fit lg:sticky lg:top-24">
                                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-memorial-muted mb-2">
                                        Mission Overview
                                    </p>
                                    <p className="text-sm text-memorial-muted leading-relaxed">
                                        Explore ongoing
                                        work, upcoming
                                        plans, and practical
                                        ways to support each
                                        mission stream.
                                    </p>
                                </aside>
                                <motion.div
                                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
                                    initial={{
                                        opacity: 0,
                                        y: 10
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0
                                    }}
                                >
                                    {cards.map(card => (
                                        <div
                                            key={card.id}
                                            role="button"
                                            tabIndex={0}
                                            className="cursor-pointer rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-memorial-accent focus-visible:ring-offset-2"
                                            onClick={() =>
                                                setActiveCard(
                                                    card
                                                )
                                            }
                                            onKeyDown={e => {
                                                if (
                                                    e.key ===
                                                        "Enter" ||
                                                    e.key ===
                                                        " "
                                                ) {
                                                    e.preventDefault()
                                                    setActiveCard(
                                                        card
                                                    )
                                                }
                                            }}
                                        >
                                            <MissionCard
                                                card={card}
                                            />
                                        </div>
                                    ))}
                                </motion.div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </motion.div>
    )
}

export default MissionPage
