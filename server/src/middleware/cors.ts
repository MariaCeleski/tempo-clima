import cors from 'cors';

/**
 * Creates a configured CORS middleware based on the CORS_ORIGIN environment variable.
 * Supports comma-separated origins or wildcard (*).
 * Handles preflight OPTIONS requests automatically via the cors package.
 */
export function createCorsMiddleware() {
  const corsOrigin = process.env.CORS_ORIGIN || '*';

  if (corsOrigin === '*') {
    return cors({ origin: '*' });
  }

  const origins = corsOrigin
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  return cors({
    origin: (requestOrigin, callback) => {
      // Allow requests with no origin (e.g., server-to-server, curl)
      if (!requestOrigin) {
        callback(null, true);
        return;
      }

      if (origins.includes(requestOrigin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  });
}
