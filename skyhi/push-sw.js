self.addEventListener('push', event => {
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch (_) {
        data = {};
    }

    const title = data.title || 'SkyHi';
    const body = data.body || 'New lantern message received.';
    const skyPin = data.data && data.data.skyPin ? String(data.data.skyPin) : '';
    const url = skyPin ? ('./index.html?pin=' + encodeURIComponent(skyPin)) : './index.html';

    event.waitUntil(
        self.registration.showNotification(title, {
            body,
            icon: './New Logo 2.png',
            badge: './New Logo 2.png',
            data: { url }
        })
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    const targetUrl = (event.notification.data && event.notification.data.url) || './index.html';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            for (const client of clientList) {
                if ('focus' in client) {
                    client.navigate(targetUrl);
                    return client.focus();
                }
            }
            if (clients.openWindow) return clients.openWindow(targetUrl);
            return null;
        })
    );
});
