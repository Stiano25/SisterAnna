import React, { useMemo, useState } from "react"
import { X } from "lucide-react"

export type DonationStatus = {
    status: "verifying" | "successful" | "failed"
    message: string
}

interface DonationModalProps {
    isOpen: boolean
    onClose: () => void
    onStatus?: (status: DonationStatus | null) => void
}

type PaymentMethod = "mpesa" | "card"

type PaystackInitResponse = {
    accessCode?: string
    reference?: string
    publicKey?: string
    currency?: string
}

type PaystackHandler = {
    openIframe: () => void
}

type PaystackSetupOptions = {
    key: string
    email: string
    access_code?: string
    ref?: string
    amount?: number
    currency?: string
    channels?: string[]
    metadata?: Record<string, unknown>
    callback: (response: { reference: string }) => void
    onClose: () => void
}

declare global {
    interface Window {
        PaystackPop?: {
            setup: (options: PaystackSetupOptions) => PaystackHandler
        }
    }
}

const PRESET_AMOUNTS: Record<PaymentMethod, number[]> = {
    mpesa: [500, 1000, 2500, 5000],
    card: [500, 1000, 2500, 5000]
}

const PAYSTACK_SCRIPT_SRC = "https://js.paystack.co/v1/inline.js"
let paystackScriptPromise: Promise<void> | null = null

const loadPaystackScript = () => {
    if (typeof window === "undefined") {
        return Promise.reject(
            new Error("Paystack requires a browser")
        )
    }
    if (window.PaystackPop) return Promise.resolve()
    if (paystackScriptPromise) return paystackScriptPromise

    paystackScriptPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector(
            `script[src="${PAYSTACK_SCRIPT_SRC}"]`
        )
        if (existing) {
            if (window.PaystackPop) {
                resolve()
                return
            }
            existing.addEventListener("load", () => resolve())
            existing.addEventListener("error", () =>
                reject(
                    new Error("Paystack script failed to load")
                )
            )
            return
        }

        const script = document.createElement("script")
        script.src = PAYSTACK_SCRIPT_SRC
        script.async = true
        script.onload = () => resolve()
        script.onerror = () =>
            reject(new Error("Paystack script failed to load"))
        document.head.appendChild(script)
    })

    return paystackScriptPromise
}

