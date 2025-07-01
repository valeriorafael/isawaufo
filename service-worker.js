// Configuração do Service Worker para funcionalidade offline
// Este arquivo deve ser referenciado no HTML principal

// Versão do cache - altere para forçar atualização
const CACHE_VERSION = 'v1';
const CACHE_NAME = `ufo-sightings-cache-${CACHE_VERSION}`;

// Arquivos a serem cacheados para funcionalidade offline
const CACHE_FILES = [
  '/',
  '/index.html',
  '/login.html',
  '/register.html',
  '/sightings.html',
  '/add-sighting.html',
  '/profile.html',
  '/sighting-details.html',
  '/instructions.html',
  '/admin.html',
  '/admin-users.html',
  '/admin-sightings.html',
  '/css/styles.css',
  '/js/api-config.js',
  '/js/auth.js',
  '/js/auth-protection.js',
  '/js/map.js',
  '/js/sightings.js',
  '/js/add-sighting.js',
  '/js/sighting-details.js',
  '/js/profile.js',
  '/js/main.js',
  '/js/admin.js',
  '/js/offline-manager.js',
  '/images/default-sighting.jpg',
  '/images/ufo-bg.jpg',
  '/images/user-placeholder.png',
  '/images/offline-icon.svg',
  'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js'
];

// Instalar o Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker instalando...');
  
  // Forçar o Service Worker a se tornar ativo imediatamente
  self.skipWaiting();
  
  // Pré-cachear arquivos essenciais
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(CACHE_FILES);
      })
      .catch(error => {
        console.error('Erro ao cachear arquivos:', error);
      })
  );
});

// Ativar o Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker ativando...');
  
  // Limpar caches antigos
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName.startsWith('ufo-sightings-cache-'))
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => caches.delete(cacheName))
        );
      })
      .then(() => {
        console.log('Service Worker ativado');
        // Tomar controle de clientes não controlados
        return self.clients.claim();
      })
  );
});

// Interceptar requisições
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
      .catch(() => {
        // Retornar página offline se não houver conexão
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      })
  );
});

// Sincronizar dados quando online novamente
self.addEventListener('sync', event => {
  if (event.tag === 'sync-sightings') {
    event.waitUntil(syncSightings());
  } else if (event.tag === 'sync-comments') {
    event.waitUntil(syncComments());
  } else if (event.tag === 'sync-ratings') {
    event.waitUntil(syncRatings());
  }
});

// Função para sincronizar avistamentos
function syncSightings() {
  return new Promise((resolve, reject) => {
    // Aqui seria implementada a lógica para sincronizar avistamentos
    // armazenados localmente com o servidor quando a conexão for restabelecida
    
    // Exemplo simplificado:
    // 1. Obter avistamentos do IndexedDB
    // 2. Enviar para o Firebase
    // 3. Atualizar status no IndexedDB
    
    console.log('Sincronizando avistamentos...');
    resolve();
  });
}

// Função para sincronizar comentários
function syncComments() {
  return new Promise((resolve, reject) => {
    // Lógica similar à sincronização de avistamentos
    console.log('Sincronizando comentários...');
    resolve();
  });
}

// Função para sincronizar avaliações
function syncRatings() {
  return new Promise((resolve, reject) => {
    // Lógica similar à sincronização de avistamentos
    console.log('Sincronizando avaliações...');
    resolve();
  });
}

// Notificar o cliente sobre atualizações
self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
