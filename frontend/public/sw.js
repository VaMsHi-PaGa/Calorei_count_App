const CACHE_NAME = "fittrack-v1";
const STATIC_ASSETS = ["/", "/manifest.json"];

// Install: cache static shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API calls, cache-first for static assets
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Let API requests pass through (never cache)
  if (url.port === "8000" || url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful GET responses for same-origin pages
        if (
          event.request.method === "GET" &&
          response.status === 200 &&
          url.origin === self.location.origin
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Push notification handler
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "FitTrack Reminder";
  const options = {
    body: data.body || "Time to log your progress!",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: data.tag || "fittrack-nudge",
    renotify: true,
    data: { url: data.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click: open/focus the app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }
        return clients.openWindow(target);
      })
  );
});

// Message handler for scheduled nudge alarms sent from the page
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SCHEDULE_NUDGES") {
    // Acknowledged — actual scheduling done via setTimeout in the client
    if (event.source) event.source.postMessage({ type: "NUDGES_ACK" });
  }
});
