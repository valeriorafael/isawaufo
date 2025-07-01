// Gerenciamento da página de detalhes de avistamento

document.addEventListener('DOMContentLoaded', function() {
  // Verificar se estamos na página de detalhes
  const sightingDetails = document.getElementById('sighting-details');
  if (sightingDetails) {
    // Obter ID do avistamento da URL
    const urlParams = new URLSearchParams(window.location.search);
    const sightingId = urlParams.get('id');
    
    if (sightingId) {
      loadSightingDetails(sightingId);
    } else {
      // Mostrar erro se não houver ID
      document.getElementById('sighting-loading').style.display = 'none';
      document.getElementById('sighting-not-found').style.display = 'block';
    }
  }
});

// Carregar detalhes do avistamento
function loadSightingDetails(sightingId) {
  const loadingElement = document.getElementById('sighting-loading');
  const notFoundElement = document.getElementById('sighting-not-found');
  const detailsElement = document.getElementById('sighting-details');
  
  db.collection('sightings').doc(sightingId).get()
    .then(doc => {
      // Esconder elemento de carregamento
      loadingElement.style.display = 'none';
      
      if (!doc.exists) {
        // Mostrar mensagem de não encontrado
        notFoundElement.style.display = 'block';
        return;
      }
      
      // Obter dados do avistamento
      const sighting = {
        id: doc.id,
        ...doc.data()
      };
      
      // Preencher detalhes
      fillSightingDetails(sighting);
      
      // Mostrar elemento de detalhes
      detailsElement.style.display = 'block';
      
      // Carregar avaliações e comentários
      loadRatings(sightingId);
      loadComments(sightingId);
      
      // Configurar formulários de avaliação e comentário
      setupRatingForm(sightingId);
      setupCommentForm(sightingId);
    })
    .catch(error => {
      console.error('Erro ao carregar detalhes do avistamento:', error);
      loadingElement.style.display = 'none';
      notFoundElement.style.display = 'block';
    });
}

// Preencher detalhes do avistamento na página
function fillSightingDetails(sighting) {
  // Preencher título e metadados
  document.getElementById('sighting-title').textContent = sighting.title;
  document.getElementById('sighting-author').textContent = sighting.userName || 'Usuário anônimo';
  
  // Formatar data de criação
  const createdAt = sighting.createdAt && sighting.createdAt.toDate ? 
                   sighting.createdAt.toDate().toLocaleDateString('pt-BR') : 
                   new Date().toLocaleDateString('pt-BR');
  document.getElementById('sighting-date').textContent = createdAt;
  
  // Preencher descrição
  document.getElementById('sighting-description').textContent = sighting.description;
  
  // Preencher informações adicionais
  const sightingDate = sighting.date && sighting.date.toDate ? 
                      sighting.date.toDate() : 
                      new Date();
  document.getElementById('sighting-full-date').textContent = sightingDate.toLocaleDateString('pt-BR');
  document.getElementById('sighting-time').textContent = sightingDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  document.getElementById('sighting-duration').textContent = sighting.duration || 'Desconhecida';
  document.getElementById('sighting-category').textContent = getCategoryName(sighting.category);
  document.getElementById('sighting-location').textContent = sighting.locationName || 'Localização desconhecida';
  
  // Configurar mapa
  if (map && sighting.latitude && sighting.longitude) {
    // Centralizar mapa na localização do avistamento
    map.setView([sighting.latitude, sighting.longitude], 13);
    
    // Adicionar marcador
    L.marker([sighting.latitude, sighting.longitude])
      .addTo(map)
      .bindPopup(`<strong>${sighting.title}</strong><br>${sighting.locationName}`);
  }
  
  // Mostrar imagens
  const imagesContainer = document.getElementById('sighting-images');
  if (imagesContainer && sighting.images && sighting.images.length > 0) {
    imagesContainer.innerHTML = '';
    
    sighting.images.forEach(imageUrl => {
      const imageDiv = document.createElement('div');
      imageDiv.className = 'sighting-image';
      
      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = sighting.title;
      
      imageDiv.appendChild(img);
      imagesContainer.appendChild(imageDiv);
      
      // Adicionar evento de clique para abrir imagem em tamanho maior
      imageDiv.addEventListener('click', function() {
        window.open(imageUrl, '_blank');
      });
    });
  } else {
    // Esconder seção de imagens se não houver imagens
    const imagesSection = document.getElementById('sighting-images-container');
    if (imagesSection) {
      imagesSection.style.display = 'none';
    }
  }
  
  // Mostrar avaliação média
  if (sighting.averageRating) {
    updateAverageRating(sighting.averageRating, sighting.ratingsCount || 0);
  }
}

