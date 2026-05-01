import dotenv from "dotenv"
import path from "path"
import express from "express"
import cors from "cors"
import contentRoutes from "./routes/content.js"
import searchRoutes from "./routes/search.js"
import imagesRoutes from "./routes/images.js"
import adminRoutes from "./routes/admin.js"
import donationRoutes from "./routes/donations.js"
import { initDb } from "./db.js"

// Load env from both `server/.env` and repo-root `.env` (root takes precedence if present).
dotenv.config({ path: path.resolve(process.cwd(), ".env") })
dotenv.config({
    path: path.resolve(process.cwd(), "..", ".env")
})

export const app = express()

app.use(cors())
app.use(
    express.json({
        verify: (req, _res, buf) => {
            ;(req as { rawBody?: Buffer }).rawBody = buf
        }
    })
)

// Routes
app.use("/api", contentRoutes)
app.use("/api", searchRoutes)
app.use("/api", imagesRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/donations", donationRoutes)

// Health check
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString()
    })
})

let initPromise: Promise<boolean> | null = null

export function ensureDbInit() {
    if (!initPromise) {
        initPromise = initDb()
    }
    return initPromise
}
