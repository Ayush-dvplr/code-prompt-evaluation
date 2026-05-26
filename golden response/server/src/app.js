// app.js — Express app setup. No app.listen() here — that lives in server.js.
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const corsConfig = require('./config/corsConfig')
const routes = require('./routes/routeConfig')
const errorMiddleware = require('./middlewares/errorMiddleware')

const app = express()

// 1. Security headers — must be first
app.use(helmet())

// 2. Block NoSQL injection attacks
app.use(mongoSanitize())

// 3. CORS — only the origin in CORS_ORIGIN is allowed
app.use(cors(corsConfig))

// 4. Body parser — 10kb limit prevents large payload attacks
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// 5. Rate limiting — 100 requests per 15 minutes per IP, no Redis needed
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
})
app.use(limiter)

// Compress responses over 1kb
app.use(compression())

// 6. All API routes mounted under /api/v1
app.use('/api/v1', routes)

// 7. Global error handler — must be registered last
app.use(errorMiddleware)

module.exports = app
