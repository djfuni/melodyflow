// MelodyFlow Service Worker
var CACHE = 'melodyflow-v1';

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll([
        'music-player.html'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
          .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // Only cache same-origin HTML/CSS/JS
  if (e.request.url.indexOf('api.qijieya.cn') >= 0 ||
      e.request.url.indexOf('http') !== 0) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(r) {
      return r || fetch(e.request).then(function(res) {
        if (res && res.status === 200 && e.request.url.indexOf('music-player.html') >= 0) {
          var c = caches.open(CACHE);
          c.then(function(cache) { cache.put(e.request, res.clone()); });
        }
        return res;
      });
    })
  );
});
