// App.js — Express app setup. No app.listen() here — that lives in Server.js.
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const corsConfig = require('./src/config/cors.config');
const routes = require('./src/routes/routeConfig');
const errorMiddleware = require('./src/middlewares/error.middleware');

const app = express();

// Security headers
app.use(helmet());

// CORS — only the specified frontend origin is allowed
app.use(cors(corsConfig));

// Compress all responses larger than 1kb
app.use(compression());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting — 100 requests per 15 minutes per IP, no Redis needed
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use(limiter);

// All API routes mounted under /api/v2
app.use('/api/v2', routes);

// Global error handler — must be registered last
app.use(errorMiddleware);

module.exports = app;
