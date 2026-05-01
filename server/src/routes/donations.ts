import express from "express"
import { createHmac, randomUUID } from "crypto"
import { pool, dbEnabled } from "../db.js"

const router = express.Router()

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY
const PAYSTACK_API_BASE = "https://api.paystack.co"

type PaymentMethod = "mpesa" | "card"

const SUPPORTED_METHODS = new Set<PaymentMethod>([
    "mpesa",
    "card"
])
const METHOD_CURRENCY: Record<PaymentMethod, "KES"> = {
    mpesa: "KES",
    card: "KES"
}
const METHOD_CHANNELS: Record<PaymentMethod, string[]> = {
    mpesa: ["mobile_money"],
    card: ["card"]
}

type DonationInitPayload = {
    amount: number
    paymentMethod: string
    customer: {
        name: string
        email: string
        phone: string
    }
}

type PaystackInitResponse = {
    status: boolean
    message?: string
    data?: {
        authorization_url?: string
        access_code?: string
        reference?: string
    }
}

type PaystackVerifyResponse = {
    status: boolean
    message?: string
    data?: {
        id: number
        reference: string
        amount: number
        currency: string
        status: string
        channel?: string
        paid_at?: string
        customer?: {
            email?: string
            phone?: string
            first_name?: string
            last_name?: string
        }
        metadata?: {
            donor_name?: string
            donor_phone?: string
            donor_email?: string
            payment_method?: string
        }
    }
}

function requireSecretKey(res: express.Response): boolean {
    if (!PAYSTACK_SECRET_KEY) {
        res.status(500).json({
            error: "PAYSTACK_SECRET_KEY is missing on the server"
        })
        return false
    }
    return true
}

function requirePublicKey(res: express.Response): boolean {
    if (!PAYSTACK_PUBLIC_KEY) {
        res.status(500).json({
            error: "PAYSTACK_PUBLIC_KEY is missing on the server"
        })
        return false
    }
    return true
}

function parseAmount(input: unknown): number | null {
    const num =
        typeof input === "number"
            ? input
            : Number(String(input))
    if (!Number.isFinite(num)) return null
    if (num <= 0) return null
    return Math.round(num * 100) / 100
}

function normalizeMethod(
    value: unknown
): PaymentMethod | null {
    const normalized = String(value || "")
        .trim()
        .toLowerCase()
    if (
        !SUPPORTED_METHODS.has(normalized as PaymentMethod)
    ) {
        return null
    }
    return normalized as PaymentMethod
}

async function paystackRequest<T>(
    path: string,
    body?: unknown,
    method = "POST"
): Promise<T> {
    if (!PAYSTACK_SECRET_KEY) {
        throw new Error("Paystack secret key missing")
    }
    const res = await fetch(
        `${PAYSTACK_API_BASE}/${path}`,
        {
            method,
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json"
            },
            body: body ? JSON.stringify(body) : undefined
        }
    )

    const json = (await res
        .json()
        .catch(() => ({}))) as T & {
        status?: boolean
        message?: string
    }
    if (!res.ok || json.status === false) {
        const msg =
            (json as { message?: string })?.message ||
            `Paystack request failed (${res.status})`
        throw new Error(msg)
    }
    return json as T
}

async function saveDonationIfSuccessful(
    payload: PaystackVerifyResponse["data"]
) {
    if (!payload || payload.status !== "success") return
    if (!dbEnabled || !pool) return

    const metadata = payload.metadata || {}
    const customerName =
        metadata.donor_name ||
        [
            payload.customer?.first_name,
            payload.customer?.last_name
        ]
            .filter(Boolean)
            .join(" ") ||
        null
    const customerEmail =
        metadata.donor_email ||
        payload.customer?.email ||
        null
    const customerPhone =
        metadata.donor_phone ||
        payload.customer?.phone ||
        null
    const paymentType =
        metadata.payment_method || payload.channel || null
    const amount = payload.amount / 100

    await pool.query(
        `
    INSERT INTO donations (
      id,
      tx_ref,
      transaction_id,
      amount,
      currency,
      status,
      payment_method,
      customer_name,
      customer_email,
      customer_phone,
      raw_payload
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb)
    ON CONFLICT (transaction_id) DO NOTHING
    `,
        [
            randomUUID(),
            payload.reference,
            payload.id,
            amount,
            payload.currency,
            payload.status,
            paymentType,
            customerName,
            customerEmail,
            customerPhone,
            JSON.stringify(payload)
        ]
    )
}

