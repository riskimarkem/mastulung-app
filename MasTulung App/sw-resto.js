// Service Worker - TulangTulung Resto App
const CACHE_NAME = 'ttg-resto-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(['/resto.html', '/manifest-resto.json', '/logo-resto.png']);
    }).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME && k.startsWith('ttg-resto')).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Request ke domain lain (foto imgbb, Firebase, Google Maps, dll)
  // dibiarkan lewat apa adanya -- SW tidak ikut campur sama sekali.
  // Ini penting supaya foto dari i.ibb.co, panggilan Firebase Auth, dsb
  // tidak ikut "ditangkap" dan malah gagal gara-gara logika cache di bawah.
  if (url.origin !== self.location.origin) {
    return;
  }

  // Hanya untuk request ke file sendiri (app shell): coba network dulu,
  // kalau gagal (misal offline) baru pakai cache. Kalau cache juga tidak
  // ada, tetap kembalikan Response yang valid (bukan undefined) supaya
  // tidak muncul error "Failed to convert value to 'Response'".
  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return new Response('Offline dan file tidak ada di cache.', {
          status: 503,
          statusText: 'Offline',
          headers: { 'Content-Type': 'text/plain' }
        });
      })
    )
  );
});
