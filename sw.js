
'use strict';

// const CACHE_VERSION = 'v1';
// const CACHE_NAME = `${registration.scope}!${CACHE_VERSION}`;
const CACHE_NAME      = 'static-cache-v3';

// キャッシュするファイルをセットする
// const filesToCache = [
//   '.',
//   'index.html',
//   'css/styles.css',
//   'icons/icon-192x192.png',
//   'icons/icon-512x512.png',
//   'js/EnvironmentSensor.js',
//   'js/DrawCanvas.js',
//   'js/app.js'
// ];
const filesToCache = [
  '.',
  'https://ohata-renesas.github.io/RL78_G1D_Sensor_SHTC3_SCD40/index.html',
  'https://ohata-renesas.github.io/RL78_G1D_Sensor_SHTC3_SCD40/css/styles.css',
  'https://ohata-renesas.github.io/RL78_G1D_Sensor_SHTC3_SCD40/icons/favicon-32x32.png',
  'https://ohata-renesas.github.io/RL78_G1D_Sensor_SHTC3_SCD40/icons/favicon-48x48.png',
  'https://ohata-renesas.github.io/RL78_G1D_Sensor_SHTC3_SCD40/icons/favicon-96x96.png',
  'https://ohata-renesas.github.io/RL78_G1D_Sensor_SHTC3_SCD40/icons/favicon-144x144.png',
  'https://ohata-renesas.github.io/RL78_G1D_Sensor_SHTC3_SCD40/icons/icon-192x192.png',
  'https://ohata-renesas.github.io/RL78_G1D_Sensor_SHTC3_SCD40/icons/icon-512x512.png',
  'https://ohata-renesas.github.io/RL78_G1D_Sensor_SHTC3_SCD40/js/EnvironmentSensor.js',
  'https://ohata-renesas.github.io/RL78_G1D_Sensor_SHTC3_SCD40/js/DrawCanvas.js',
  'https://ohata-renesas.github.io/RL78_G1D_Sensor_SHTC3_SCD40/js/app.js'
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

// self.addEventListener('install', (event) => {
//   event.waitUntil(
//     // キャッシュを開く
//     caches.open(CACHE_NAME)
//     .then((cache) => {
//       // 指定されたファイルをキャッシュに追加する
//       return cache.addAll(filesToCache);
//     })
//   );
// });

// self.addEventListener('activate', (event) => {
//   event.waitUntil(
//     caches.keys().then((cacheNames) => {
//       return cacheNames.filter((cacheName) => {
//         // このスコープに所属していて且つCACHE_NAMEではないキャッシュを探す
//         return cacheName.startsWith(`${registration.scope}!`) &&
//                cacheName !== CACHE_NAME;
//       });
//     }).then((cachesToDelete) => {
//       return Promise.all(cachesToDelete.map((cacheName) => {
//         // いらないキャッシュを削除する
//         return caches.delete(cacheName);
//       }));
//     })
//   );
// });

// self.addEventListener('fetch', (event) => {
//   event.respondWith(
//     caches.match(event.request)
//     .then((response) => {
//       // キャッシュ内に該当レスポンスがあれば、それを返す
//       if (response) {
//         return response;
//       }

//       // 重要：リクエストを clone する。リクエストは Stream なので
//       // 一度しか処理できない。ここではキャッシュ用、fetch 用と2回
//       // 必要なので、リクエストは clone しないといけない
//       let fetchRequest = event.request.clone();

//       return fetch(fetchRequest)
//         .then((response) => {
//           if (!response || response.status !== 200 || response.type !== 'basic') {
//             // キャッシュする必要のないタイプのレスポンスならそのまま返す
//             return response;
//           }

//           // 重要：レスポンスを clone する。レスポンスは Stream で
//           // ブラウザ用とキャッシュ用の2回必要。なので clone して
//           // 2つの Stream があるようにする
//           let responseToCache = response.clone();

//           caches.open(CACHE_NAME)
//             .then((cache) => {
//               cache.put(event.request, responseToCache);
//             });

//           return response;
//         });
//     })
//   );
// });