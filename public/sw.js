/**
 * Service Worker - Sahabat Kaca Aluminium
 * Provides offline caching for essential assets:
 * - logo.png, style.css, script.js, index.html, offline fallbacks
 */

const CACHE_NAME = 'sahabat-aluminium-v1';

// Essential static assets to pre-cache on install
const ESSENTIAL_ASSETS = [
  '/',
  '/style.css',
  '/script.js',
  '/assets/logo.png',
  '/assets/logo.webp',
  '/pricingConfig.js',
  '/projectCatalog.js',
  '/masterData.js',
  '/print.css',
  '/404.html'
];

// Install: Cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[Service Worker] Pre-caching essential assets for offline accessibility...');
      // Use Promise.allSettled to ensure individual cache failures do not abort installation
      await Promise.allSettled(
        ESSENTIAL_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => {
            console.warn(`[Service Worker] Failed to pre-cache asset ${asset}:`, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up old cache versions and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting outdated cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle HTTP/HTTPS GET requests
  if (req.method !== 'GET' || !req.url.startsWith('http')) {
    return;
  }

  const url = new URL(req.url);

  // Skip dynamic API calls and external tracking/ads/analytics scripts
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('google-analytics') ||
    url.hostname.includes('googletagmanager') ||
    url.hostname.includes('pagead2') ||
    url.hostname.includes('doubleclick')
  ) {
    return;
  }

  // 1. Navigation requests (HTML pages): Network-first with offline cache fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          // If offline, try exact cached page, or root '/', or '404.html'
          const cachedPage = await caches.match(req);
          if (cachedPage) return cachedPage;

          const rootPage = await caches.match('/');
          if (rootPage) return rootPage;

          const fallback404 = await caches.match('/404.html');
          if (fallback404) return fallback404;

          return new Response(
            `<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><title>Offline - Sahabat Kaca Aluminium</title><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/style.css"></head><body class="flex items-center justify-center min-h-screen text-center p-6 bg-slate-50"><div class="max-w-md p-8 bg-white rounded-2xl shadow-lg border border-slate-200"><img src="/assets/logo.png" alt="Logo" class="h-16 mx-auto mb-4"><h1 class="text-2xl font-bold text-slate-800 mb-2">Mode Offline</h1><p class="text-slate-600 mb-6">Perangkat Anda sedang tidak terhubung ke internet. Halaman utama dan aset penting tetap tersimpan di memori cache perangkat Anda.</p><a href="/" class="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">Kembali ke Beranda</a></div></body></html>`,
            {
              headers: { 'Content-Type': 'text/html; charset=UTF-8' }
            }
          );
        })
    );
    return;
  }

  // 2. Static Assets (CSS, JS, images, fonts): Cache-first with network fallback and background update
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh version in background to keep cache up to date
        fetch(req)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(req, networkResponse));
            }
          })
          .catch(() => {
            // Network error in background update is expected when offline
          });
        return cachedResponse;
      }

      // If not in cache, fetch from network and cache
      return fetch(req)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          // Clone response and store in cache
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseClone);
          });

          return networkResponse;
        })
        .catch(() => {
          // If offline and request was for an image, fallback to cached logo.png
          if (req.destination === 'image' || req.headers.get('accept')?.includes('image/')) {
            return caches.match('/assets/logo.png');
          }
        });
    })
  );
});
