self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('message', event => {
  if (event.data?.type === 'MAH_BUDDY_NOTIFY') {
    const title = event.data.title || 'Mah Buddy';
    const options = { body: event.data.body || 'Your study companion has something for you.', icon: '/icon-192.png', badge: '/icon-192.png', tag: 'mah-buddy' };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
    const existing = clients.find(client => 'focus' in client);
    return existing ? existing.focus() : self.clients.openWindow('/');
  }));
});
