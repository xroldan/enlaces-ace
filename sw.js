const CACHE_NAME = 'acestream-tv-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/canales.css',
  '/scripts/canales.js',
  '/data/canales.json',
  '/assets/favicon.svg',
  '/faq.html'
];

// Instalar service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Interceptar peticiones
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devolver desde cache si está disponible
        if (response) {
          return response;
        }
        
        // Si no está en cache, hacer la petición a la red
        return fetch(event.request).then(response => {
          // No cachear peticiones que no sean GET
          if (!response || response.status !== 200 || response.type !== 'basic' || event.request.method !== 'GET') {
            return response;
          }
          
          // Clonar la respuesta para cachearla
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
  );
});

// Limpiar caches antiguos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 