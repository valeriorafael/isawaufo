// Arquivo principal para inicialização e funcionalidades gerais

document.addEventListener('DOMContentLoaded', function() {
  // Verificar se o Firebase foi inicializado corretamente
  if (typeof firebase !== 'undefined' && firebase.app()) {
    console.log('Firebase inicializado com sucesso');
  } else {
    console.error('Erro ao inicializar Firebase');
  }

  // Adicionar classes CSS para estilização de marcadores no mapa
  addMarkerStyles();
  
  // Verificar se há imagem de fundo para a seção hero
  setupHeroBackground();
});

// Adicionar estilos CSS para marcadores do mapa
function addMarkerStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .custom-marker {
      background: none;
      border: none;
    }
    .marker-pin {
      width: 30px;
      height: 30px;
      border-radius: 50% 50% 50% 0;
      background: #c30b82;
      position: absolute;
      transform: rotate(-45deg);
      left: 50%;
      top: 50%;
      margin: -15px 0 0 -15px;
    }
    .marker-pin::after {
      content: '';
      width: 24px;
      height: 24px;
      margin: 3px 0 0 3px;
      background: #fff;
      position: absolute;
      border-radius: 50%;
    }
    .marker-popup {
      text-align: center;
    }
    .popup-link {
      display: inline-block;
      margin-top: 8px;
      color: #3498db;
      text-decoration: none;
    }
    .popup-link:hover {
      text-decoration: underline;
    }
    .rating-stars .star {
      cursor: pointer;
      font-size: 24px;
      color: #ccc;
      transition: color 0.2s;
    }
    .rating-stars .star.active {
      color: #f39c12;
    }
    .rating-stars .star:hover {
      color: #f39c12;
    }
    .comment {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
    }
    .comment-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .comment-header span {
      color: #666;
      font-size: 0.9em;
    }
  `;
  document.head.appendChild(style);
}

// Configurar imagem de fundo para a seção hero
function setupHeroBackground() {
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    // Verificar se já tem background-image definido no CSS
    const computedStyle = window.getComputedStyle(heroSection);
    const backgroundImage = computedStyle.backgroundImage;
    
    // Se não tiver background-image ou for 'none', definir um padrão
    if (backgroundImage === 'none') {
      heroSection.style.backgroundImage = 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("images/ufo-bg.jpg")';
      heroSection.style.backgroundSize = 'cover';
      heroSection.style.backgroundPosition = 'center';
    }
  }
}

// Função utilitária para obter parâmetros da URL
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Função utilitária para formatar data
function formatDate(timestamp) {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('pt-BR');
}

// Função utilitária para formatar hora
function formatTime(timestamp) {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// Função utilitária para truncar texto
function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Função utilitária para validar email
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Função utilitária para validar senha
function isValidPassword(password) {
  return password && password.length >= 6;
}

// Função utilitária para validar coordenadas
function isValidCoordinate(coord) {
  return !isNaN(coord) && isFinite(coord);
}

// Função utilitária para obter nome da categoria
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
