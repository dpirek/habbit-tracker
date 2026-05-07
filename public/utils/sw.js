const CACHE_NAME = 'lighthouse-island-v30';
const APP_SHELL = [
  '/',
  '/index.html',
  '/main.js',
  '/components/base-component.js',
  '/components/pages/map.js',
  '/components/pages/stage.js',
  '/components/shared/icon.js',
  '/components/islands/lighthouse/house.js',
  '/components/islands/lighthouse/pier.js',
  '/components/islands/lighthouse/leaderboard.js',
  '/components/islands/lighthouse/library.js',
  '/components/islands/lighthouse/messages.js',
  '/components/islands/lighthouse/achievements.js',
  '/components/shared/lighthouse-state-controls.js',
  '/components/islands/lighthouse/lighthouse.js',
  '/components/islands/lighthouse-island.js',
  '/components/islands/lighthouse-island2.js',
  '/components/shared/coin-count.js',
  '/components/shared/user-avatar.js',
  '/components/shared/progress-bar.js',
  '/components/shared/bottom-menu.js',
  '/components/shared/app-loader.js',
  '/images/png/map.png',
  '/fonts/cloudy-morning.woff2',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return networkResponse;
        })
        .catch(() => caches.match('/index.html'));
    })
  );
});
