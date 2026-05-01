import React, { useState } from "react"
import DonationModal, { DonationStatus } from "./DonationModal"

interface DonationLauncherProps {
    variant?: "hero" | "header"
    className?: string
    onStatus?: (status: DonationStatus | null) => void
}

const DonationLauncher: React.FC<DonationLauncherProps> = ({
    variant = "header",
    className,
    onStatus
}) => {
    const [open, setOpen] = useState(false)

    const buttonClass =
        variant === "hero"
            ? "px-6 py-3 rounded-full border border-white/30 text-white font-semibold hover:bg-white/10 transition-all"
            : "px-4 py-2 rounded-full bg-memorial-accent text-white text-sm font-semibold shadow-sm hover:shadow-md"

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={`${buttonClass} ${className ?? ""}`.trim()}
            >
                Donate
            </button>
            <DonationModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onStatus={onStatus}
            />
        </>
    )
}

export default DonationLauncher
