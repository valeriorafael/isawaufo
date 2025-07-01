// Gerenciador de funcionalidade offline
// Este arquivo gerencia o armazenamento local e sincronização de dados

// Constantes para nomes de armazenamento
const INDEXED_DB_NAME = 'ufo-sightings-offline-db';
const INDEXED_DB_VERSION = 1;
const STORE_SIGHTINGS = 'sightings';
const STORE_COMMENTS = 'comments';
const STORE_RATINGS = 'ratings';
const STORE_USER_DATA = 'userData';

// Status de sincronização
let syncPending = false;

// Inicializar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    initOfflineManager();
    updateSyncUI();
    registerServiceWorker();
    
    // Adicionar listeners para eventos online/offline
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);
    
    // Verificar status inicial
    updateOnlineStatus();
});

// Inicializar o gerenciador offline
function initOfflineManager() {
    // Abrir ou criar o banco de dados IndexedDB
    const request = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    
    request.onerror = function(event) {
        console.error('Erro ao abrir o banco de dados offline:', event.target.error);
    };
    
    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        
        // Criar stores se não existirem
        if (!db.objectStoreNames.contains(STORE_SIGHTINGS)) {
            const sightingsStore = db.createObjectStore(STORE_SIGHTINGS, { keyPath: 'id', autoIncrement: true });
            sightingsStore.createIndex('status', 'status', { unique: false });
            sightingsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(STORE_COMMENTS)) {
            const commentsStore = db.createObjectStore(STORE_COMMENTS, { keyPath: 'id', autoIncrement: true });
            commentsStore.createIndex('sightingId', 'sightingId', { unique: false });
            commentsStore.createIndex('status', 'status', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(STORE_RATINGS)) {
            const ratingsStore = db.createObjectStore(STORE_RATINGS, { keyPath: 'id', autoIncrement: true });
            ratingsStore.createIndex('sightingId', 'sightingId', { unique: false });
            ratingsStore.createIndex('status', 'status', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(STORE_USER_DATA)) {
            db.createObjectStore(STORE_USER_DATA, { keyPath: 'id' });
        }
        
        console.log('Banco de dados offline criado/atualizado com sucesso');
    };
    
    request.onsuccess = function(event) {
        const db = event.target.result;
        console.log('Banco de dados offline aberto com sucesso');
        
        // Verificar se há dados pendentes para sincronização
        checkPendingData(db);
    };
}

// Verificar se há dados pendentes para sincronização
function checkPendingData(db) {
    const transaction = db.transaction([STORE_SIGHTINGS, STORE_COMMENTS, STORE_RATINGS], 'readonly');
    
    // Verificar avistamentos pendentes
    const sightingsStore = transaction.objectStore(STORE_SIGHTINGS);
    const sightingsIndex = sightingsStore.index('status');
    const sightingsRequest = sightingsIndex.getAll('pending');
    
    sightingsRequest.onsuccess = function() {
        if (sightingsRequest.result.length > 0) {
            syncPending = true;
            updateSyncUI();
        }
    };
    
    // Verificar comentários pendentes
    const commentsStore = transaction.objectStore(STORE_COMMENTS);
    const commentsIndex = commentsStore.index('status');
    const commentsRequest = commentsIndex.getAll('pending');
    
    commentsRequest.onsuccess = function() {
        if (commentsRequest.result.length > 0) {
            syncPending = true;
            updateSyncUI();
        }
    };
    
    // Verificar avaliações pendentes
    const ratingsStore = transaction.objectStore(STORE_RATINGS);
    const ratingsIndex = ratingsStore.index('status');
    const ratingsRequest = ratingsIndex.getAll('pending');
    
    ratingsRequest.onsuccess = function() {
        if (ratingsRequest.result.length > 0) {
            syncPending = true;
            updateSyncUI();
        }
    };
    
    transaction.oncomplete = function() {
        if (syncPending && navigator.onLine) {
            // Se estiver online e houver dados pendentes, tentar sincronizar
            syncData();
        }
    };
}

// Salvar avistamento offline
function saveSightingOffline(sightingData) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        
        request.onerror = function(event) {
            console.error('Erro ao abrir o banco de dados:', event.target.error);
            reject(event.target.error);
        };
        
        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction([STORE_SIGHTINGS], 'readwrite');
            const store = transaction.objectStore(STORE_SIGHTINGS);
            
            // Adicionar status e timestamp
            sightingData.status = 'pending';
            sightingData.timestamp = new Date().toISOString();
            
            const addRequest = store.add(sightingData);
            
            addRequest.onsuccess = function() {
                console.log('Avistamento salvo offline com sucesso');
                syncPending = true;
                updateSyncUI();
                resolve(addRequest.result);
            };
            
            addRequest.onerror = function(event) {
                console.error('Erro ao salvar avistamento offline:', event.target.error);
                reject(event.target.error);
            };
            
            transaction.oncomplete = function() {
                db.close();
            };
        };
    });
}

