// Gerenciamento de login com redes sociais
// Este arquivo complementa o auth.js com funcionalidades de login social

document.addEventListener('DOMContentLoaded', function() {
  // Verificar se estamos nas páginas de login ou registro
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  
  if (loginForm || registerForm) {
    setupSocialLoginButtons();
  }
});

// Configurar botões de login social
function setupSocialLoginButtons() {
  const googleLoginBtn = document.getElementById('google-login');
  const facebookLoginBtn = document.getElementById('facebook-login');
  const twitterLoginBtn = document.getElementById('twitter-login');
  
  // Login com Google
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', function() {
      const provider = new firebase.auth.GoogleAuthProvider();
      loginWithProvider(provider, 'Google');
    });
  }
  
  // Login com Facebook
  if (facebookLoginBtn) {
    facebookLoginBtn.addEventListener('click', function() {
      const provider = new firebase.auth.FacebookAuthProvider();
      loginWithProvider(provider, 'Facebook');
    });
  }
  
  // Login com Twitter
  if (twitterLoginBtn) {
    twitterLoginBtn.addEventListener('click', function() {
      const provider = new firebase.auth.TwitterAuthProvider();
      loginWithProvider(provider, 'Twitter');
    });
  }
}

// Função genérica para login com provedor social
function loginWithProvider(provider, providerName) {
  // Mostrar indicador de carregamento
  showLoading(true);
  
  // Adicionar escopo para acesso a informações do perfil
  if (provider.addScope) {
    provider.addScope('profile');
    provider.addScope('email');
  }
  
  // Realizar login com popup
  auth.signInWithPopup(provider)
    .then(result => {
      // Login bem-sucedido
      console.log(`Login com ${providerName} bem-sucedido`);
      
      // Verificar se é um novo usuário
      const isNewUser = result.additionalUserInfo.isNewUser;
      
      if (isNewUser) {
        // Criar documento de usuário no Firestore
        return createUserDocument(result.user, providerName);
      }
      
      return Promise.resolve();
    })
    .then(() => {
      // Redirecionar para a página inicial
      window.location.href = 'index.html';
    })
    .catch(error => {
      console.error(`Erro no login com ${providerName}:`, error);
      
      // Mostrar mensagem de erro
      let errorMessage = 'Erro ao fazer login. Tente novamente.';
      
      if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'Uma conta já existe com o mesmo email, mas com credenciais diferentes.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'O popup de login foi fechado antes da conclusão.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'A solicitação de popup foi cancelada.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'O popup foi bloqueado pelo navegador. Verifique suas configurações.';
      }
      
      // Exibir mensagem de erro
      const errorElement = document.getElementById('login-error') || document.getElementById('register-error');
      if (errorElement) {
        errorElement.textContent = errorMessage;
        errorElement.style.display = 'block';
      } else {
        alert(errorMessage);
      }
      
      // Esconder indicador de carregamento
      showLoading(false);
    });
}

// Criar documento de usuário no Firestore
function createUserDocument(user, provider) {
  // Dados do usuário
  const userData = {
    name: user.displayName || '',
    email: user.email || '',
    profileImage: user.photoURL || '',
    provider: provider,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
    sightingsCount: 0,
    commentsCount: 0,
    ratingsCount: 0,
    isAdmin: false
  };
  
  // Salvar no Firestore
  return db.collection('users').doc(user.uid).set(userData)
    .then(() => {
      console.log('Documento de usuário criado com sucesso');
    })
    .catch(error => {
      console.error('Erro ao criar documento de usuário:', error);
    });
}

// Mostrar/esconder indicador de carregamento
function showLoading(show) {
  const loadingElement = document.getElementById('loading-indicator');
  if (loadingElement) {
    loadingElement.style.display = show ? 'block' : 'none';
  }
}

// Vincular contas
function linkAccounts(provider) {
  if (!auth.currentUser) {
    alert('Você precisa estar logado para vincular contas.');
    return;
  }
  
  auth.currentUser.linkWithPopup(provider)
    .then(result => {
      alert('Conta vinculada com sucesso!');
    })
    .catch(error => {
      console.error('Erro ao vincular conta:', error);
      
      let errorMessage = 'Erro ao vincular conta. Tente novamente.';
      
      if (error.code === 'auth/credential-already-in-use') {
        errorMessage = 'Esta conta já está vinculada a outro usuário.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'O email desta conta já está em uso por outro usuário.';
      }
      
      alert(errorMessage);
    });
}

// Desvincular provedor
function unlinkProvider(providerId) {
  if (!auth.currentUser) {
    alert('Você precisa estar logado para desvincular contas.');
    return;
  }
  
  // Verificar se o usuário tem mais de um provedor
  if (auth.currentUser.providerData.length <= 1) {
    alert('Você não pode remover seu único método de login.');
    return;
  }
  
  auth.currentUser.unlink(providerId)
    .then(() => {
      alert('Provedor desvinculado com sucesso!');
    })
    .catch(error => {
      console.error('Erro ao desvincular provedor:', error);
      alert('Erro ao desvincular provedor. Tente novamente.');
    });
}
