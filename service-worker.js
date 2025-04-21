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
  '/admin-dashboard.html',
  '/admin-users.html',
  '/admin-sightings.html',
  '/css/styles.css',
  '/js/firebase-config.js',
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
  '/js/social-login.js',
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
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker ativado');
        // Tomar controle de clientes não controlados
        return self.clients.claim();
      })
  );
});

// Interceptar requisições de rede
self.addEventListener('fetch', event => {
  // Ignorar requisições para o Firebase
  if (event.request.url.includes('firebaseio.com') || 
      event.request.url.includes('googleapis.com') ||
      event.request.url.includes('firebase')) {
    return;
  }
  
  // Estratégia Cache First, depois Network
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retornar do cache se encontrado
        if (response) {
          return response;
        }
        
        // Clonar a requisição - a requisição só pode ser usada uma vez
        const fetchRequest = event.request.clone();
        
        // Fazer requisição à rede
        return fetch(fetchRequest)
          .then(response => {
            // Verificar se a resposta é válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clonar a resposta - a resposta só pode ser usada uma vez
            const responseToCache = response.clone();
            
            // Adicionar ao cache para uso futuro
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(error => {
            console.error('Erro ao buscar recurso:', error);
            
            // Se for uma página HTML, retornar a página offline
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
          });
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