// Salvar comentário offline
function saveCommentOffline(commentData) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        
        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction([STORE_COMMENTS], 'readwrite');
            const store = transaction.objectStore(STORE_COMMENTS);
            
            // Adicionar status e timestamp
            commentData.status = 'pending';
            commentData.timestamp = new Date().toISOString();
            
            const addRequest = store.add(commentData);
            
            addRequest.onsuccess = function() {
                console.log('Comentário salvo offline com sucesso');
                syncPending = true;
                updateSyncUI();
                resolve(addRequest.result);
            };
            
            addRequest.onerror = function(event) {
                console.error('Erro ao salvar comentário offline:', event.target.error);
                reject(event.target.error);
            };
            
            transaction.oncomplete = function() {
                db.close();
            };
        };
        
        request.onerror = function(event) {
            console.error('Erro ao abrir o banco de dados:', event.target.error);
            reject(event.target.error);
        };
    });
}

// Salvar avaliação offline
function saveRatingOffline(ratingData) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        
        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction([STORE_RATINGS], 'readwrite');
            const store = transaction.objectStore(STORE_RATINGS);
            
            // Adicionar status e timestamp
            ratingData.status = 'pending';
            ratingData.timestamp = new Date().toISOString();
            
            const addRequest = store.add(ratingData);
            
            addRequest.onsuccess = function() {
                console.log('Avaliação salva offline com sucesso');
                syncPending = true;
                updateSyncUI();
                resolve(addRequest.result);
            };
            
            addRequest.onerror = function(event) {
                console.error('Erro ao salvar avaliação offline:', event.target.error);
                reject(event.target.error);
            };
            
            transaction.oncomplete = function() {
                db.close();
            };
        };
        
        request.onerror = function(event) {
            console.error('Erro ao abrir o banco de dados:', event.target.error);
            reject(event.target.error);
        };
    });
}

// Salvar dados do usuário offline
function saveUserDataOffline(userData) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        
        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction([STORE_USER_DATA], 'readwrite');
            const store = transaction.objectStore(STORE_USER_DATA);
            
            // Usar 'currentUser' como ID fixo para os dados do usuário atual
            userData.id = 'currentUser';
            userData.lastUpdated = new Date().toISOString();
            
            const putRequest = store.put(userData);
            
            putRequest.onsuccess = function() {
                console.log('Dados do usuário salvos offline com sucesso');
                resolve(putRequest.result);
            };
            
            putRequest.onerror = function(event) {
                console.error('Erro ao salvar dados do usuário offline:', event.target.error);
                reject(event.target.error);
            };
            
            transaction.oncomplete = function() {
                db.close();
            };
        };
        
        request.onerror = function(event) {
            console.error('Erro ao abrir o banco de dados:', event.target.error);
            reject(event.target.error);
        };
    });
}

// Obter dados do usuário offline
function getUserDataOffline() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        
        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction([STORE_USER_DATA], 'readonly');
            const store = transaction.objectStore(STORE_USER_DATA);
            
            const getRequest = store.get('currentUser');
            
            getRequest.onsuccess = function() {
                if (getRequest.result) {
                    console.log('Dados do usuário recuperados offline com sucesso');
                    resolve(getRequest.result);
                } else {
                    console.log('Nenhum dado de usuário encontrado offline');
                    resolve(null);
                }
            };
            
            getRequest.onerror = function(event) {
                console.error('Erro ao recuperar dados do usuário offline:', event.target.error);
                reject(event.target.error);
            };
            
            transaction.oncomplete = function() {
                db.close();
            };
        };
        
        request.onerror = function(event) {
            console.error('Erro ao abrir o banco de dados:', event.target.error);
            reject(event.target.error);
        };
    });
}

