/*
 * Élan service worker — minimal offline (docs/plan.md §2.3, D-056).
 * - Pages: network first, last good copy as fallback, then /offline.
 * - Next.js static assets: cache first (they are content-hashed).
 * - API calls are never cached: the in-app queues retry them.
 */
const VERSION = 'elan-v1'
const PAGES = `${VERSION}-pages`
const ASSETS = `${VERSION}-assets`
const OFFLINE_URL = '/offline'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((cache) => cache.add(new Request(OFFLINE_URL, { cache: 'reload' })))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('message', (event) => {
  // Sign-out and account deletion: forget every cached page.
  if (event.data === 'clear')
    event.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))))
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/')
  )
    return

  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone()
              caches.open(ASSETS).then((cache) => cache.put(request, copy))
            }
            return response
          }),
      ),
    )
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && response.type === 'basic') {
            const copy = response.clone()
            caches.open(PAGES).then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(() => caches.match(request).then((hit) => hit || caches.match(OFFLINE_URL))),
    )
  }
})
