
'use strict';

const CACHE_VERSION   = 'v0.8.1';
const CACHE_NAME      = 'static-cache-' + CACHE_VERSION;

// キャッシュするファイルをセットする
const filesToCache = [
  '.',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './icons/favicon-32x32.png',
  './icons/favicon-48x48.png',
  './icons/favicon-96x96.png',
  './icons/favicon-144x144.png',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './js/EnvironmentalSensor.js',
  './js/DrawCanvas.js',
  './js/app.js',
];


self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then((cache) => {
      console.log('[ServiceWorker] Pre-caching');
      return cache.addAll(filesToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  console.log('[ServiceWorker] Fetch', event.request.url);
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      });
    })
  );
});