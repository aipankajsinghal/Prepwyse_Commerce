// Service Worker for PrepWyse Commerce PWA
const CACHE_NAME = 'prepwyse-v1';
const RUNTIME_CACHE = 'prepwyse-runtime-v1';
const OFFLINE_URL = '/offline';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/dashboard',
  '/quiz',
  '/mock-test',
  '/profile',
  '/offline',
];

// Install event - precache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching app shell');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.error('[SW] Precache failed:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and other protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Skip Clerk authentication requests
  if (url.pathname.startsWith('/api/auth') || url.hostname.includes('clerk')) {
    return;
  }

  // API requests - Network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached version if available
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline fallback for failed API requests
            return new Response(
              JSON.stringify({ error: 'Offline', offline: true }),
              {
                headers: { 'Content-Type': 'application/json' },
                status: 503,
              }
            );
          });
        })
    );
    return;
  }

  // Static assets and pages - Cache first, fallback to network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200) {
            return response;
          }

          // Clone and cache the response
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });

          return response;
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match(OFFLINE_URL).then((offlineResponse) => {
              return offlineResponse || new Response('Offline');
            });
          }
          return new Response('Offline', { status: 503 });
        });
    })
  );
});

// Background sync for quiz submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-quiz-attempts') {
    event.waitUntil(syncQuizAttempts());
  }
});

async function syncQuizAttempts() {
  try {
    // Get pending quiz attempts from IndexedDB
    const db = await openDB();
    const pendingAttempts = await db.getAll('pendingAttempts');

    for (const attempt of pendingAttempts) {
      try {
        const response = await fetch('/api/attempts/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(attempt),
        });

        if (response.ok) {
          // Remove synced attempt from IndexedDB
          await db.delete('pendingAttempts', attempt.id);
          console.log('[SW] Synced quiz attempt:', attempt.id);
        }
      } catch (err) {
        console.error('[SW] Failed to sync attempt:', err);
      }
    }
  } catch (err) {
    console.error('[SW] Background sync failed:', err);
  }
}

// Helper to open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('prepwyse-offline', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingAttempts')) {
        db.createObjectStore('pendingAttempts', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('cachedQuestions')) {
        db.createObjectStore('cachedQuestions', { keyPath: 'quizId' });
      }
    };
  });
}

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
