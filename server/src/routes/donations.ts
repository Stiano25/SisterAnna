import dotenv from "dotenv"
import path from "path"
import express from "express"
import { randomUUID } from "crypto"
import { pool, dbEnabled } from "../db.js"

const router = express.Router()

// Ensure env vars are loaded even if this module initializes before app.ts config.
dotenv.config({ path: path.resolve(process.cwd(), ".env") })
dotenv.config({
    path: path.resolve(process.cwd(), "..", ".env")
})

const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY
const FLW_WEBHOOK_SECRET = process.env.FLW_WEBHOOK_SECRET
const PUBLIC_SITE_URL = process.env.PUBLIC_SITE_URL
// Optional: override the Flutterwave redirect URL independently of PUBLIC_SITE_URL.
// Useful locally when ngrok exposes the server but the frontend runs on localhost.
// Example: FLW_REDIRECT_URL="https://xxxx.ngrok-free.app"
const FLW_REDIRECT_URL =
    process.env.FLW_REDIRECT_URL || PUBLIC_SITE_URL

const SUPPORTED_METHODS = new Set(["mpesa", "card"])

type DonationInitPayload = {
    amount: number
    currency: string
    paymentMethod: string
    customer: {
        name: string
        email: string
        phone: string
    }
}

type FlutterwaveVerifyResponse = {
    status: string
    message?: string
    data?: {
        id: number
        tx_ref: string
        amount: number
        currency: string
        status: string
        payment_type?: string
        created_at?: string
        customer?: {
            name?: string
            email?: string
            phone_number?: string
            phone?: string
        }
    }
}

function requireEnv(res: express.Response): boolean {
    if (!FLW_SECRET_KEY) {
        res.status(500).json({
            error: "FLW_SECRET_KEY is missing on the server"
        })
        return false
    }
    if (!PUBLIC_SITE_URL) {
        res.status(500).json({
            error: "PUBLIC_SITE_URL is missing on the server"
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

async function flutterwaveRequest<T>(
    path: string,
    body?: unknown,
    method = "POST"
): Promise<T> {
    if (!FLW_SECRET_KEY) {
        throw new Error("Flutterwave secret key missing")
    }
    const res = await fetch(
        `https://api.flutterwave.com/v3/${path}`,
        {
            method,
            headers: {
                Authorization: `Bearer ${FLW_SECRET_KEY}`,
                "Content-Type": "application/json"
            },
            body: body ? JSON.stringify(body) : undefined
        }
    )

    const json = (await res
        .json()
        .catch(() => ({}))) as T & {
        status?: string
        message?: string
    }
    if (!res.ok) {
        const msg =
            (json as { message?: string })?.message ||
            `Flutterwave request failed (${res.status})`
        throw new Error(msg)
    }
    return json as T
}

async function saveDonationIfSuccessful(
    payload: FlutterwaveVerifyResponse["data"]
) {
    if (!payload || payload.status !== "successful") return
    if (!dbEnabled || !pool) return

    const customerName = payload.customer?.name ?? null
    const customerEmail = payload.customer?.email ?? null
    const customerPhone =
        payload.customer?.phone_number ??
        payload.customer?.phone ??
        null
    const paymentType = payload.payment_type ?? null

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
            payload.tx_ref,
            payload.id,
            payload.amount,
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
    if (!requireEnv(res)) return

    const { amount, currency, paymentMethod, customer } =
        req.body as DonationInitPayload
    const normalizedAmount = parseAmount(amount)
    const selectedMethod = String(
        paymentMethod || ""
    ).toLowerCase()
    const normalizedCurrency = String(
        currency || ""
    ).toUpperCase()

    if (!normalizedAmount) {
        res.status(400).json({
            error: "Valid amount is required"
        })
        return
    }
    if (!normalizedCurrency) {
        res.status(400).json({
            error: "Currency is required"
        })
        return
    }
    if (!SUPPORTED_METHODS.has(selectedMethod)) {
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

    const txRef = `don_${randomUUID()}`
    const paymentOptions =
        selectedMethod === "mpesa" ? "mpesa" : "card"

    try {
        const response = await flutterwaveRequest<{
            status: string
            data?: { link?: string }
        }>("payments", {
            tx_ref: txRef,
            amount: normalizedAmount,
            currency: normalizedCurrency,
            redirect_url: `${FLW_REDIRECT_URL}/?payment=flutterwave`,
            payment_options: paymentOptions,
            customer: {
                email: customer.email.trim(),
                name: customer.name.trim(),
                phonenumber: customer.phone.trim()
            },
            meta: {
                donor_name: customer.name.trim(),
                donor_phone: customer.phone.trim()
            },
            customizations: {
                title: "Sister Anna Ali Memorial Fund",
                description:
                    "Donation support for memorial and mission work."
            }
        })

        const link = response?.data?.link
        if (!link) {
            res.status(502).json({
                error: "Flutterwave did not return a payment link"
            })
            return
        }

        res.json({ paymentLink: link, txRef })
    } catch (err) {
        console.error(err)
        res.status(502).json({
            error: "Unable to initialize payment"
        })
    }
})

router.get("/verify", async (req, res) => {
    if (!FLW_SECRET_KEY) {
        res.status(500).json({
            error: "FLW_SECRET_KEY is missing on the server"
        })
        return
    }

    const transactionId = String(
        req.query.transactionId || ""
    ).trim()
    if (!transactionId) {
        res.status(400).json({
            error: "transactionId is required"
        })
        return
    }

    try {
        const verify =
            await flutterwaveRequest<FlutterwaveVerifyResponse>(
                `transactions/${transactionId}/verify`,
                undefined,
                "GET"
            )
        await saveDonationIfSuccessful(verify.data)

        res.json({
            ok: true,
            status: verify.data?.status ?? "unknown",
            amount: verify.data?.amount ?? null,
            currency: verify.data?.currency ?? null
        })
    } catch (err) {
        console.error(err)
        res.status(502).json({
            error: "Unable to verify transaction"
        })
    }
})

router.post("/flutterwave/webhook", async (req, res) => {
    if (!FLW_WEBHOOK_SECRET) {
        res.status(500).json({
            error: "FLW_WEBHOOK_SECRET is missing on the server"
        })
        return
    }
    const signature = String(
        req.headers["verif-hash"] || ""
    )
    if (!signature || signature !== FLW_WEBHOOK_SECRET) {
        res.status(401).json({
            error: "Invalid webhook signature"
        })
        return
    }

    const payload = req.body as { data?: { id?: number } }
    const transactionId = payload?.data?.id
    if (!transactionId) {
        res.status(400).json({
            error: "Missing transaction id"
        })
        return
    }

    try {
        const verify =
            await flutterwaveRequest<FlutterwaveVerifyResponse>(
                `transactions/${transactionId}/verify`,
                undefined,
                "GET"
            )
        await saveDonationIfSuccessful(verify.data)
        res.json({ ok: true })
    } catch (err) {
        console.error(err)
        res.status(502).json({
            error: "Webhook verification failed"
        })
    }
})

export default router
