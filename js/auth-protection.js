// Arquivo de verificação de autenticação para proteção de rotas
// Este arquivo complementa o auth.js com funções específicas para proteção de rotas

// Verificar se o usuário está autenticado e redirecionar se necessário
function checkAuth(requiredAuth = true, redirectUrl = null) {
  return new Promise((resolve, reject) => {
    auth.onAuthStateChanged(user => {
      if (requiredAuth && !user) {
        // Autenticação necessária, mas usuário não está logado
        if (redirectUrl) {
          window.location.href = redirectUrl;
        }
        reject('Usuário não autenticado');
      } else if (!requiredAuth && user) {
        // Autenticação não necessária, mas usuário está logado
        if (redirectUrl) {
          window.location.href = redirectUrl;
        }
        reject('Usuário já autenticado');
      } else {
        // Estado de autenticação corresponde ao requisito
        resolve(user);
      }
    });
  });
}

// Verificar se o usuário é administrador
function checkAdmin() {
  return new Promise((resolve, reject) => {
    auth.onAuthStateChanged(user => {
      if (!user) {
        reject('Usuário não autenticado');
        return;
      }
      
      db.collection('users').doc(user.uid).get()
        .then(doc => {
          if (doc.exists && doc.data().isAdmin) {
            resolve(user);
          } else {
            reject('Usuário não é administrador');
          }
        })
        .catch(error => {
          console.error('Erro ao verificar permissões de administrador:', error);
          reject('Erro ao verificar permissões');
        });
    });
  });
}

// Proteger páginas que requerem autenticação
document.addEventListener('DOMContentLoaded', function() {
  // Páginas que requerem autenticação
  const authRequiredPages = [
    'add-sighting.html',
    'profile.html'
  ];
  
  // Páginas que requerem usuário não autenticado
  const noAuthPages = [
    'login.html',
    'register.html'
  ];
  
  // Páginas que requerem permissões de administrador
  const adminPages = [
    'admin.html',
    'admin-dashboard.html',
    'admin-users.html',
    'admin-sightings.html'
  ];
  
  // Obter nome da página atual
  const currentPage = window.location.pathname.split('/').pop();
  
  // Verificar se a página atual requer autenticação
  if (authRequiredPages.includes(currentPage)) {
    checkAuth(true, 'login.html')
      .catch(error => {
        console.log(error);
        // Redirecionamento já é feito pela função checkAuth
      });
  }
  
  // Verificar se a página atual requer usuário não autenticado
  if (noAuthPages.includes(currentPage)) {
    checkAuth(false, 'index.html')
      .catch(error => {
        console.log(error);
        // Redirecionamento já é feito pela função checkAuth
      });
  }
  
  // Verificar se a página atual requer permissões de administrador
  if (adminPages.includes(currentPage)) {
    checkAdmin()
      .catch(error => {
        console.log(error);
        window.location.href = 'index.html';
      });
  }
});

// Função para verificar se o usuário pode editar um avistamento
function canEditSighting(sightingId) {
  return new Promise((resolve, reject) => {
    if (!auth.currentUser) {
      reject('Usuário não autenticado');
      return;
    }
    
    // Verificar se o usuário é o autor do avistamento ou um administrador
    db.collection('sightings').doc(sightingId).get()
      .then(doc => {
        if (!doc.exists) {
          reject('Avistamento não encontrado');
          return;
        }
        
        const sighting = doc.data();
        
        if (sighting.userId === auth.currentUser.uid) {
          // Usuário é o autor
          resolve(true);
          return;
        }
        
        // Verificar se o usuário é administrador
        return db.collection('users').doc(auth.currentUser.uid).get();
      })
      .then(userDoc => {
        if (userDoc && userDoc.exists && userDoc.data().isAdmin) {
          // Usuário é administrador
          resolve(true);
        } else {
          reject('Permissão negada');
        }
      })
      .catch(error => {
        console.error('Erro ao verificar permissões:', error);
        reject('Erro ao verificar permissões');
      });
  });
}

// Função para verificar se o usuário pode excluir um avistamento
function canDeleteSighting(sightingId) {
  // Mesma lógica que canEditSighting
  return canEditSighting(sightingId);
}

// Função para verificar se o usuário pode excluir um comentário
function canDeleteComment(commentId) {
  return new Promise((resolve, reject) => {
    if (!auth.currentUser) {
      reject('Usuário não autenticado');
      return;
    }
    
    // Verificar se o usuário é o autor do comentário ou um administrador
    db.collection('comments').doc(commentId).get()
      .then(doc => {
        if (!doc.exists) {
          reject('Comentário não encontrado');
          return;
        }
        
        const comment = doc.data();
        
        if (comment.userId === auth.currentUser.uid) {
          // Usuário é o autor
          resolve(true);
          return;
        }
        
        // Verificar se o usuário é administrador
        return db.collection('users').doc(auth.currentUser.uid).get();
      })
      .then(userDoc => {
        if (userDoc && userDoc.exists && userDoc.data().isAdmin) {
          // Usuário é administrador
          resolve(true);
        } else {
          reject('Permissão negada');
        }
      })
      .catch(error => {
        console.error('Erro ao verificar permissões:', error);
        reject('Erro ao verificar permissões');
      });
  });
}
