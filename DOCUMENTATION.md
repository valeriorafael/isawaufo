# UFO Sightings - Documentação do Projeto

## Visão Geral
UFO Sightings é uma plataforma web completa para relatar, visualizar e avaliar avistamentos de OVNIs. O site inclui um sistema de autenticação, publicação de avistamentos, mapa interativo, sistema de avaliação, filtros e painel administrativo.

## Funcionalidades Implementadas

### 1. Funcionalidade Offline
- **Service Worker**: Cache de recursos para funcionamento offline
- **Armazenamento Local**: Utiliza IndexedDB para armazenar dados localmente
- **Sincronização Automática**: Sincroniza dados quando a conexão é restabelecida
- **Página Offline**: Exibe uma página específica quando o usuário está sem conexão
- **Indicador de Status**: Mostra visualmente quando o usuário está offline

### 2. Login com Redes Sociais
- **Provedores Suportados**: Google, Facebook e Twitter
- **Interface Responsiva**: Botões de login social adaptados para todos os tamanhos de tela
- **Gerenciamento de Contas**: Vinculação de contas de redes sociais à conta principal

### 3. Painel Administrativo Completo
- **Dashboard**: Estatísticas gerais e gráficos de atividade
- **Gerenciamento de Usuários**: Visualizar, editar, promover e suspender usuários
- **Gerenciamento de Avistamentos**: Aprovar, rejeitar e destacar avistamentos
- **Gerenciamento de Comentários**: Moderar, aprovar e rejeitar comentários
- **Sistema de Denúncias**: Revisar denúncias, remover conteúdo e advertir usuários
- **Configurações do Site**: Personalizar aparência, notificações e realizar backups

### 4. Responsividade Aprimorada
- **Media Queries**: Adaptação para todos os tamanhos de tela (768px, 576px, 320px)
- **Acessibilidade para Toque**: Áreas de toque maiores em dispositivos móveis
- **Modo Escuro**: Suporte para preferências de tema do usuário
- **Otimizações de Desempenho**: Melhorias para dispositivos de baixo poder

### 5. Suporte para PWA (Progressive Web App)
- **Manifest.json**: Permite instalação como aplicativo
- **Ícones e Recursos**: Recursos visuais para diferentes contextos
- **Funcionalidade Offline Integrada**: Experiência contínua mesmo sem conexão

## Estrutura de Arquivos

### Arquivos Principais
- `index.html`: Página inicial com mapa e avistamentos recentes
- `login.html` e `register.html`: Páginas de autenticação com login social
- `add-sighting.html`: Formulário para adicionar novos avistamentos
- `sightings.html`: Lista de avistamentos com filtros
- `sighting-details.html`: Detalhes de um avistamento específico
- `profile.html`: Perfil do usuário com estatísticas
- `offline.html`: Página exibida quando o usuário está offline
- `admin.html` e outras páginas admin-*: Painel administrativo completo

### Arquivos CSS
- `css/styles.css`: Estilos principais do site
- `css/responsive.css`: Media queries e melhorias de responsividade
- `css/social-login.css`: Estilos para botões de login social e modo escuro

### Arquivos JavaScript
- `js/firebase-config.js`: Configuração do Firebase
- `js/auth.js`: Autenticação tradicional (email/senha)
- `js/social-login.js`: Integração com login social
- `js/map.js`: Implementação do mapa interativo
- `js/offline-manager.js`: Gerenciamento de funcionalidade offline
- `js/admin.js`: Funcionalidades do painel administrativo
- Outros arquivos JS específicos para cada funcionalidade

### Recursos Adicionais
- `manifest.json`: Configuração para PWA
- `service-worker.js`: Service worker para funcionalidade offline
- `images/`: Diretório com recursos visuais

## Tecnologias Utilizadas
- **Frontend**: HTML5, CSS3, JavaScript
- **Mapa**: Leaflet.js com OpenStreetMap
- **Autenticação**: Firebase Authentication
- **Banco de Dados**: Firebase Firestore
- **Armazenamento**: Firebase Storage e IndexedDB (offline)
- **PWA**: Service Worker e Web App Manifest

## Instalação e Execução

### Requisitos
- Servidor web (Apache, Nginx, etc.) ou ambiente de desenvolvimento local
- Conta no Firebase (para autenticação e banco de dados)

### Configuração
1. Clone ou extraia os arquivos do projeto para seu servidor
2. Configure o Firebase:
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
   - Ative Authentication, Firestore e Storage
   - Copie as credenciais para `js/firebase-config.js`
3. Configure os provedores de login social no Firebase Console
4. Personalize o arquivo `manifest.json` conforme necessário

### Execução
- Acesse o site através do servidor web
- Para desenvolvimento local, você pode usar:
  - `python -m http.server 8000` (Python 3)
  - Live Server no VS Code
  - Qualquer outro servidor web local

## Melhorias Futuras
- Implementação de notificações push
- Tradução para múltiplos idiomas
- Análise avançada de dados de avistamentos
- Integração com APIs de clima e astronomia
- Aplicativo móvel nativo usando React Native ou Flutter

## Suporte e Contato
Para suporte ou dúvidas sobre o projeto, entre em contato através de:
- Email: contato@ufosightings.com
- GitHub: [github.com/ufosightings](https://github.com/ufosightings)

---

© 2025 UFO Sightings - Todos os direitos reservados
