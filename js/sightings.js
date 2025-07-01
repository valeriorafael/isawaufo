// Gerenciamento de avistamentos na página principal e na página de listagem

document.addEventListener('DOMContentLoaded', function() {
  // Verificar se estamos na página inicial
  const recentSightingsContainer = document.getElementById('recent-sightings-container');
  if (recentSightingsContainer) {
    loadRecentSightings();
  }
  
  // Verificar se estamos na página de listagem de avistamentos
  const sightingsContainer = document.getElementById('sightings-container');
  if (sightingsContainer) {
    // Configurar filtros
    setupFilters();
    
    // Carregar avistamentos
    loadSightings();
  }
});

// Carregar avistamentos recentes para a página inicial
function loadRecentSightings() {
  const container = document.getElementById('recent-sightings-container');
  
  // Limpar esqueletos de carregamento
  container.innerHTML = '';
  
  db.collection('sightings')
    .orderBy('date', 'desc')
    .limit(3)
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        container.innerHTML = '<p>Nenhum avistamento encontrado.</p>';
        return;
      }
      
      snapshot.forEach(doc => {
        const sighting = {
          id: doc.id,
          ...doc.data()
        };
        
        container.appendChild(createSightingCard(sighting));
      });
    })
    .catch(error => {
      console.error('Erro ao carregar avistamentos recentes:', error);
      container.innerHTML = '<p>Erro ao carregar avistamentos. Tente novamente mais tarde.</p>';
    });
}

// Configurar filtros na página de listagem
function setupFilters() {
  const applyFiltersBtn = document.getElementById('apply-filters');
  const clearFiltersBtn = document.getElementById('clear-filters');
  
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', function() {
      loadSightings(true);
    });
  }
  
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', function() {
      // Limpar campos de filtro
      document.getElementById('date-filter').value = '';
      document.getElementById('category-filter').value = '';
      document.getElementById('location-filter').value = '';
      
      // Recarregar avistamentos sem filtros
      loadSightings();
    });
  }
}

// Carregar avistamentos para a página de listagem
function loadSightings(filtered = false) {
  const container = document.getElementById('sightings-container');
  const noResults = document.getElementById('no-results');
  const loadMoreContainer = document.getElementById('load-more-container');
  
  // Limpar esqueletos de carregamento
  container.innerHTML = '';
  
  // Esconder mensagem de "nenhum resultado"
  noResults.style.display = 'none';
  
  // Construir consulta
  let query = db.collection('sightings').orderBy('date', 'desc');
  
  // Aplicar filtros, se solicitado
  if (filtered) {
    const dateFilter = document.getElementById('date-filter').value;
    const categoryFilter = document.getElementById('category-filter').value;
    const locationFilter = document.getElementById('location-filter').value;
    
    if (dateFilter) {
      // Converter string de data para timestamp
      const startDate = new Date(dateFilter);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(dateFilter);
      endDate.setHours(23, 59, 59, 999);
      
      query = query.where('date', '>=', startDate).where('date', '<=', endDate);
    }
    
    if (categoryFilter) {
      query = query.where('category', '==', categoryFilter);
    }
    
    if (locationFilter) {
      // Busca por texto não é diretamente suportada pelo Firestore
      // Usamos uma abordagem simplificada com contains
      query = query.where('locationName', '>=', locationFilter)
                  .where('locationName', '<=', locationFilter + '\uf8ff');
    }
  }
  
  // Limitar resultados
  query = query.limit(12);
  
  // Executar consulta
  query.get()
    .then(snapshot => {
      if (snapshot.empty) {
        noResults.style.display = 'block';
        loadMoreContainer.style.display = 'none';
        return;
      }
      
      snapshot.forEach(doc => {
        const sighting = {
          id: doc.id,
          ...doc.data()
        };
        
        container.appendChild(createSightingCard(sighting));
      });
      
      // Armazenar o último documento para paginação
      lastDoc = snapshot.docs[snapshot.docs.length - 1];
      
      // Mostrar ou esconder botão "Carregar Mais"
      if (snapshot.docs.length < 12) {
        loadMoreContainer.style.display = 'none';
      } else {
        loadMoreContainer.style.display = 'block';
        
        // Configurar evento de "Carregar Mais"
        const loadMoreBtn = document.getElementById('load-more');
        if (loadMoreBtn) {
          loadMoreBtn.onclick = loadMoreSightings;
        }
      }
      
      // Atualizar marcadores no mapa
      updateMapMarkers(snapshot);
    })
    .catch(error => {
      console.error('Erro ao carregar avistamentos:', error);
      container.innerHTML = '<p>Erro ao carregar avistamentos. Tente novamente mais tarde.</p>';
    });
}