// Obter avistamentos offline
function getSightingsOffline() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        
        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction([STORE_SIGHTINGS], 'readonly');
            const store = transaction.objectStore(STORE_SIGHTINGS);
            
            const getAllRequest = store.getAll();
            
            getAllRequest.onsuccess = function() {
                console.log('Avistamentos recuperados offline com sucesso');
                resolve(getAllRequest.result);
            };
            
            getAllRequest.onerror = function(event) {
                console.error('Erro ao recuperar avistamentos offline:', event.target.error);
                reject(event.target.error);
            };
            
            transaction.oncomplete = function() {
                db.close();
            };
        };
        
        request.onerror = function(event) {
            console.error('Erro ao abrir o banco de dados:', event.target.error);
            reject(event.target.error);
        };
    });
}

// Sincronizar dados quando online
function syncData() {
    if (!navigator.onLine) {
        console.log('Não é possível sincronizar: offline');
        return Promise.reject(new Error('Offline'));
    }
    
    return new Promise((resolve, reject) => {
        console.log('Iniciando sincronização de dados...');
        
        // Registrar sincronização com o Service Worker se disponível
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            navigator.serviceWorker.ready
                .then(registration => {
                    registration.sync.register('sync-sightings')
                        .then(() => {
                            console.log('Sincronização de avistamentos registrada');
                            return registration.sync.register('sync-comments');
                        })
                        .then(() => {
                            console.log('Sincronização de comentários registrada');
                            return registration.sync.register('sync-ratings');
                        })
                        .then(() => {
                            console.log('Sincronização de avaliações registrada');
                            resolve();
                        })
                        .catch(error => {
                            console.error('Erro ao registrar sincronização:', error);
                            
                            // Tentar sincronização manual se o registro falhar
                            syncManually()
                                .then(resolve)
                                .catch(reject);
                        });
                })
                .catch(error => {
                    console.error('Erro ao acessar service worker:', error);
                    
                    // Tentar sincronização manual se o service worker não estiver disponível
                    syncManually()
                        .then(resolve)
                        .catch(reject);
                });
        } else {
            // Fallback para navegadores sem suporte a Background Sync
            syncManually()
                .then(resolve)
                .catch(reject);
        }
    });
}

// Sincronização manual (fallback)
function syncManually() {
    console.log('Realizando sincronização manual...');
    
    return Promise.all([
        syncSightingsManually(),
        syncCommentsManually(),
        syncRatingsManually()
    ])
    .then(() => {
        console.log('Sincronização manual concluída com sucesso');
        syncPending = false;
        updateSyncUI();
    })
    .catch(error => {
        console.error('Erro na sincronização manual:', error);
        throw error;
    });
}

// Sincronizar avistamentos manualmente
function syncSightingsManually() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        
        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction([STORE_SIGHTINGS], 'readwrite');
            const store = transaction.objectStore(STORE_SIGHTINGS);
            const index = store.index('status');
            const pendingRequest = index.getAll('pending');
            
            pendingRequest.onsuccess = function() {
                const pendingSightings = pendingRequest.result;
                
                if (pendingSightings.length === 0) {
                    console.log('Nenhum avistamento pendente para sincronizar');
                    resolve();
                    return;
                }
                
                console.log(`Sincronizando ${pendingSightings.length} avistamentos...`);
                
                // Aqui seria implementada a lógica para enviar os dados para o Firebase
                // Este é um exemplo simplificado
                const syncPromises = pendingSightings.map(sighting => {
                    // Simular envio para o Firebase
                    return new Promise((resolveSync, rejectSync) => {
                        // Em uma implementação real, aqui seria feita uma chamada para o Firebase
                        setTimeout(() => {
                            console.log(`Avistamento ${sighting.id} sincronizado`);
                            
                            // Atualizar status no IndexedDB
                            const updateTransaction = db.transaction([STORE_SIGHTINGS], 'readwrite');
                            const updateStore = updateTransaction.objectStore(STORE_SIGHTINGS);
                            
                            sighting.status = 'synced';
                            const updateRequest = updateStore.put(sighting);
                            
                            updateRequest.onsuccess = function() {
                                resolveSync();
                            };
                            
                            updateRequest.onerror = function(event) {
                                console.error('Erro ao atualizar status do avistamento:', event.target.error);
                                rejectSync(event.target.error);
                            };
                        }, 500); // Simulação de delay de rede
                    });
                });
                
                Promise.all(syncPromises)
                    .then(() => {
                        console.log('Todos os avistamentos foram sincronizados');
                        resolve();
                    })
                    .catch(error => {
                        console.error('Erro ao sincronizar avistamentos:', error);
                        reject(error);
                    });
            };
            
            pendingRequest.onerror = function(event) {
                console.error('Erro ao obter avistamentos pendentes:', event.target.error);
                reject(event.target.error);
            };
            
            transaction.oncomplete = function() {
                db.close();
            };
        };
        
        request.onerror = function(event) {
            console.error('Erro ao abrir o banco de dados:', event.target.error);
            reject(event.target.error);
        };
    });
}

