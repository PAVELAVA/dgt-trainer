const CACHE='dgt-phrases-v1';
const ASSETS=['./','./index.html','./data.js','./manifest.json','./icon-180.png','./icon-512.png'];
self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS).catch(()=>{})));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  const freshNeeded = req.mode==='navigate' || url.pathname.endsWith('index.html') || url.pathname.endsWith('data.js');
  if(freshNeeded){
    // сначала сеть, кэш — запасной вариант для офлайна
    e.respondWith(
      fetch(req).then(r=>{
        const copy=r.clone();
        caches.open(CACHE).then(c=>c.put(req,copy));
        return r;
      }).catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match('./index.html')))
    );
  } else {
    // статика (иконки): сначала кэш
    e.respondWith(caches.match(req,{ignoreSearch:true}).then(r=>r||fetch(req)));
  }
});
