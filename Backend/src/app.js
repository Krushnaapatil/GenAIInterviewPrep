const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

const allowedOrigins = [
    "https://hireready-daddy-with-ai.vercel.app",
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]
    .filter(Boolean)

const corsOptions = {
    origin(origin, callback) {
        if (!origin) {
            return callback(null, true)
        }

        if (
            allowedOrigins.includes(origin) ||
            origin.startsWith("http://localhost:") ||
            origin.startsWith("http://127.0.0.1:") ||
            origin === "https://hireready-daddy-with-ai.vercel.app"
        ) {
            return callback(null, true)
        }

        return callback(new Error(`CORS blocked for origin: ${origin}`))
    },
    credentials: true,
}

app.use(express.json())
app.use(cookieParser())
app.use(cors(corsOptions))

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")


/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)



module.exports = app
