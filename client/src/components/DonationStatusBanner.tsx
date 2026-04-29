import React, { useEffect, useState } from "react"
import {
    CheckCircle2,
    AlertTriangle,
    X,
    Loader2,
    Heart
} from "lucide-react"

interface DonationStatusBannerProps {
    status: "verifying" | "successful" | "failed"
    message: string
    onClose: () => void
}

const DonationStatusBanner: React.FC<
    DonationStatusBannerProps
> = ({ status, message, onClose }) => {
    // Countdown progress bar (only shown for success/failed, dismissed after 5s)
    const [progress, setProgress] = useState(100)

    useEffect(() => {
        if (status === "verifying") return
        const duration = 5000
        const interval = 50
        const step = (interval / duration) * 100
        const timer = setInterval(() => {
            setProgress(p => {
                const next = p - step
                return next <= 0 ? 0 : next
            })
        }, interval)
        return () => clearInterval(timer)
    }, [status])

    const styles = {
        successful: {
            wrap: "border-emerald-200 bg-emerald-50 text-emerald-800",
            bar: "bg-emerald-400"
        },
        failed: {
            wrap: "border-red-200 bg-red-50 text-red-800",
            bar: "bg-red-400"
        },
        verifying: {
            wrap: "border-amber-200 bg-amber-50 text-amber-800",
            bar: "bg-amber-400"
        }
    }[status]

    return (
        <div
            className={`fixed top-4 left-1/2 z-50 w-[min(92vw,520px)] -translate-x-1/2 rounded-xl border shadow-xl overflow-hidden ${styles.wrap}`}
            role="status"
            aria-live="polite"
        >
            <div className="px-4 py-3">
                <div className="flex items-start gap-3">
                    {/* Icon */}
                    <span className="mt-0.5 shrink-0">
                        {status === "successful" ? (
                            <CheckCircle2 className="w-5 h-5" />
                        ) : status === "failed" ? (
                            <AlertTriangle className="w-5 h-5" />
                        ) : (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        )}
                    </span>

                    {/* Message */}
                    <div className="flex-1 text-sm font-medium leading-snug">
                        {message}
                        {status === "successful" && (
                            <div className="flex items-center gap-1 mt-1 text-xs font-normal opacity-70">
                                <Heart className="w-3 h-3" />
                                <span>God bless you</span>
                            </div>
                        )}
                    </div>

                    {/* Dismiss */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-current opacity-60 hover:opacity-100 transition-opacity"
                        aria-label="Dismiss"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Progress bar — shrinks as the auto-dismiss timer counts down */}
            {status !== "verifying" && (
                <div className="h-0.5 w-full bg-current/10">
                    <div
                        className={`h-full transition-none ${styles.bar}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    )
}

export default DonationStatusBanner
