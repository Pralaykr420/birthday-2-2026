/* ============================================================================
 *  The service worker.
 *
 *  This is the piece that makes the app work with no internet at all. It sits
 *  between the app and the network and answers requests from a copy it saved
 *  on her phone.
 *
 *  Which matters enormously here, because midnight is exactly the moment a
 *  phone decides it has one bar of signal in a bedroom.
 *
 *  IF YOU CHANGE ANYTHING IN THIS APP, bump CACHE_VERSION below. That is what
 *  tells her phone to throw away the old copy and fetch the new one. Forget
 *  it and she will keep seeing the previous version forever.
 * ========================================================================= */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `omniscient-${CACHE_VERSION}`;

/** The bare minimum needed to open the app with no connection. */
const CORE_FILES = ['./', './index.html', './manifest.json', './favicon.svg'];

/* ---------------------------------------------------------------------------
 * Install: save the core files
 * ------------------------------------------------------------------------ */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // addAll fails entirely if any single file 404s, which would leave her
      // with no cache at all. Adding them one at a time means one missing
      // file cannot take the rest down with it.
      Promise.all(
        CORE_FILES.map((file) => cache.add(file).catch(() => undefined)),
      ),
    ),
  );

  // Take over straight away rather than waiting for every tab to close.
  self.skipWaiting();
});

/* ---------------------------------------------------------------------------
 * Activate: delete caches from older versions
 * ------------------------------------------------------------------------ */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

/* ---------------------------------------------------------------------------
 * Fetch: decide where each request gets answered from
 *
 * Three different strategies, because three different kinds of thing:
 *
 *   Photos, fonts, JS, CSS  -> cache first. They never change without their
 *                              filename changing, so a saved copy is always
 *                              correct and always instant.
 *
 *   The page itself         -> network first, cache as backup. So she gets
 *                              your latest version when online, and the last
 *                              one she saw when offline.
 *
 *   /api/ requests          -> network only, never cached. A cached wish
 *                              would be worse than no wish. The app's own
 *                              offline queue handles these instead.
 * ------------------------------------------------------------------------ */
self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never cache the backend.
  if (url.pathname.startsWith('/api/')) return;

  const isAsset =
    url.origin === self.location.origin &&
    /\.(webp|jpg|jpeg|png|svg|woff2?|js|css)$/i.test(url.pathname);

  const isFont = url.hostname.includes('fonts.g');

  /* ---- Cache first ---- */
  if (isAsset || isFont) {
    event.respondWith(
      caches.match(request).then((saved) => {
        if (saved) return saved;

        return fetch(request).then((response) => {
          // Only save real, complete responses. Caching an error page would
          // make the mistake permanent.
          if (response.ok || response.type === 'opaque') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      }),
    );
    return;
  }

  /* ---- Network first, for the page itself ---- */
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
          return response;
        })
        .catch(() =>
          caches
            .match('./index.html')
            .then((saved) => saved ?? new Response('Offline', { status: 503 })),
        ),
    );
  }
});

/* ---------------------------------------------------------------------------
 * A notification at midnight
 *
 * The app asks for this to be scheduled when she last opens it before her
 * birthday. It is a nice extra, not the main event - phones are allowed to
 * kill a sleeping service worker, so never rely on this firing. The in-app
 * midnight takeover is what actually carries the moment.
 * ------------------------------------------------------------------------ */
self.addEventListener('message', (event) => {
  if (event.data?.type !== 'schedule-midnight') return;

  const delay = event.data.delayMs;
  if (typeof delay !== 'number' || delay <= 0 || delay > 26 * 60 * 60 * 1000) return;

  event.waitUntil(
    new Promise((resolve) => {
      setTimeout(() => {
        self.registration
          .showNotification(event.data.title ?? 'Open me', {
            body: event.data.body ?? 'It is midnight. Something is waiting for you.',
            icon: './icon-192.png',
            badge: './icon-192.png',
            vibrate: [120, 60, 120, 60, 240],
            tag: 'midnight',
            requireInteraction: true,
          })
          .then(resolve)
          .catch(resolve);
      }, delay);
    }),
  );
});

/** Tapping the notification opens the app rather than a new browser tab. */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const existing = windows.find((window) => 'focus' in window);
      if (existing) return existing.focus();
      return self.clients.openWindow('./');
    }),
  );
});
