import React, { useState } from "react"
import { motion } from "framer-motion"
import { useTypewriter } from "../hooks/useTypewriter"
import DonationLauncher from "./DonationLauncher"

const PORTRAIT_SRC = "/images/SisterAnn2.JPG"

interface HeroScreenProps {
    onExplore: () => void
}

const HeroScreen: React.FC<HeroScreenProps> = ({
    onExplore
}) => {
    const typewriterText = useTypewriter()
    const [bgImageFailed, setBgImageFailed] =
        useState(false)
    const [avatarFailed, setAvatarFailed] = useState(false)

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.12,
                delayChildren: 0.05
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 12 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    }

    return (
        <div className="h-[100dvh] min-h-0 flex flex-col bg-memorial relative overflow-hidden spiritual-hero testimony-hero">
            <div className="absolute inset-0 z-0">
                {!bgImageFailed ? (
                    <img
                        src={PORTRAIT_SRC}
                        alt=""
                        className="w-full h-full object-cover object-[center_20%]"
                        onError={() =>
                            setBgImageFailed(true)
                        }
                        aria-hidden
                    />
                ) : null}
                <div className="absolute inset-0 testimony-hero-overlay" />
                <div className="absolute inset-0 pointer-events-none testimony-hero-vignette" />
            </div>

            <motion.div
                className="flex-1 flex flex-col justify-center px-6 py-8 min-h-0 relative z-10 max-h-[100dvh] overflow-y-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div
                    className="flex justify-center mb-4 shrink-0"
                    variants={itemVariants}
                >
                    {!avatarFailed ? (
                        <img
                            src={PORTRAIT_SRC}
                            alt="Sister Anna Ali"
                            className="w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] rounded-full object-cover object-[center_15%] ring-2 ring-white/40 shadow-lg border border-white/20"
                            onError={() =>
                                setAvatarFailed(true)
                            }
                        />
                    ) : (
                        <div
                            className="w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] rounded-full bg-white/10 ring-2 ring-white/30 border border-white/20"
                            aria-hidden
                        />
                    )}
                </motion.div>

                <motion.div
                    className="text-center mb-3 shrink-0"
                    variants={itemVariants}
                >
                    <p className="text-xs md:text-sm text-slate-200/85 tracking-[0.14em] uppercase font-semibold">
                        Testimony Of Sister Anna Ali
                    </p>
                    <h1 className="mt-2.5 font-sans text-3xl sm:text-4xl md:text-5xl text-white leading-tight tracking-tight max-w-3xl mx-auto text-balance">
                        A Kenyan girl who experienced the
                        wounds of Jesus Christ on the cross
                    </h1>
                </motion.div>

                <motion.div
                    className="text-center mb-2 shrink-0"
                    variants={itemVariants}
                >
                    <p className="text-[11px] text-slate-200/80 tracking-[0.12em] uppercase font-semibold">
                        29 Dec 1966 – 6 Jun 2012
                    </p>
                </motion.div>

                <motion.div
                    className="flex justify-center mb-5 shrink-0"
                    variants={itemVariants}
                >
                    <div className="w-32 h-px bg-gradient-to-r from-transparent via-indigo-300/80 to-transparent" />
                </motion.div>

                <motion.div
                    className="text-center mb-6 min-h-[3rem] flex items-center justify-center px-2 sm:px-6 shrink-0"
                    variants={itemVariants}
                >
                    <p className="font-sans text-sm md:text-base text-slate-200/85 italic leading-snug text-balance max-w-xl font-medium min-h-0 line-clamp-2">
                        {typewriterText}
                        <span className="animate-pulse text-indigo-200/70">
                            |
                        </span>
                    </p>
                </motion.div>

                <motion.div
                    className="flex justify-center shrink-0 pt-1"
                    variants={itemVariants}
                >
                    <motion.button
                        onClick={onExplore}
                        className="flex items-center gap-3 px-8 py-3.5 testimony-cta-button rounded-full font-bold tracking-wide transition-shadow duration-200 min-h-[48px] shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-memorial-accent"
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <span className="text-base">
                            Menu
                        </span>
                    </motion.button>
                    <div className="ml-3">
                        <DonationLauncher variant="hero" />
                    </div>
                </motion.div>

                <motion.nav
                    className="sr-only"
                    aria-label="Key site sections"
                    variants={itemVariants}
                >
                    <p className="text-[11px] uppercase tracking-[0.1em] text-slate-200/80 mb-2">
                        Explore sections
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs sm:text-sm">
                        <a
                            className="text-indigo-100/90 hover:text-white underline underline-offset-2"
                            href="/life"
                        >
                            Personal Life
                        </a>
                        <a
                            className="text-indigo-100/90 hover:text-white underline underline-offset-2"
                            href="/visions"
                        >
                            Visions
                        </a>
                        <a
                            className="text-indigo-100/90 hover:text-white underline underline-offset-2"
                            href="/mission"
                        >
                            Missions
                        </a>
                        <a
                            className="text-indigo-100/90 hover:text-white underline underline-offset-2"
                            href="/gallery"
                        >
                            Gallery
                        </a>
                        <a
                            className="text-indigo-100/90 hover:text-white underline underline-offset-2"
                            href="/videos"
                        >
                            Videos
                        </a>
                        <a
                            className="text-indigo-100/90 hover:text-white underline underline-offset-2"
                            href="/events"
                        >
                            Events
                        </a>
                    </div>
                </motion.nav>
            </motion.div>
        </div>
    )
}

export default HeroScreen