// Sincronizar comentários manualmente (lógica similar à sincronização de avistamentos)
function syncCommentsManually() {
    // Implementação similar à syncSightingsManually
    return Promise.resolve(); // Simplificado para este exemplo
}

// Sincronizar avaliações manualmente (lógica similar à sincronização de avistamentos)
function syncRatingsManually() {
    // Implementação similar à syncSightingsManually
    return Promise.resolve(); // Simplificado para este exemplo
}

// Atualizar interface de sincronização
function updateSyncUI() {
    const syncStatusElement = document.getElementById('sync-status');
    if (!syncStatusElement) return;
    
    if (syncPending) {
        syncStatusElement.innerHTML = `
            <p class="sync-pending">
                <strong>Status de sincronização:</strong> Você tem dados pendentes que serão sincronizados automaticamente quando sua conexão for restabelecida.
            </p>
        `;
    } else {
        syncStatusElement.innerHTML = `
            <p class="sync-complete">
                <strong>Status de sincronização:</strong> Todos os dados estão sincronizados.
            </p>
        `;
    }
}

// Lidar com status online
function handleOnlineStatus() {
    console.log('Conexão restabelecida');
    updateOnlineStatus();
    
    // Tentar sincronizar dados pendentes
    if (syncPending) {
        syncData()
            .then(() => {
                console.log('Dados sincronizados com sucesso após reconexão');
                
                // Notificar o usuário
                if (Notification.permission === 'granted') {
                    new Notification('UFO Sightings', {
                        body: 'Conexão restabelecida. Seus dados foram sincronizados com sucesso!',
                        icon: '/images/offline-icon.svg'
                    });
                }
            })
            .catch(error => {
                console.error('Erro ao sincronizar após reconexão:', error);
            });
    }
}

// Lidar com status offline
function handleOfflineStatus() {
    console.log('Conexão perdida');
    updateOnlineStatus();
    
    // Notificar o usuário
    if (Notification.permission === 'granted') {
        new Notification('UFO Sightings', {
            body: 'Você está offline. Algumas funcionalidades podem estar limitadas.',
            icon: '/images/offline-icon.svg'
        });
    }
}

// Atualizar indicador de status online/offline
function updateOnlineStatus() {
    const offlineIndicator = document.getElementById('offline-indicator');
    
    if (offlineIndicator) {
        if (navigator.onLine) {
            offlineIndicator.style.display = 'none';
        } else {
            offlineIndicator.style.display = 'block';
        }
    }
}

// Registrar o Service Worker
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registrado com sucesso:', registration.scope);
            })
            .catch(error => {
                console.error('Erro ao registrar Service Worker:', error);
            });
    }
}

// Solicitar permissão para notificações
function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission()
            .then(permission => {
                if (permission === 'granted') {
                    console.log('Permissão para notificações concedida');
                }
            });
    }
}

// Exportar funções para uso em outros arquivos
window.offlineManager = {
    saveSightingOffline,
    saveCommentOffline,
    saveRatingOffline,
    saveUserDataOffline,
    getUserDataOffline,
    getSightingsOffline,
    syncData,
    checkOnlineStatus: function() {
        return navigator.onLine;
    },
    hasPendingSync: function() {
        return syncPending;
    }
};

// Solicitar permissão para notificações quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    requestNotificationPermission();
});
