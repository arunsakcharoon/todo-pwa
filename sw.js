const CACHE_NAME = 'todo-pwa-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/app.js',
  '/style.css',
  '/manifest.json'
];

// Install event - cache files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Return cached version if available
      if (response) {
        return response;
      }

      // Otherwise fetch from network
      return fetch(event.request).then(response => {
        // Don't cache if not a successful response
        if (!response || response.status !== 200) {
          return response;
        }

        // Clone the response
        const responseClone = response.clone();

        // Cache the new response for next time
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });

        return response;
      }).catch(() => {
        // Return cached version if available, otherwise offline message
        return caches.match(event.request).then(response => {
          return response || new Response('Offline - page not cached', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      });
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
