/* Agrolina PWA Service Worker - Cache stratejisi: shell cache-first, API network-first */

const CACHE_NAME = 'agrolina-v2';
const RUNTIME_CACHE = 'agrolina-runtime-v2';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json'
      ]).catch(() => {}); // manifest/root yoksa dev'de hata vermesin
    })
  );
  self.skipWaiting();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API istekleri: sadece network (cache'leme yok)
  if (url.pathname.startsWith('/api/') || url.origin.includes('onrender.com')) {
    event.respondWith(fetch(request));
    return;
  }

  // Aynı origin: sayfa, js, css, font, resim - network first, fallback cache
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          if (response.status === 200 && request.method === 'GET') {
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/index.html')))
    );
    return;
  }

  event.respondWith(fetch(request));
});
