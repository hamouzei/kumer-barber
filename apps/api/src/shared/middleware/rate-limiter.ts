import rateLimit from "express-rate-limit";

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "RateLimitError",
    message: "Too many requests, please try again later.",
  },
});

export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "RateLimitError",
    message: "Too many authentication attempts, please try again later.",
  },
});

export const bookingLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "RateLimitError",
    message: "Too many booking attempts, please try again later.",
  },
});
