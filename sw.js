// Кэш для работы без интернета. При обновлении файлов поменяйте номер версии.
const CACHE="racion-v1";
const SHELL=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL))); self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))); self.clients.claim()});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET") return;
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(e.request,{ignoreSearch:true}) || (e.request.mode==="navigate" ? await c.match("./") : undefined);
    const net=fetch(e.request).then(r=>{ if(r&&(r.ok||r.type==="opaque")) c.put(e.request,r.clone()); return r }).catch(()=>hit);
    return hit||net;
  }));
});
