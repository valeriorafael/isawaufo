// Implementação do mapa interativo com Leaflet.js

// Variáveis globais para o mapa
let map = null;
let markers = [];
let userMarker = null;

// Inicializar mapa na página inicial
document.addEventListener('DOMContentLoaded', function() {
  // Verificar se estamos na página inicial
  const mapElement = document.getElementById('map');
  if (mapElement) {
    initHomeMap();
  }
  
  // Verificar se estamos na página de avistamentos
  const mapSightingsElement = document.getElementById('map-sightings');
  if (mapSightingsElement) {
    initSightingsMap();
  }
  
  // Verificar se estamos na página de adicionar avistamento
  const mapAddSightingElement = document.getElementById('map-add-sighting');
  if (mapAddSightingElement) {
    initAddSightingMap();
  }
  
  // Verificar se estamos na página de detalhes
  const mapDetailsElement = document.getElementById('map-details');
  if (mapDetailsElement) {
    initDetailsMap();
  }
});

// Inicializar mapa na página inicial
function initHomeMap() {
  // Criar mapa centralizado no Brasil
  map = L.map('map').setView([-15.77972, -47.92972], 4);
  
  // Adicionar camada de mapa do OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  
  // Carregar avistamentos recentes
  loadRecentSightingsForMap();
}

// Inicializar mapa na página de avistamentos
function initSightingsMap() {
  // Criar mapa centralizado no Brasil
  map = L.map('map-sightings').setView([-15.77972, -47.92972], 4);
  
  // Adicionar camada de mapa do OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  
  // Os marcadores serão adicionados pela função loadSightings() em sightings.js
}

// Inicializar mapa na página de adicionar avistamento
function initAddSightingMap() {
  // Criar mapa centralizado no Brasil
  map = L.map('map-add-sighting').setView([-15.77972, -47.92972], 4);
  
  // Adicionar camada de mapa do OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  
  // Tentar obter localização do usuário
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function(position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Centralizar mapa na localização do usuário
        map.setView([lat, lng], 12);
        
        // Adicionar marcador na localização do usuário
        addUserMarker(lat, lng);
      },
      function(error) {
        console.error('Erro ao obter localização:', error);
      }
    );
  }
  
  // Adicionar evento de clique no mapa
  map.on('click', function(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    
    // Atualizar campos de latitude e longitude
    document.getElementById('latitude').value = lat;
    document.getElementById('longitude').value = lng;
    
    // Atualizar marcador
    addUserMarker(lat, lng);
    
    // Tentar obter nome do local através de geocodificação reversa
    reverseGeocode(lat, lng);
  });
}

// Inicializar mapa na página de detalhes
function initDetailsMap() {
  // Criar mapa (a posição será definida quando os detalhes do avistamento forem carregados)
  map = L.map('map-details').setView([0, 0], 2);
  
  // Adicionar camada de mapa do OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  
  // O marcador será adicionado pela função loadSightingDetails() em sighting-details.js
}

// Adicionar marcador na localização do usuário
function addUserMarker(lat, lng) {
  // Remover marcador anterior, se existir
  if (userMarker) {
    map.removeLayer(userMarker);
  }
  
  // Criar novo marcador
  userMarker = L.marker([lat, lng], {
    draggable: true,
    title: 'Local do avistamento'
  }).addTo(map);
  
  // Adicionar evento de arrasto
  userMarker.on('dragend', function(e) {
    const position = userMarker.getLatLng();
    
    // Atualizar campos de latitude e longitude
    document.getElementById('latitude').value = position.lat;
    document.getElementById('longitude').value = position.lng;
    
    // Tentar obter nome do local através de geocodificação reversa
    reverseGeocode(position.lat, position.lng);
  });
}

// Adicionar marcador para um avistamento
function addSightingMarker(sighting) {
  // Verificar se temos coordenadas válidas
  if (!sighting.latitude || !sighting.longitude) {
    return;
  }
  
  // Criar ícone personalizado
  const icon = L.divIcon({
    className: 'custom-marker',
    html: '<div class="marker-pin"></div>',
    iconSize: [30, 42],
    iconAnchor: [15, 42]
  });
  
  // Criar marcador
  const marker = L.marker([sighting.latitude, sighting.longitude], {
    icon: icon,
    title: sighting.title
  }).addTo(map);
  
  // Adicionar popup
  marker.bindPopup(`
    <div class="marker-popup">
      <h3>${sighting.title}</h3>
      <p><strong>Data:</strong> ${formatDate(sighting.date)}</p>
      <p><strong>Categoria:</strong> ${sighting.category}</p>
      <a href="sighting-details.html?id=${sighting.id}" class="popup-link">Ver detalhes</a>
    </div>
  `);
  
  // Armazenar marcador no array
  markers.push(marker);
  
  return marker;
}

// Limpar todos os marcadores
function clearMarkers() {
  markers.forEach(marker => {
    map.removeLayer(marker);
  });
  
  markers = [];
}

// Carregar avistamentos recentes para o mapa da página inicial
function loadRecentSightingsForMap() {
  db.collection('sightings')
    .orderBy('date', 'desc')
    .limit(10)
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const sighting = {
          id: doc.id,
          ...doc.data()
        };
        
        addSightingMarker(sighting);
      });
    })
    .catch(error => {
      console.error('Erro ao carregar avistamentos recentes:', error);
    });
}

// Geocodificação reversa para obter nome do local
function reverseGeocode(lat, lng) {
  // Usar a API de Geocodificação Reversa do OpenStreetMap (Nominatim)
  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
    .then(response => response.json())
    .then(data => {
      if (data && data.display_name) {
        document.getElementById('location-name').value = data.display_name;
      }
    })
    .catch(error => {
      console.error('Erro na geocodificação reversa:', error);
    });
}

// Formatar data
function formatDate(timestamp) {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('pt-BR');
}