// Carregar avaliações
function loadRatings(sightingId) {
  // Já mostramos a avaliação média nos detalhes do avistamento
  // Esta função pode ser expandida para mostrar avaliações individuais
}

// Carregar comentários
function loadComments(sightingId) {
  const commentsContainer = document.getElementById('comments-list');
  const commentsCount = document.getElementById('comments-count');
  
  if (!commentsContainer) return;
  
  // Limpar comentários anteriores
  commentsContainer.innerHTML = '';
  
  db.collection('comments')
    .where('sightingId', '==', sightingId)
    .orderBy('createdAt', 'desc')
    .get()
    .then(snapshot => {
      // Atualizar contador de comentários
      commentsCount.textContent = snapshot.size;
      
      if (snapshot.empty) {
        commentsContainer.innerHTML = '<p>Nenhum comentário ainda. Seja o primeiro a comentar!</p>';
        return;
      }
      
      snapshot.forEach(doc => {
        const comment = {
          id: doc.id,
          ...doc.data()
        };
        
        const commentElement = createCommentElement(comment);
        commentsContainer.appendChild(commentElement);
      });
    })
    .catch(error => {
      console.error('Erro ao carregar comentários:', error);
      commentsContainer.innerHTML = '<p>Erro ao carregar comentários. Tente novamente mais tarde.</p>';
    });
}

