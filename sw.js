// Network-first document navigation for the installed iPad web app.
// No offline HTML cache: every app launch asks the network for a current page.
self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    // Delete only this app's former caches; other family.nagaita.jp apps share the origin.
    const names = await caches.keys();
    const old = names.filter(name => /^(miori-kanji|kanji-quest)/i.test(name));
    await Promise.all(old.map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || event.request.mode !== 'navigate') return;
  const scope = new URL(self.registration.scope);
  const target = new URL(event.request.url);
  if (target.origin !== scope.origin || !target.pathname.startsWith(scope.pathname)) return;
  event.respondWith(fetch(new Request(event.request, { cache: 'no-store' })));
});
