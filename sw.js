const CACHE_NAME = '478breathing-v1';
const urlsToCache = [
  './',
  'index.html',
  'styles.css',
  'script.js',
  'icons/android-chrome-192x192.png',
  'icons/android-chrome-512x512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});