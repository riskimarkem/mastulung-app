// Import script Firebase khusus untuk Service Worker (versi compat)
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// Konfigurasi Firebase Asli TulangTulung Gombong
const firebaseConfig = {
    apiKey: "AIzaSyCO4vDd6Z1NnrMx5gK7nMCyDceaGZj_bQw",
    authDomain: "mastulungmasgombong.firebaseapp.com",
    databaseURL: "https://mastulungmasgombong-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "mastulungmasgombong",
    storageBucket: "mastulungmasgombong.firebasestorage.app",
    messagingSenderId: "4547691331",
    appId: "1:4547691331:web:45ecd39aab90f45b4f25f6",
    measurementId: "G-MCYH7YMQXQ"
};

// Inisialisasi Firebase di dalam Service Worker
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Menangani notifikasi saat aplikasi ditutup (Background)
messaging.onBackgroundMessage((payload) => {
    console.log('[TulangTulung SW] Notifikasi background diterima: ', payload);

    const notificationTitle = payload.notification?.title || '🛵 TulangTulung Gombong';
    const notificationOptions = {
        body: payload.notification?.body || 'Ada pembaruan pesanan untuk Anda.',
        // Ikon yang muncul di notifikasi HP (menggunakan ikon aplikasi Anda)
        icon: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
        // Getaran HP saat notif masuk
        vibrate: [200, 100, 200, 100, 200],
        data: {
            url: payload.data?.click_action || '/' // URL yang dibuka saat notifikasi diklik
        }
    };

    // Memunculkan notifikasi sistem di HP
    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Event listener saat pengguna mengeklik notifikasi
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    const urlToOpen = event.notification.data.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Cek apakah tab aplikasi sudah terbuka, jika ya, fokuskan
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Jika belum terbuka, buka tab baru
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});