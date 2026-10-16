/* Bump this version whenever a precached file changes. */
const CACHE_NAME = 'prehistoric-giants-v6-narration-20261016';
const CACHE_PREFIX = 'prehistoric-giants-';
const PRECACHE = [
  './', './index.html', './css/style.css',
  './js/app.js', './js/navigation.js', './js/render.js', './js/narration.js', './js/events.js', './js/pwa.js',
  './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png',
  './icons/maskable-512.png', './icons/apple-touch-icon.png',
  './images/animals/palaeoloxodon.webp',
  './images/animals/paraceratherium.webp',
  './images/animals/megatherium.webp',
  './images/animals/titanoboa.webp',
  './images/animals/megalodon.webp',
  './images/animals/livyatan.webp',
  './images/animals/perucetus.webp',
  './images/animals/argentavis.webp',
  './images/animals/pelagornis.webp',
  './data/habitats.json', './data/animals/index.json',
  './data/animals/palaeoloxodon.json', './data/animals/paraceratherium.json',
  './data/animals/megatherium.json', './data/animals/titanoboa.json',
  './data/animals/megalodon.json', './data/animals/livyatan.json',
  './data/animals/perucetus.json', './data/animals/argentavis.json', './data/animals/pelagornis.json'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE)));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  // Each active worker serves its own complete snapshot. A waiting update
  // cannot mix new JSON or scripts into a page still using the old snapshot.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, {ignoreSearch:true});
    if (cached) return cached;
    if (request.mode === 'navigate') {
      const page = await cache.match('./index.html');
      if (page) return page;
    }
    return fetch(request);
  })());
});
