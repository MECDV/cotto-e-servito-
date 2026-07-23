const CACHE = 'cotto-v5';

const STATIC = [
  '/cotto-e-servito-/',
  '/cotto-e-servito-/index.html',
  '/cotto-e-servito-/gestione.html',
  '/cotto-e-servito-/emailjs.min.js',
  '/cotto-e-servito-/icon.svg',
  '/cotto-e-servito-/manifest.json',
  '/cotto-e-servito-/gestione-manifest.json',
];

const DATA_PATTERNS = [
  'prodotti.json',
  'galleria.json',
  'config.json',
  'coupons.json',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(STATIC))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const isData = DATA_PATTERNS.some(p => url.pathname.endsWith(p));

  if (isData) {
    // Network-first: dati sempre freschi, fallback alla cache offline
    e.respondWith(
      fetch(e.request)
        .then(r => {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return r;
        })
        .catch(() => caches.match(e.request))
    );
  } else if (e.request.method === 'GET') {
    // Cache-first: asset statici (HTML, JS, SVG, immagini)
    e.respondWith(
      caches.match(e.request)
        .then(r => r || fetch(e.request))
    );
  }
});
