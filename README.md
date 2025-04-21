# UFO Sightings - Documentação

## Visão Geral

UFO Sightings é um site completo para relatar, visualizar e avaliar avistamentos de OVNIs. O site inclui um mapa interativo, sistema de autenticação, publicação de avistamentos, sistema de avaliação, filtros e muito mais.

## Estrutura do Projeto

```
ufo-sightings-simple/
├── css/
│   └── styles.css
├── js/
│   ├── add-sighting.js
│   ├── auth.js
│   ├── auth-protection.js
│   ├── firebase-config.js
│   ├── main.js
│   ├── map.js
│   ├── profile.js
│   ├── sighting-details.js
│   └── sightings.js
├── images/
├── index.html
├── login.html
├── register.html
├── sightings.html
├── add-sighting.html
├── profile.html
├── sighting-details.html
├── instructions.html
└── test.sh
```

## Tecnologias Utilizadas

- **Frontend**: HTML, CSS e JavaScript puro
- **Mapa Interativo**: Leaflet.js com OpenStreetMap
- **Backend**: Firebase (Firestore, Authentication, Storage)

## Funcionalidades

### Página Inicial
- Exibição de avistamentos recentes
- Mapa interativo global com marcadores de avistamentos

### Sistema de Autenticação
- Registro de usuários
- Login e logout
- Recuperação de senha
- Proteção de rotas

### Avistamentos
- Visualização de todos os avistamentos
- Filtros por data, categoria e localização
- Mapa interativo com marcadores
- Paginação de resultados

### Adicionar Avistamento
- Formulário completo para adicionar novos avistamentos
- Upload de imagens
- Seleção de localização no mapa
- Geocodificação reversa para obter nome do local

### Detalhes do Avistamento
- Informações completas sobre o avistamento
- Mapa com localização exata
- Galeria de imagens
- Sistema de avaliação
- Comentários

### Perfil do Usuário
- Informações do usuário
- Estatísticas de atividade
- Lista de avistamentos do usuário
- Atualização de perfil
- Alteração de senha

## Instalação

1. Extraia todos os arquivos do arquivo zip para uma pasta em seu computador
2. Para uso local, você pode abrir os arquivos HTML diretamente no navegador
3. Para desenvolvimento ou uso em rede, coloque os arquivos em um servidor web

## Configuração do Firebase

Para que o site funcione corretamente, você precisa configurar seu próprio projeto Firebase:

1. Acesse [console.firebase.google.com](https://console.firebase.google.com) e crie uma nova conta ou faça login
2. Crie um novo projeto
3. No console do Firebase, adicione um aplicativo web ao seu projeto
4. Copie as configurações do Firebase fornecidas
5. Abra o arquivo `js/firebase-config.js` e substitua a configuração existente pela sua
6. No console do Firebase, ative os serviços:
   - Authentication (Email/Senha)
   - Firestore Database
   - Storage
7. Configure as regras de segurança para Firestore e Storage conforme necessário

## Regras de Segurança Recomendadas

### Firestore

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura pública de avistamentos
    match /sightings/{sightingId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                            (request.auth.uid == resource.data.userId || 
                             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true);
    }
    
    // Permitir leitura pública de comentários
    match /comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                            (request.auth.uid == resource.data.userId || 
                             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true);
    }
    
    // Permitir leitura pública de avaliações
    match /ratings/{ratingId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Proteger dados de usuários
    match /users/{userId} {
      allow read: if true;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && 
                    (request.auth.uid == userId || 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true);
    }
  }
}
```

### Storage

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir acesso público a imagens de avistamentos
    match /sightings/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && 
                    (request.auth.uid == userId || 
                     firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.isAdmin == true);
    }
    
    // Proteger imagens de perfil
    match /profiles/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Personalização

Você pode personalizar o site editando os seguintes arquivos:

- `css/styles.css` - Aparência e estilo do site
- `images/` - Imagens e ícones
- Arquivos HTML - Estrutura das páginas
- Arquivos JavaScript - Funcionalidades e lógica

## Testes

O script `test.sh` verifica a estrutura básica do site, incluindo:

- Existência de todos os arquivos necessários
- Sintaxe dos arquivos JavaScript
- Links internos nos arquivos HTML
- Referências a scripts e estilos

Para executar o script de teste:

```bash
chmod +x test.sh
./test.sh
```

## Limitações Conhecidas

- O site não inclui um painel administrativo completo
- A funcionalidade offline é limitada
- Não há suporte para login com redes sociais
- A responsividade pode variar em dispositivos muito pequenos

## Suporte

Para dúvidas ou problemas, consulte a documentação do Firebase ou entre em contato com o desenvolvedor.

## Licença

Este projeto é fornecido como está, sem garantias expressas ou implícitas.
