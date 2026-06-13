const CACHE = '%s';
const ASSETS = ['./', './index.html', './manifest.json', './icon-180.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.mode === 'navigate' || req.destination === 'document') {
    // HTML: сначала сеть, кэш — запасной вариант для офлайна
    e.respondWith(
      fetch(req).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put('./index.html', copy));
        return r;
      }).catch(() => caches.match(req, {ignoreSearch:true}).then(r => r || caches.match('./index.html')))
    );
  } else {
    // статика: сначала кэш
    e.respondWith(caches.match(req, {ignoreSearch:true}).then(r => r || fetch(req)));
  }
});