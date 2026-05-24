import rateLimit from 'express-rate-limit';

const DEFAULT_MAX = 100;
const DEFAULT_WINDOW_MS = 900000; // 15 minutes

const MIN_MAX = 1;
const MAX_MAX = 10000;
const MIN_WINDOW_MS = 1000;
const MAX_WINDOW_MS = 86400000; // 24 hours

/**
 * Parses and validates a rate limit configuration value.
 * Returns the default if the value is invalid, non-numeric, zero, negative, or out of range.
 */
function parseRateLimitValue(
  envValue: string | undefined,
  defaultValue: number,
  min: number,
  max: number,
  name: string
): number {
  if (envValue === undefined || envValue.trim() === '') {
    return defaultValue;
  }

  const parsed = Number(envValue);

  if (isNaN(parsed) || !isFinite(parsed) || parsed < min || parsed > max || parsed === 0) {
    console.warn(
      `Warning: Invalid value "${envValue}" for ${name}. Must be a number between ${min} and ${max}. Using default: ${defaultValue}`
    );
    return defaultValue;
  }

  return Math.floor(parsed);
}

/**
 * Creates a configured rate limiter middleware based on environment variables.
 * Falls back to defaults for invalid configuration values.
 */
export function createRateLimiter() {
  const max = parseRateLimitValue(
    process.env.RATE_LIMIT_MAX,
    DEFAULT_MAX,
    MIN_MAX,
    MAX_MAX,
    'RATE_LIMIT_MAX'
  );

  const windowMs = parseRateLimitValue(
    process.env.RATE_LIMIT_WINDOW_MS,
    DEFAULT_WINDOW_MS,
    MIN_WINDOW_MS,
    MAX_WINDOW_MS,
    'RATE_LIMIT_WINDOW_MS'
  );

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: true, // Include `X-RateLimit-*` headers
    message: { message: 'Too many requests, please try again later.' },
    handler: (req, res) => {
      const resetTime = (req as any).rateLimit?.resetTime;
      if (resetTime) {
        const retryAfterSeconds = Math.ceil((resetTime.getTime() - Date.now()) / 1000);
        res.set('Retry-After', String(Math.max(retryAfterSeconds, 1)));
      }
      res.status(429).json({ message: 'Too many requests, please try again later.' });
    },
  });
}
