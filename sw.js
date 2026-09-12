const C="miori-kanji-v06";
const S=["./","./index.html","./manifest.webmanifest","./style.css","./core.js","./practice.js"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(S)))});
self.addEventListener("activate",e=>e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x))))])));
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);if(u.origin!==location.origin)return;
  if(e.request.mode==="navigate"){
    e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(C).then(c=>c.put("./index.html",copy));return r}).catch(()=>caches.match("./index.html")));
  }else{
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(net=>{const copy=net.clone();caches.open(C).then(c=>c.put(e.request,copy));return net})));
  }
});
