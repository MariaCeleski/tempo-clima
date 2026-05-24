/**
 * Centralized HTTP client for outbound requests to external APIs.
 * Handles timeout, error mapping, and API key injection.
 */

const OPENWEATHERMAP_BASE = 'https://api.openweathermap.org';
const DEFAULT_TIMEOUT_MS = 15000;

export interface ProxyRequestOptions {
  baseUrl: string;
  path: string;
  params: Record<string, string>;
  timeout?: number;
}

export interface ProxyResponse<T = unknown> {
  status: number;
  data: T;
}

/**
 * Determines if the request is targeting OpenWeatherMap based on the base URL.
 */
function isOpenWeatherMapRequest(baseUrl: string): boolean {
  return baseUrl.startsWith(OPENWEATHERMAP_BASE);
}

/**
 * Maps upstream HTTP errors to appropriate proxy response status codes.
 * - 404 → 404 (pass through)
 * - 401 → 503 (mask auth failures)
 * - 5xx → 502 (bad gateway)
 */
function mapUpstreamStatus(upstreamStatus: number): { status: number; message: string } {
  if (upstreamStatus === 404) {
    return { status: 404, message: 'Not found' };
  }
  if (upstreamStatus === 401) {
    return { status: 503, message: 'Weather service temporarily unavailable' };
  }
  if (upstreamStatus >= 500 && upstreamStatus <= 599) {
    return { status: 502, message: 'External service error' };
  }
  return { status: upstreamStatus, message: 'External service error' };
}

/**
 * Makes an outbound HTTP request to an external API.
 *
 * - Appends the OpenWeatherMap API key for OWM requests
 * - Implements a 15-second timeout via AbortController
 * - Maps upstream errors to safe client-facing status codes
 * - Never exposes API key, upstream URLs, or stack traces
 */
export async function proxyRequest<T = unknown>(
  options: ProxyRequestOptions
): Promise<ProxyResponse<T>> {
  const { baseUrl, path, params, timeout = DEFAULT_TIMEOUT_MS } = options;

  // Build URL with parameters
  const url = new URL(path, baseUrl);
  const searchParams = new URLSearchParams(params);

  // Append API key for OpenWeatherMap requests
  if (isOpenWeatherMapRequest(baseUrl)) {
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    if (apiKey) {
      searchParams.set('appid', apiKey);
    }
  }

  url.search = searchParams.toString();

  // Set up timeout with AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
    });

    if (response.ok) {
      const data = (await response.json()) as T;
      return { status: response.status, data };
    }

    // Map upstream error status codes
    const mapped = mapUpstreamStatus(response.status);
    throw new ProxyError(mapped.message, mapped.status);
  } catch (error: unknown) {
    if (error instanceof ProxyError) {
      throw error;
    }

    // Handle abort/timeout
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ProxyError('External service timeout', 504);
    }

    // Handle network errors (DNS failure, connection refused, etc.)
    throw new ProxyError('External service unavailable', 502);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Custom error class for proxy errors.
 * Contains a safe client-facing message and HTTP status code.
 * Never includes API keys, upstream URLs, or stack traces in the message.
 */
export class ProxyError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ProxyError';
    this.statusCode = statusCode;
  }
}
