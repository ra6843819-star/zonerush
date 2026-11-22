var C = 'zonerush-v2';
var URLS = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
var EXT = ['https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&display=swap'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(C).then(function (c) {
    var own = URLS.map(function (u) {
      return fetch(new Request(u, { cache: 'reload' })).then(function (r) { return c.put(u, r); }).catch(function () {});
    });
    var ext = EXT.map(function (u) {
      return fetch(new Request(u, { mode: 'no-cors' })).then(function (r) { return c.put(u, r); }).catch(function () {});
    });
    return Promise.all(own.concat(ext));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== C; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var same = new URL(e.request.url).origin === self.location.origin;
  function store(r) {
    var cp = r.clone();
    caches.open(C).then(function (c) { c.put(e.request, cp); }).catch(function () {});
    return r;
  }
  if (same) {
    e.respondWith(fetch(e.request).then(store).catch(function () { return caches.match(e.request); }));
  } else {
    e.respondWith(caches.match(e.request).then(function (hit) { return hit || fetch(e.request).then(store); }));
  }
});