// Carregar mais avistamentos (paginação)
function loadMoreSightings() {
  if (!lastDoc) return;
  
  const container = document.getElementById('sightings-container');
  const loadMoreContainer = document.getElementById('load-more-container');
  
  // Construir consulta a partir do último documento
  let query = db.collection('sightings')
                .orderBy('date', 'desc')
                .startAfter(lastDoc)
                .limit(12);
  
  // Executar consulta
  query.get()
    .then(snapshot => {
      if (snapshot.empty) {
        loadMoreContainer.style.display = 'none';
        return;
      }
      
      snapshot.forEach(doc => {
        const sighting = {
          id: doc.id,
          ...doc.data()
        };
        
        container.appendChild(createSightingCard(sighting));
      });
      
      // Atualizar o último documento
      lastDoc = snapshot.docs[snapshot.docs.length - 1];
      
      // Esconder botão se não houver mais resultados
      if (snapshot.docs.length < 12) {
        loadMoreContainer.style.display = 'none';
      }
      
      // Atualizar marcadores no mapa
      updateMapMarkers(snapshot, true);
    })
    .catch(error => {
      console.error('Erro ao carregar mais avistamentos:', error);
    });
}

// Atualizar marcadores no mapa
function updateMapMarkers(snapshot, append = false) {
  // Verificar se estamos na página de listagem e se o mapa existe
  if (!map || !document.getElementById('map-sightings')) return;
  
  // Limpar marcadores existentes, se não estiver anexando
  if (!append) {
    clearMarkers();
  }
  
  // Adicionar novos marcadores
  snapshot.forEach(doc => {
    const sighting = {
      id: doc.id,
      ...doc.data()
    };
    
    addSightingMarker(sighting);
  });
}

// Criar card de avistamento
function createSightingCard(sighting) {
  const card = document.createElement('div');
  card.className = 'sighting-card';
  
  // Formatar data
  const date = sighting.date && sighting.date.toDate ? 
               sighting.date.toDate().toLocaleDateString('pt-BR') : 
               new Date().toLocaleDateString('pt-BR');
  
  // Determinar imagem
  let imageUrl = 'images/default-sighting.jpg';
  if (sighting.images && sighting.images.length > 0) {
    imageUrl = sighting.images[0];
  }
  
  // Criar estrelas para avaliação
  let stars = '';
  const rating = sighting.averageRating || 0;
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars += '★';
    } else {
      stars += '☆';
    }
  }
  
  // Construir HTML do card
  card.innerHTML = `
    <img src="${imageUrl}" alt="${sighting.title}">
    <div class="sighting-card-content">
      <h3>${sighting.title}</h3>
      <p>${sighting.locationName || 'Localização desconhecida'}</p>
      <p>Data: ${date}</p>
      <div class="rating">${stars} (${sighting.ratingsCount || 0})</div>
      <a href="sighting-details.html?id=${sighting.id}" class="details-link">Ver detalhes</a>
    </div>
  `;
  
  return card;
}

// Variável para armazenar o último documento (para paginação)
let lastDoc = null;
