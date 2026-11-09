const CACHE_NAME = 'calc3d-v106';
/* IMPORTANTE: esta lista debe coincidir con los <script> y <link> de index.html,
   con el mismo nombre: `js/auth.js?v=105` no es `js/auth.js` para la caché.
   La versión ya la da CACHE_NAME. Si agregas un archivo y olvidas ponerlo aquí,
   la app se rompe sin conexión.
   Verificación rápida:
     grep -oE 'src="js/[^"]+"' index.html   →   compara con las rutas de abajo */
const ASSETS = [
  './index.html',
  './quote.html',
  './manifest.json',
  './css/tokens.css',
  './css/base.css',
  './css/components.css',
  './css/quote.css',
  './css/desktop.css',
  './css/onboarding.css',
  './js/store.js',
  './js/costing.js',
  './js/auth.js',
  './js/db.js',
  './js/onboarding.js',
  './js/theme.js',
  './js/ui.js',
  './js/native.js',
  './js/templates.js',
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
  './assets/icon.svg',
  /* Firebase viene de otro servidor; sin esto la app no abre sin conexión.
     gstatic responde con Access-Control-Allow-Origin: *, así que se puede guardar. */
  'https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js'
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
