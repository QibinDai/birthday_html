var CACHE_NAME = 'happy-birthday-v14';
var ASSETS = [
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
          .map(function(n) { return caches.delete(n); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(resp) {
      return resp || fetch(e.request).then(function(resp2) {
        if (resp2 && resp2.status === 200) {
          var resp2Clone = resp2.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, resp2Clone);
          });
        }
        return resp2;
      }).catch(function() {
        return caches.match('index.html');
      });
    })
  );
});
