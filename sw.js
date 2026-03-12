// RellikRentals Service Worker v1.0
// Handles push notifications via Firebase Cloud Messaging

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAXKtBIVFazSDS8oY9tj8mmdIgGfiQgLr4",
  authDomain: "rellikrental.firebaseapp.com",
  projectId: "rellikrental",
  storageBucket: "rellikrental.firebasestorage.app",
  messagingSenderId: "1024695943624",
  appId: "1:1024695943624:web:aeb499cfd882b49624c0fd"
});

const messaging = firebase.messaging();

// Handle background messages (app is closed or in background)
messaging.onBackgroundMessage(function(payload) {
  console.log('[SW] Background message received:', payload);

  const title = payload.notification?.title || 'RellikRentals';
  const options = {
    body: payload.notification?.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: payload.data?.tag || 'rellikrentals',
    data: payload.data || {},
    vibrate: [200, 100, 200],
    requireInteraction: false
  };

  return self.registration.showNotification(title, options);
});

// Handle notification click — open the app
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.includes('rellik.ca') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('https://www.rellik.ca/');
      }
    })
  );
});

// Cache static assets for offline use
var CACHE_NAME = 'rellikrentals-v4.1';
var urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});
