// IMPORTANTE: Substitua as configurações abaixo com as configurações reais do seu projeto Firebase
// Para obter as configurações:
// 1. Acesse https://console.firebase.google.com
// 2. Selecione seu projeto
// 3. Clique no ícone de engrenagem (⚙️) ao lado de "Project Overview"
// 4. Selecione "Project settings"
// 5. Role até a seção "Your apps"
// 6. Se você ainda não adicionou um app web, clique no ícone </> para adicionar
// 7. Copie as configurações fornecidas e substitua os valores abaixo

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAcit6XBQQL0M2xYRYaYTZ8WgggY0NmJTk",
  authDomain: "ufo-sightings-app.firebaseapp.com",
  projectId: "ufo-sightings-app",
  storageBucket: "ufo-sightings-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referências para serviços do Firebase
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Configurar persistência para funcionamento offline
db.enablePersistence()
  .catch(err => {
    if (err.code === 'failed-precondition') {
      console.log('Persistência falhou: múltiplas abas abertas');
    } else if (err.code === 'unimplemented') {
      console.log('O navegador não suporta persistência offline');
    }
  });

console.log('Firebase inicializado com sucesso');
