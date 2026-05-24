// ============================================================
// Service Worker v2 — Temperatura Local
// Stale-while-revalidate for API, cache-first for static,
// TTL per resource type, cache size limits, offline indicator.
// ============================================================

const CACHE_VERSION = 'temperatura-local-v2';
const API_CACHE = 'temperatura-api-v2';
const TILES_CACHE = 'temperatura-tiles-v2';

const BASE_PATH = '/tempo-clima/';

const STATIC_ASSETS = [
  BASE_PATH,
  BASE_PATH + 'index.html',
  BASE_PATH + 'favicon.svg',
  BASE_PATH + 'manifest.json',
];

// TTL configuration (in milliseconds)
const TTL = {
  api: 10 * 60 * 1000,       // 10 minutes
  tiles: 24 * 60 * 60 * 1000, // 24 hours
};

// Cache size limits
const MAX_ENTRIES = {
  api: 50,
  tiles: 200,
};

// ============================================================
// Helpers
// ============================================================

/**
 * Wraps a Response with a timestamp header for TTL tracking.
 */
function addTimestamp(response) {
  const headers = new Headers(response.headers);
  headers.set('X-SW-Cached-At', Date.now().toString());
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Checks if a cached response has expired based on its TTL.
 */
function isExpired(response, ttl) {
  const cachedAt = response.headers.get('X-SW-Cached-At');
  if (!cachedAt) return true;
  return (Date.now() - parseInt(cachedAt, 10)) > ttl;
}

/**
 * Adds the X-From-Cache header to indicate offline/cached response.
 */
function markAsFromCache(response) {
  const headers = new Headers(response.headers);
  headers.set('X-From-Cache', 'true');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Trims a cache to the specified max number of entries (FIFO — oldest first).
 */
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    const toDelete = keys.slice(0, keys.length - maxEntries);
    await Promise.all(toDelete.map((key) => cache.delete(key)));
  }
}

// ============================================================
// Install
// ============================================================

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ============================================================
// Activate — clean up ALL old caches (any name not in our set)
// ============================================================

self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_VERSION, API_CACHE, TILES_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !currentCaches.includes(key))
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ============================================================
// Fetch strategies
// ============================================================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // --- Weather API: stale-while-revalidate with TTL ---
  if (url.hostname.includes('openweathermap.org') || url.hostname.includes('viacep.com.br')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // --- Map tiles: cache-first with TTL ---
  if (url.hostname.includes('cartodb-basemaps') && url.hostname.includes('fastly.net')) {
    event.respondWith(handleTileRequest(request));
    return;
  }

  // --- Static assets: cache-first (no TTL, versioned by hash) ---
  event.respondWith(handleStaticRequest(request));
});

/**
 * Stale-while-revalidate for API requests.
 * Serves cached data immediately (if available and within TTL),
 * then fetches fresh data in the background to update the cache.
 * If cache is stale or missing, waits for network.
 */
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);
  const cached = await cache.match(request);

  // If we have a fresh cached response, serve it and revalidate in background
  if (cached && !isExpired(cached, TTL.api)) {
    // Background revalidation (fire-and-forget)
    revalidateApi(request, cache);
    return markAsFromCache(cached);
  }

  // If cached but expired, or no cache — try network first
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const timestamped = addTimestamp(networkResponse.clone());
      await cache.put(request, timestamped);
      trimCache(API_CACHE, MAX_ENTRIES.api);
    }
    return networkResponse;
  } catch (err) {
    // Network failed — serve stale cache if available
    if (cached) {
      return markAsFromCache(cached);
    }
    // No cache at all — register for background sync and return offline error
    await registerSync('sync-weather');
    return new Response(
      JSON.stringify({ error: 'Offline — sem dados em cache disponíveis.' }),
      { status: 503, headers: { 'Content-Type': 'application/json', 'X-From-Cache': 'true' } }
    );
  }
}

/**
 * Background revalidation for stale-while-revalidate pattern.
 */
async function revalidateApi(request, cache) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const timestamped = addTimestamp(networkResponse.clone());
      await cache.put(request, timestamped);
      trimCache(API_CACHE, MAX_ENTRIES.api);
    }
  } catch {
    // Silently fail — we already served the cached version
  }
}

/**
 * Cache-first with TTL for map tiles.
 */
async function handleTileRequest(request) {
  const cache = await caches.open(TILES_CACHE);
  const cached = await cache.match(request);

  if (cached && !isExpired(cached, TTL.tiles)) {
    return markAsFromCache(cached);
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const timestamped = addTimestamp(networkResponse.clone());
      await cache.put(request, timestamped);
      trimCache(TILES_CACHE, MAX_ENTRIES.tiles);
    }
    return networkResponse;
  } catch {
    // Network failed — serve stale tile if available
    if (cached) {
      return markAsFromCache(cached);
    }
    return new Response('', { status: 408, statusText: 'Tile unavailable offline' });
  }
}

/**
 * Cache-first for static assets (no TTL — they're versioned by filename hash).
 */
async function handleStaticRequest(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const networkResponse = await fetch(request);
    // Cache successful responses for static assets
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    // If it's a navigation request, serve the cached index.html (SPA fallback)
    if (request.mode === 'navigate') {
      const fallback = await caches.match(BASE_PATH + 'index.html');
      if (fallback) return markAsFromCache(fallback);
    }
    return new Response('Offline', { status: 503 });
  }
}

// ============================================================
// Background Sync (placeholder)
// ============================================================

/**
 * Registers a sync event for retrying failed requests.
 * Requires server-side support for full implementation.
 */
async function registerSync(tag) {
  try {
    const registration = await self.registration;
    if ('sync' in registration) {
      await registration.sync.register(tag);
    }
  } catch {
    // Background Sync not supported — silently ignore
  }
}

/**
 * Sync event handler — placeholder for retrying failed weather requests.
 * Full implementation requires a server-side queue endpoint.
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-weather') {
    event.waitUntil(handleWeatherSync());
  }
});

async function handleWeatherSync() {
  // Placeholder: In a full implementation, this would:
  // 1. Read queued requests from IndexedDB
  // 2. Retry them against the network
  // 3. Notify the client of updated data via postMessage
  try {
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({ type: 'SYNC_COMPLETE', tag: 'sync-weather' });
    });
  } catch {
    // Sync failed — will retry automatically
  }
}