// Configurar formulário de avaliação
function setupRatingForm(sightingId) {
  const ratingStars = document.querySelectorAll('.rating-stars .star');
  const submitRatingBtn = document.getElementById('submit-rating');
  
  if (!ratingStars.length || !submitRatingBtn) return;
  
  // Variável para armazenar a avaliação selecionada
  let selectedRating = 0;
  
  // Adicionar eventos aos estrelas
  ratingStars.forEach(star => {
    // Evento de hover
    star.addEventListener('mouseover', function() {
      const value = parseInt(this.getAttribute('data-value'));
      highlightStars(value);
    });
    
    // Evento de saída do hover
    star.addEventListener('mouseout', function() {
      highlightStars(selectedRating);
    });
    
    // Evento de clique
    star.addEventListener('click', function() {
      selectedRating = parseInt(this.getAttribute('data-value'));
      highlightStars(selectedRating);
    });
  });
  
  // Função para destacar estrelas
  function highlightStars(count) {
    ratingStars.forEach(star => {
      const value = parseInt(star.getAttribute('data-value'));
      if (value <= count) {
        star.classList.add('active');
      } else {
        star.classList.remove('active');
      }
    });
  }
  
  // Evento de envio de avaliação
  submitRatingBtn.addEventListener('click', function() {
    // Verificar se usuário está autenticado
    if (!auth.currentUser) {
      alert('Você precisa estar logado para avaliar.');
      return;
    }
    
    // Verificar se uma avaliação foi selecionada
    if (selectedRating === 0) {
      alert('Por favor, selecione uma avaliação.');
      return;
    }
    
    // Desabilitar botão para evitar múltiplos envios
    submitRatingBtn.disabled = true;
    
    // Verificar se o usuário já avaliou este avistamento
    db.collection('ratings')
      .where('userId', '==', auth.currentUser.uid)
      .where('sightingId', '==', sightingId)
      .get()
      .then(snapshot => {
        if (!snapshot.empty) {
          // Usuário já avaliou, atualizar avaliação existente
          const ratingDoc = snapshot.docs[0];
          return db.collection('ratings').doc(ratingDoc.id).update({
            rating: selectedRating,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        } else {
          // Usuário não avaliou ainda, criar nova avaliação
          return db.collection('ratings').add({
            sightingId: sightingId,
            userId: auth.currentUser.uid,
            userName: auth.currentUser.displayName || 'Usuário anônimo',
            rating: selectedRating,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
      })
      .then(() => {
        // Atualizar avaliação média do avistamento
        return updateSightingRating(sightingId);
      })
      .then(() => {
        alert('Avaliação enviada com sucesso!');
        submitRatingBtn.disabled = false;
      })
      .catch(error => {
        console.error('Erro ao enviar avaliação:', error);
        alert('Erro ao enviar avaliação. Tente novamente.');
        submitRatingBtn.disabled = false;
      });
  });
}

// Atualizar avaliação média do avistamento
function updateSightingRating(sightingId) {
  // Obter todas as avaliações deste avistamento
  return db.collection('ratings')
    .where('sightingId', '==', sightingId)
    .get()
    .then(snapshot => {
      if (snapshot.empty) return;
      
      // Calcular média
      let total = 0;
      snapshot.forEach(doc => {
        total += doc.data().rating;
      });
      
      const average = total / snapshot.size;
      const roundedAverage = Math.round(average * 10) / 10; // Arredondar para 1 casa decimal
      
      // Atualizar avistamento
      return db.collection('sightings').doc(sightingId).update({
        averageRating: roundedAverage,
        ratingsCount: snapshot.size
      }).then(() => {
        // Atualizar interface
        updateAverageRating(roundedAverage, snapshot.size);
      });
    });
}

// Atualizar exibição da avaliação média
function updateAverageRating(rating, count) {
  const starsElement = document.getElementById('average-rating');
  const ratingValueElement = document.getElementById('rating-value');
  const ratingsNumberElement = document.getElementById('ratings-number');
  
  if (starsElement) {
    // Criar string de estrelas
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars += '★'; // Estrela cheia
      } else if (i - 0.5 <= rating) {
        stars += '★½'; // Estrela e meia
      } else {
        stars += '☆'; // Estrela vazia
      }
    }
    
    starsElement.textContent = stars;
  }
  
  if (ratingValueElement) {
    ratingValueElement.textContent = rating.toFixed(1);
  }
  
  if (ratingsNumberElement) {
    ratingsNumberElement.textContent = count;
  }
}

// Configurar formulário de comentário
function setupCommentForm(sightingId) {
  const commentForm = document.getElementById('comment-form');
  const submitCommentBtn = document.getElementById('submit-comment');
  const commentText = document.getElementById('comment-text');
  
  if (!commentForm || !submitCommentBtn || !commentText) return;
  
  submitCommentBtn.addEventListener('click', function() {
    // Verificar se usuário está autenticado
    if (!auth.currentUser) {
      alert('Você precisa estar logado para comentar.');
      return;
    }
    
    // Verificar se o comentário não está vazio
    const text = commentText.value.trim();
    if (!text) {
      alert('Por favor, escreva um comentário.');
      return;
    }
    
    // Desabilitar botão para evitar múltiplos envios
    submitCommentBtn.disabled = true;
    
    // Adicionar comentário
    db.collection('comments').add({
      sightingId: sightingId,
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName || 'Usuário anônimo',
      text: text,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
      // Limpar campo de comentário
      commentText.value = '';
      
      // Recarregar comentários
      loadComments(sightingId);
      
      // Atualizar contador de comentários do usuário
      return db.collection('users').doc(auth.currentUser.uid).update({
        commentsCount: firebase.firestore.FieldValue.increment(1)
      });
    })
    .then(() => {
      submitCommentBtn.disabled = false;
    })
    .catch(error => {
      console.error('Erro ao adicionar comentário:', error);
      alert('Erro ao adicionar comentário. Tente novamente.');
      submitCommentBtn.disabled = false;
    });
  });
}

// Criar elemento de comentário
function createCommentElement(comment) {
  const commentElement = document.createElement('div');
  commentElement.className = 'comment';
  
  // Formatar data
  const date = comment.createdAt && comment.createdAt.toDate ? 
               comment.createdAt.toDate().toLocaleDateString('pt-BR') : 
               new Date().toLocaleDateString('pt-BR');
  
  commentElement.innerHTML = `
    <div class="comment-header">
      <strong>${comment.userName || 'Usuário anônimo'}</strong>
      <span>${date}</span>
    </div>
    <div class="comment-body">
      <p>${comment.text}</p>
    </div>
  `;
  
  return commentElement;
}

// Obter nome da categoria
function getCategoryName(categoryCode) {
  const categories = {
    'luz': 'Luzes no céu',
    'objeto': 'Objeto voador',
    'encontro': 'Encontro próximo',
    'abducao': 'Possível abdução',
    'outro': 'Outro'
  };
  
  return categories[categoryCode] || categoryCode;
}
