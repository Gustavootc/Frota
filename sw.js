/* FrotaCheck v3 · Service Worker
   - permite instalar o app na tela inicial (PWA)
   - recebe Web Push (Edge Function send-push) e abre a tela certa ao tocar na notificação
   Os dados sempre vêm do servidor (sem cache offline de dados). */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});

self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { title: 'FrotaCheck', body: e.data && e.data.text() }; }
  const title = d.title || 'FrotaCheck';
  e.waitUntil(self.registration.showNotification(title, {
    body: d.body || '',
    icon: 'icon.svg',
    badge: 'icon.svg',
    tag: d.id || undefined,
    renotify: !!d.id,
    requireInteraction: d.priority === 'alta',
    data: { link: d.link || '' }
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const link = (e.notification.data && e.notification.data.link) || '';
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) {
      if (c.url.includes(self.registration.scope)) { c.postMessage({ link }); return c.focus(); }
    }
    return self.clients.openWindow('./index.html' + (link ? '?link=' + encodeURIComponent(link) : ''));
  })());
});
