// Gerenciamento de autenticação
document.addEventListener('DOMContentLoaded', function() {
  // Elementos de navegação
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const profileBtn = document.getElementById('profileBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  // Verificar estado de autenticação
  auth.onAuthStateChanged(user => {
    if (user) {
      // Usuário está logado
      console.log('Usuário logado:', user.email);
      
      // Atualizar navegação
      if (loginBtn) loginBtn.style.display = 'none';
      if (registerBtn) registerBtn.style.display = 'none';
      if (profileBtn) profileBtn.style.display = 'block';
      if (logoutBtn) logoutBtn.style.display = 'block';
      
      // Verificar elementos específicos de página
      const authRequired = document.getElementById('auth-required');
      if (authRequired) authRequired.style.display = 'none';
      
      const addSightingForm = document.getElementById('add-sighting-form-container');
      if (addSightingForm) addSightingForm.style.display = 'block';
      
      const profileContainer = document.getElementById('profile-container');
      if (profileContainer) profileContainer.style.display = 'block';
      
      const ratingForm = document.getElementById('rating-form');
      if (ratingForm) ratingForm.style.display = 'block';
      
      const ratingAuthRequired = document.getElementById('rating-auth-required');
      if (ratingAuthRequired) ratingAuthRequired.style.display = 'none';
      
      const commentForm = document.getElementById('comment-form');
      if (commentForm) commentForm.style.display = 'block';
      
      const commentsAuthRequired = document.getElementById('comments-auth-required');
      if (commentsAuthRequired) commentsAuthRequired.style.display = 'none';
    } else {
      // Usuário não está logado
      console.log('Nenhum usuário logado');
      
      // Atualizar navegação
      if (loginBtn) loginBtn.style.display = 'block';
      if (registerBtn) registerBtn.style.display = 'block';
      if (profileBtn) profileBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'none';
      
      // Verificar elementos específicos de página
      const authRequired = document.getElementById('auth-required');
      if (authRequired) authRequired.style.display = 'block';
      
      const addSightingForm = document.getElementById('add-sighting-form-container');
      if (addSightingForm) addSightingForm.style.display = 'none';
      
      const profileContainer = document.getElementById('profile-container');
      if (profileContainer) profileContainer.style.display = 'none';
      
      const ratingForm = document.getElementById('rating-form');
      if (ratingForm) ratingForm.style.display = 'none';
      
      const ratingAuthRequired = document.getElementById('rating-auth-required');
      if (ratingAuthRequired) ratingAuthRequired.style.display = 'block';
      
      const commentForm = document.getElementById('comment-form');
      if (commentForm) commentForm.style.display = 'none';
      
      const commentsAuthRequired = document.getElementById('comments-auth-required');
      if (commentsAuthRequired) commentsAuthRequired.style.display = 'block';
    }
  });

  // Processar formulário de login
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const errorElement = document.getElementById('login-error');
      
      // Limpar mensagens de erro anteriores
      errorElement.style.display = 'none';
      errorElement.textContent = '';
      
      // Fazer login com Firebase
      auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
          // Login bem-sucedido
          console.log('Login bem-sucedido');
          window.location.href = 'index.html';
        })
        .catch(error => {
          // Erro no login
          console.error('Erro no login:', error);
          errorElement.textContent = traduzirErroFirebase(error.code);
          errorElement.style.display = 'block';
        });
    });
  }

  // Processar formulário de registro
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      const errorElement = document.getElementById('register-error');
      
      // Limpar mensagens de erro anteriores
      errorElement.style.display = 'none';
      errorElement.textContent = '';
      
      // Verificar se as senhas coincidem
      if (password !== confirmPassword) {
        errorElement.textContent = 'As senhas não coincidem';
        errorElement.style.display = 'block';
        return;
      }
      
      // Criar usuário com Firebase
      auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
          // Registro bem-sucedido
          console.log('Registro bem-sucedido');
          
          // Adicionar informações do usuário ao Firestore
          return db.collection('users').doc(userCredential.user.uid).set({
            name: name,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            sightingsCount: 0,
            commentsCount: 0,
            ratingsCount: 0
          });
        })
        .then(() => {
          // Atualizar o perfil do usuário
          return auth.currentUser.updateProfile({
            displayName: name
          });
        })
        .then(() => {
          window.location.href = 'index.html';
        })
        .catch(error => {
          // Erro no registro
          console.error('Erro no registro:', error);
          errorElement.textContent = traduzirErroFirebase(error.code);
          errorElement.style.display = 'block';
        });
    });
  }

  // Processar logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      auth.signOut()
        .then(() => {
          console.log('Logout bem-sucedido');
          window.location.href = 'index.html';
        })
        .catch(error => {
          console.error('Erro no logout:', error);
        });
    });
  }

  // Processar recuperação de senha
  const forgotPasswordLink = document.getElementById('forgot-password');
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const errorElement = document.getElementById('login-error');
      
      if (!email) {
        errorElement.textContent = 'Por favor, insira seu email para recuperar a senha';
        errorElement.style.display = 'block';
        return;
      }
      
      auth.sendPasswordResetEmail(email)
        .then(() => {
          alert('Email de recuperação de senha enviado. Verifique sua caixa de entrada.');
        })
        .catch(error => {
          console.error('Erro ao enviar email de recuperação:', error);
          errorElement.textContent = traduzirErroFirebase(error.code);
          errorElement.style.display = 'block';
        });
    });
  }
});

// Função para traduzir códigos de erro do Firebase
function traduzirErroFirebase(errorCode) {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Email inválido.';
    case 'auth/user-disabled':
      return 'Esta conta foi desativada.';
    case 'auth/user-not-found':
      return 'Usuário não encontrado.';
    case 'auth/wrong-password':
      return 'Senha incorreta.';
    case 'auth/email-already-in-use':
      return 'Este email já está sendo usado por outra conta.';
    case 'auth/weak-password':
      return 'A senha é muito fraca. Use pelo menos 6 caracteres.';
    case 'auth/operation-not-allowed':
      return 'Operação não permitida.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde.';
    default:
      return 'Ocorreu um erro. Tente novamente.';
  }
}