router.post("/init", async (req, res) => {
    if (!requireSecretKey(res)) return
    if (!requirePublicKey(res)) return

    const { amount, paymentMethod, customer } =
        req.body as DonationInitPayload
    const normalizedAmount = parseAmount(amount)
    const selectedMethod = normalizeMethod(paymentMethod)

    if (!normalizedAmount) {
        res.status(400).json({
            error: "Valid amount is required"
        })
        return
    }
    if (!selectedMethod) {
        res.status(400).json({
            error: "Payment method must be mpesa or card"
        })
        return
    }
    if (
        !customer?.name?.trim() ||
        !customer?.email?.trim()
    ) {
        res.status(400).json({
            error: "Name and email are required"
        })
        return
    }
    if (
        selectedMethod === "mpesa" &&
        !customer?.phone?.trim()
    ) {
        res.status(400).json({
            error: "Phone is required for M-Pesa"
        })
        return
    }

    const currency = METHOD_CURRENCY[selectedMethod]
    const reference = `don_${randomUUID()}`
    const amountMinor = Math.round(normalizedAmount * 100)

    try {
        const response =
            await paystackRequest<PaystackInitResponse>(
                "transaction/initialize",
                {
                    email: customer.email.trim(),
                    amount: amountMinor,
                    currency,
                    reference,
                    channels:
                        METHOD_CHANNELS[selectedMethod],
                    metadata: {
                        donor_name: customer.name.trim(),
                        donor_email: customer.email.trim(),
                        donor_phone: customer.phone.trim(),
                        payment_method: selectedMethod
                    }
                }
            )

        const accessCode = response?.data?.access_code
        const referenceOut = response?.data?.reference
        if (!accessCode || !referenceOut) {
            res.status(502).json({
                error: "Paystack did not return an access code"
            })
            return
        }

        res.json({
            accessCode,
            reference: referenceOut,
            publicKey: PAYSTACK_PUBLIC_KEY,
            currency
        })
    } catch (err) {
        console.error(err)
        res.status(502).json({
            error: "Unable to initialize payment"
        })
    }
})

router.get("/verify", async (req, res) => {
    if (!requireSecretKey(res)) return

    const reference = String(
        req.query.reference || ""
    ).trim()
    if (!reference) {
        res.status(400).json({
            error: "reference is required"
        })
        return
    }

    try {
        const verify =
            await paystackRequest<PaystackVerifyResponse>(
                `transaction/verify/${encodeURIComponent(reference)}`,
                undefined,
                "GET"
            )
        await saveDonationIfSuccessful(verify.data)

        res.json({
            ok: true,
            status: verify.data?.status ?? "unknown",
            amount: verify.data?.amount
                ? verify.data.amount / 100
                : null,
            currency: verify.data?.currency ?? null
        })
    } catch (err) {
        console.error(err)
        res.status(502).json({
            error: "Unable to verify transaction"
        })
    }
})

router.post("/paystack/webhook", async (req, res) => {
    if (!requireSecretKey(res)) return

    const signature = req.headers["x-paystack-signature"]
    const signatureValue =
        typeof signature === "string" ? signature : ""
    if (!signatureValue) {
        res.status(401).json({
            error: "Missing webhook signature"
        })
        return
    }

    const rawBody = (req as { rawBody?: Buffer }).rawBody
    if (!rawBody) {
        res.status(400).json({
            error: "Missing raw webhook body"
        })
        return
    }
    const hash = createHmac(
        "sha512",
        PAYSTACK_SECRET_KEY as string
    )
        .update(rawBody)
        .digest("hex")

    if (hash !== signatureValue) {
        res.status(401).json({
            error: "Invalid webhook signature"
        })
        return
    }

    const payload = req.body as {
        event?: string
        data?: PaystackVerifyResponse["data"]
    }

    if (payload.event === "charge.success") {
        await saveDonationIfSuccessful(payload.data)
    }

    res.json({ ok: true })
})

export default router
