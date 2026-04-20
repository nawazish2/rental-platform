const rateLimit = require('express-rate-limit');

const max = parseInt(process.env.AUTH_RATE_LIMIT_MAX || '40', 10);

/** Shared limiter for login + register (same IP counts toward one window). */
module.exports = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number.isFinite(max) && max > 0 ? max : 40,
  message: { message: 'Too many attempts. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