const DonationModal: React.FC<DonationModalProps> = ({
    isOpen,
    onClose,
    onStatus
}) => {
    const [amount, setAmount] = useState("")
    const [paymentMethod, setPaymentMethod] =
        useState<PaymentMethod>("mpesa")
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const currency = "KES"
    const presetAmounts = PRESET_AMOUNTS[paymentMethod]

    const amountValue = useMemo(() => {
        const parsed = Number(amount)
        if (!Number.isFinite(parsed) || parsed <= 0)
            return null
        return Math.round(parsed * 100) / 100
    }, [amount])

    const setPreset = (value: number) => {
        setAmount(String(value))
    }

    const verifyDonation = async (reference: string) => {
        try {
            onStatus?.({
                status: "verifying",
                message: "Verifying your donation..."
            })
            const res = await fetch(
                `/api/donations/verify?reference=${encodeURIComponent(reference)}`
            )
            const data = await res
                .json()
                .catch(() => ({}))
            if (!res.ok) {
                throw new Error(
                    data?.error || "Verification failed"
                )
            }
            if (data?.status === "success") {
                onStatus?.({
                    status: "successful",
                    message:
                        "Thank you! Your donation was received successfully."
                })
                onClose()
            } else {
                onStatus?.({
                    status: "failed",
                    message:
                        "We could not confirm your donation. Please try again or contact support."
                })
            }
        } catch (err) {
            onStatus?.({
                status: "failed",
                message:
                    "We could not verify your donation yet. Please try again later."
            })
            setError((err as Error).message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setError(null)

        if (!amountValue) {
            setError("Please enter a valid amount.")
            return
        }
        if (!name.trim() || !email.trim()) {
            setError("Please provide your name and email.")
            return
        }
        if (paymentMethod === "mpesa" && !phone.trim()) {
            setError("Phone number is required for M-Pesa.")
            return
        }

        setIsSubmitting(true)
        try {
            const response = await fetch(
                "/api/donations/init",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        amount: amountValue,
                        paymentMethod,
                        customer: {
                            name: name.trim(),
                            email: email.trim(),
                            phone: phone.trim()
                        }
                    })
                }
            )

            if (!response.ok) {
                const body = await response
                    .json()
                    .catch(() => ({}))
                throw new Error(
                    body?.error ||
                        "Unable to initialize payment"
                )
            }

            const data =
                (await response.json()) as PaystackInitResponse
            if (
                !data?.accessCode ||
                !data?.reference ||
                !data?.publicKey
            ) {
                throw new Error("Missing Paystack access data")
            }

            await loadPaystackScript()
            if (!window.PaystackPop) {
                throw new Error("Paystack failed to load")
            }

            const handler = window.PaystackPop.setup({
                key: data.publicKey,
                email: email.trim(),
                access_code: data.accessCode,
                ref: data.reference,
                amount: Math.round(amountValue * 100),
                currency: data.currency ?? currency,
                channels:
                    paymentMethod === "mpesa"
                        ? ["mobile_money"]
                        : ["card"],
                metadata: {
                    donor_name: name.trim(),
                    donor_email: email.trim(),
                    donor_phone: phone.trim(),
                    payment_method: paymentMethod
                },
                callback: response => {
                    void verifyDonation(
                        response?.reference || data.reference
                    )
                },
                onClose: () => {
                    setIsSubmitting(false)
                }
            })

            handler.openIframe()
        } catch (err) {
            setError((err as Error).message)
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div
                className="w-full max-w-xl rounded-2xl bg-white border border-memorial-line shadow-xl overflow-hidden"
                role="dialog"
                aria-modal="true"
                aria-label="Donate"
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-memorial-line bg-memorial-card/80">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-memorial-muted">
                            Donate
                        </p>
                        <h2 className="font-sans text-lg text-memorial-ink font-semibold">
                            Support Sister Anna Ali Mission
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-full border border-memorial-line text-memorial-muted hover:text-memorial-ink"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="p-5 space-y-5"
                >
                    <div>
                        <label className="block text-sm font-semibold text-memorial-ink mb-2">
                            Amount ({currency})
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                            {presetAmounts.map(value => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() =>
                                        setPreset(value)
                                    }
                                    className="px-3 py-2 rounded-lg text-sm font-semibold border border-memorial-line bg-memorial-card/70 hover:border-memorial-accent/60"
                                >
                                    {value.toLocaleString()}
                                </button>
                            ))}
                        </div>
                        <input
                            type="number"
                            min={1}
                            step={
                                paymentMethod === "mpesa"
                                    ? 1
                                    : 0.01
                            }
                            value={amount}
                            onChange={e =>
                                setAmount(e.target.value)
                            }
                            className="w-full rounded-lg border border-memorial-line bg-white px-3 py-2 text-sm text-memorial-ink focus:outline-none focus:ring-2 focus:ring-memorial-accent"
                            placeholder="Enter amount"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-memorial-ink mb-2">
                            Payment method
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(
                                [
                                    {
                                        id: "mpesa",
                                        label: "M-Pesa"
                                    },
                                    {
                                        id: "card",
                                        label: "Card (Visa/Mastercard)"
                                    }
                                ] as const
                            ).map(method => {
                                const active =
                                    paymentMethod ===
                                    method.id
                                return (
                                    <button
                                        key={method.id}
                                        type="button"
                                        onClick={() => {
                                            setPaymentMethod(
                                                method.id
                                            )
                                            setAmount("")
                                            if (
                                                method.id !==
                                                "mpesa"
                                            ) {
                                                setPhone("")
                                            }
                                        }}
                                        className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors text-left ${
                                            active
                                                ? "bg-indigo-600 text-white border-indigo-600"
                                                : "bg-white text-memorial-muted border-memorial-line hover:border-indigo-300"
                                        }`}
                                    >
                                        {method.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-memorial-ink mb-2">
                                Full name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={e =>
                                    setName(e.target.value)
                                }
                                className="w-full rounded-lg border border-memorial-line bg-white px-3 py-2 text-sm text-memorial-ink focus:outline-none focus:ring-2 focus:ring-memorial-accent"
                                placeholder="Your name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-memorial-ink mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e =>
                                    setEmail(e.target.value)
                                }
                                className="w-full rounded-lg border border-memorial-line bg-white px-3 py-2 text-sm text-memorial-ink focus:outline-none focus:ring-2 focus:ring-memorial-accent"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    {paymentMethod === "mpesa" ? (
                        <div>
                            <label className="block text-sm font-semibold text-memorial-ink mb-2">
                                Phone (required for M-Pesa)
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={e =>
                                    setPhone(e.target.value)
                                }
                                className="w-full rounded-lg border border-memorial-line bg-white px-3 py-2 text-sm text-memorial-ink focus:outline-none focus:ring-2 focus:ring-memorial-accent"
                                placeholder="e.g. 254712345678"
                                required
                            />
                        </div>
                    ) : null}

                    {error ? (
                        <p className="text-sm text-red-600">
                            {error}
                        </p>
                    ) : null}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-memorial-accent text-white font-semibold shadow-lg hover:shadow-xl disabled:opacity-60"
                        >
                            {isSubmitting
                                ? "Starting payment..."
                                : "Continue to payment"}
                        </button>
                        <p className="text-xs text-memorial-muted">
                            Payments secured by Paystack.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default DonationModal
