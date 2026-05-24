const CACHE_NAME = 'calc3d-v64';
const ASSETS = [
  './index.html',
  './manifest.json',
  './css/tokens.css',
  './css/base.css',
  './css/components.css',
  './css/quote.css',
  './js/store.js',
  './js/theme.js',
  './js/ui.js',
  './js/calculator.js',
  './js/history.js',
  './js/printers.js',
  './js/materials.js',
  './js/catalog.js',
  './js/quotes.js',
  './js/quote-editor.js',
  './js/clients.js',
  './js/inventory.js',
  './js/config.js',
  './js/dashboard.js',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
