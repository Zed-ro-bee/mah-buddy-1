const CACHE="mah-buddy-shell-v4";
const SHELL=["/","/icon.svg","/mah-buddy-logo.svg"];

self.addEventListener("install",event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(c=>c.addAll(SHELL))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k.startsWith("mah-buddy-shell-")&&k!==CACHE).map(k=>caches.delete(k))
    )).then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",event=>{
  const request=event.request;
  const url=new URL(request.url);
  if(request.method!=="GET"||url.origin!==self.location.origin)return;
  if(url.pathname.startsWith("/api/"))return;

  // Never cache document navigations: stale HTML can point at CSS chunks that no longer exist.
  if(request.mode==="navigate"){
    event.respondWith(
      fetch(request).catch(()=>caches.match("/").then(cached=>cached||Response.error()))
    );
    return;
  }

  // Network-first for assets so the latest deployed UI is picked up promptly.
  event.respondWith(
    fetch(request)
      .then(response=>{
        if(response.ok){
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(request,copy));
        }
        return response;
      })
      .catch(()=>caches.match(request).then(cached=>cached||caches.match("/")))
  );
});
