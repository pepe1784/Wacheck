// ============================================================
// Wacheck Service Worker v3.0
// Estrategia: Cache-First para assets, Network-First para API
// ============================================================

const CACHE_VERSION = 'wacheck-v5.3.0';
const API_CACHE   = 'wacheck-api-v5';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/game-page.html',
  '/css/landing.css',
  '/css/game-page.css',
  '/css/auth-modal.css',
  '/css/main.css',
  '/js/auth.js',
  '/js/landing.js',
  '/js/game-page.js',
  '/script.js',
  '/sounds.js',
  '/session-manager.js',
  '/guest-user-manager.js',
  '/daily-rewards-modal.js',
  '/achievements.js',
  '/rewards.js',
  '/tutorial.js',
  '/historia.js',
  '/calculadora.js',
  '/anti-cheat.js',
  '/manifest.json',
  '/img/vaporeon.png',
  '/img/filter.png',
  '/img/plant.png',
  '/img/recycler.png',
];

// ---- INSTALL: pre-cache static assets ----
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => {
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })));
    }).catch(err => console.warn('[SW] Pre-cache error:', err))
  );
});

// ---- ACTIVATE: limpia caches viejos ----
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_VERSION && k !== API_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ---- FETCH: Estrategia por tipo de recurso ----
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Ignorar peticiones cross-origin (avatares de Google, CDNs externos, etc.)
  if (url.origin !== self.location.origin) return;

  // No cachear peticiones a la API, admin, ni archivos sensibles
  if (url.pathname.includes('/api/') || url.pathname.includes('/admin/')) {
    // Network-only para API
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({ error: 'Sin conexión' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 503
        })
      )
    );
    return;
  }

  // No cachear peticiones POST
  if (event.request.method !== 'GET') return;

  // Cache-First para assets estáticos (imágenes, audio, fuentes)
  // NOTA: JS y CSS se sirven con URL versionada (?v=X), así que
  // Cache-First no aplica — siempre se obtiene versión fresca.
  if (
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff2?|mp3|wav|ogg|glb|gltf)$/)
  ) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then(c => c.put(event.request, clone));
          }
          return response;
        }).catch(() => {
          return new Response('', { status: 404, statusText: 'Not Found' });
        });
      })
    );
    return;
  }

  // Network-First para HTML (siempre fresco si hay conexión)
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(c => c.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => cached || new Response('', { status: 503 })))
  );
});

// ---- BACKGROUND SYNC: enviar datos guardados offline ----
self.addEventListener('sync', event => {
  if (event.tag === 'sync-game-progress') {
    event.waitUntil(syncGameProgress());
  }
});

async function syncGameProgress() {
  // Recuperar datos guardados offline en IndexedDB y enviar al servidor
  // (implementado en el cliente via idb-keyval o similar)
  console.log('[SW] Syncing offline game progress...');
}

// ---- PUSH NOTIFICATIONS (base) ----
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'Wacheck', {
      body:  data.body  || '¡Tienes una notificación!',
      icon:  '/img/icon-192.png',
      badge: '/img/icon-192.png',
      tag:   data.tag || 'wacheck',
      data:  { url: data.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
