// KickMate Service Worker for PWA Offline Caching Fallback
const CACHE_NAME = 'kickmate-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/styles/index.css',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).catch(() => {
      // Caching is optional
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(e.request).catch(() => {
        // Return offline fallback if network fails
        if (e.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

