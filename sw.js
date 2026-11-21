// Mi Asistente: guarda la pantalla para que la app abra aunque no haya cobertura.
// Los datos NO se guardan aquí: los pide siempre al programa de Google con tu clave.
var CACHE = 'mi-asistente-v2';
var ARCHIVOS = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ARCHIVOS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // el programa de Google, siempre en directo
  // Primero la red (para estrenar cambios enseguida); si no hay, lo guardado
  // cache: 'no-cache' = preguntar siempre a GitHub si hay versión nueva (si no, el móvil puede tardar 10 min en verla)
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(function (r) {
    var copia = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copia); });
    return r;
  }).catch(function () { return caches.match(e.request).then(function (r) { return r || caches.match('index.html'); }); }));
});
