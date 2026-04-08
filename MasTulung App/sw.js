const CACHE_NAME = 'tulangtulung-v1';

// Daftar file yang akan disimpan di memori HP agar loading super cepat
const urlsToCache = [
  '/',
  '/index.html',
  '/driver.html',
  '/admin.html'
];

// Saat aplikasi pertama kali diinstal
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Membersihkan cache lama jika ada update aplikasi
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
  self.clients.claim();
});

// Strategi: Network First, fallback to Cache 
// (Selalu minta data terbaru dari internet, kalau sinyal jelek baru pakai data simpanan)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
