// Работа без интернета. Страница берётся из сети, если она есть (так обновления видны сразу),
// иначе из сохранённой копии. При обновлении файлов поменяйте номер версии.
const CACHE="racion-v17";
const SHELL=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./apple-touch-icon.png","./html5-qrcode.min.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:"reload"}))))); self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))); self.clients.claim()});
function timeout(ms){return new Promise((_,rej)=>setTimeout(()=>rej(new Error("timeout")),ms))}
self.addEventListener("fetch",e=>{
  const req=e.request; if(req.method!=="GET") return;
  if(new URL(req.url).hostname.includes("openfoodfacts")) return; // база продуктов: всегда из сети
  const isPage=req.mode==="navigate"||/\/(index\.html)?$/.test(new URL(req.url).pathname);
  if(isPage){
    e.respondWith((async()=>{
      const c=await caches.open(CACHE);
      try{const r=await Promise.race([fetch(req,{cache:"no-store"}),timeout(4000)]); if(r&&r.ok){c.put("./",r.clone())} return r}
      catch(err){return (await c.match("./"))||(await c.match(req,{ignoreSearch:true}))||Response.error()}
    })());
    return;
  }
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(req,{ignoreSearch:true});
    const net=fetch(req).then(r=>{ if(r&&(r.ok||r.type==="opaque")) c.put(req,r.clone()); return r }).catch(()=>hit);
    return hit||net;
  }));
});
