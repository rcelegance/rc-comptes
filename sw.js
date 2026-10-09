const C='rdc-v4';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)).catch(()=>{}))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const u=new URL(req.url),key=u.origin+u.pathname;
  const html=req.mode==='navigate'||/\.html$|\/$/.test(u.pathname);
  if(html){
    /* Page : toujours la version en ligne d'abord, la copie gardée seulement sans internet */
    e.respondWith(fetch(req.url,{cache:'no-store'}).then(res=>{
      if(res&&res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(key,cp))}
      return res;
    }).catch(()=>caches.match(key).then(r=>r||caches.match('./index.html')).then(r=>r||caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(r=>r||fetch(req).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(req,cp))}return res})));
});
