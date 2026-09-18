import rateLimit from 'express-rate-limit';

// Chat rate limiter: 40 requests per minute per IP
export const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many messages sent. Please wait a moment before trying again.'
  }
});

// General API rate limiter: 120 requests per minute
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'API rate limit exceeded. Please slow down.'
  }
});
