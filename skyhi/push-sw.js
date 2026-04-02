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
    const appUrl = new URL('./index.html', self.registration.scope);
    if (skyPin) {
        appUrl.searchParams.set('pin', skyPin);
    }
    const iconUrl = new URL('./New Logo 2.png', self.registration.scope).toString();

    event.waitUntil(
        self.registration.showNotification(title, {
            body,
            icon: iconUrl,
            badge: iconUrl,
            data: { url: appUrl.toString() }
        })
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    const targetUrl = (event.notification.data && event.notification.data.url)
        || new URL('./index.html', self.registration.scope).toString();

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
