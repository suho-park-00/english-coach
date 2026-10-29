const CACHE_NAME = 'english-coach-pwa-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE)).catch(() => {})
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

// Network-First for HTML navigation to ensure instantaneous updates
self.addEventListener('fetch', event => {
  const isNav = event.request.mode === 'navigate' || 
                event.request.url.includes('index.html') || 
                event.request.url.endsWith('/english-coach/') ||
                event.request.url.endsWith('/english-coach');

  if (isNav) {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match('./index.html') || caches.match('./'))
    );
    return;
  }

  // Cache-First for static assets (icons, manifest)
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request);
    }).catch(() => fetch(event.request))
  );
});
