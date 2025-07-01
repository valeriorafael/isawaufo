// Arquivo JavaScript para o painel administrativo
// Este arquivo gerencia todas as funcionalidades do painel administrativo

document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário está autenticado e é administrador
    checkAdminAccess();
    
    // Inicializar o menu móvel
    initMobileMenu();
    
    // Inicializar gráficos se estiver na página de dashboard
    if (document.getElementById('activity-chart')) {
        initDashboardCharts();
    }
    
    // Inicializar manipuladores de eventos para ações administrativas
    initAdminActions();
    
    // Inicializar manipuladores de eventos para configurações
    if (document.getElementById('save-settings-btn')) {
        initSettingsHandlers();
    }
    
    // Verificar status online/offline
    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
});

// Verificar acesso de administrador
function checkAdminAccess() {
    // Verificar se o usuário está autenticado
    auth.onAuthStateChanged(function(user) {
        if (user) {
            // Verificar se o usuário é administrador
            db.collection('users').doc(user.uid).get()
                .then(doc => {
                    if (doc.exists && doc.data().isAdmin) {
                        console.log('Acesso de administrador confirmado');
                        // Atualizar interface com informações do usuário
                        updateAdminInterface(user, doc.data());
                    } else {
                        console.log('Usuário não tem permissões de administrador');
                        // Redirecionar para a página inicial
                        window.location.href = 'index.html';
                    }
                })
                .catch(error => {
                    console.error('Erro ao verificar permissões de administrador:', error);
                    // Redirecionar para a página inicial
                    window.location.href = 'index.html';
                });
        } else {
            console.log('Usuário não autenticado');
            // Redirecionar para a página de login
            window.location.href = 'login.html';
        }
    });
}

// Atualizar interface com informações do administrador
function updateAdminInterface(user, userData) {
    // Aqui você pode atualizar elementos da interface com informações do usuário
    // Por exemplo, mostrar o nome do administrador, etc.
    
    // Carregar dados para o dashboard se estiver na página principal
    if (document.getElementById('total-users')) {
        loadDashboardData();
    }
    
    // Carregar dados para tabelas específicas
    if (document.getElementById('users-table')) {
        loadUsersData();
    }
    
    if (document.getElementById('sightings-table')) {
        loadSightingsData();
    }
    
    if (document.getElementById('comments-table')) {
        loadCommentsData();
    }
    
    if (document.getElementById('reports-table')) {
        loadReportsData();
    }
}

// Inicializar menu móvel
function initMobileMenu() {
    const menuToggle = document.querySelector('.admin-menu-toggle');
    const sidebar = document.querySelector('.admin-sidebar');
    
    // Mostrar botão de toggle em dispositivos móveis
    if (window.innerWidth <= 768) {
        if (menuToggle) {
            menuToggle.style.display = 'block';
        }
    }
    
    // Adicionar evento de clique ao botão de toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            if (sidebar) {
                sidebar.classList.toggle('active');
            }
        });
    }
    
    // Fechar menu ao clicar em um link
    const menuLinks = document.querySelectorAll('.admin-menu a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768 && sidebar) {
                sidebar.classList.remove('active');
            }
        });
    });
    
    // Ajustar menu ao redimensionar a janela
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768) {
            if (menuToggle) {
                menuToggle.style.display = 'block';
            }
        } else {
            if (menuToggle) {
                menuToggle.style.display = 'none';
            }
            if (sidebar) {
                sidebar.classList.remove('active');
            }
        }
    });
}

// Inicializar gráficos do dashboard
function initDashboardCharts() {
    const ctx = document.getElementById('activity-chart').getContext('2d');
    
    // Dados de exemplo para o gráfico
    const labels = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'];
    const sightingsData = [65, 59, 80, 81, 56, 55];
    const usersData = [28, 48, 40, 19, 86, 27];
    const commentsData = [90, 60, 70, 35, 45, 83];
    
    // Criar gráfico
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Avistamentos',
                    data: sightingsData,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4,
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: 'Usuários',
                    data: usersData,
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    tension: 0.4,
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: 'Comentários',
                    data: commentsData,
                    borderColor: '#f39c12',
                    backgroundColor: 'rgba(243, 156, 18, 0.1)',
                    tension: 0.4,
                    borderWidth: 2,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Atividade do Site'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Carregar dados para o dashboard
function loadDashboardData() {
    // Em uma implementação real, esses dados viriam do Firebase
    // Aqui estamos usando dados de exemplo
    
    // Atualizar contadores
    document.getElementById('total-users').textContent = '1,245';
    document.getElementById('total-sightings').textContent = '3,721';
    document.getElementById('pending-approval').textContent = '18';
    document.getElementById('total-comments').textContent = '8,392';
    
    // Atualizar data
    const now = new Date();
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    document.getElementById('admin-date').textContent = now.toLocaleDateString('pt-BR', options);
    
    // Carregar avistamentos recentes
    // Em uma implementação real, isso viria do Firebase
}

// Carregar dados de usuários
function loadUsersData() {
    // Em uma implementação real, esses dados viriam do Firebase
    // Aqui estamos usando os dados de exemplo já incluídos no HTML
}

// Carregar dados de avistamentos
function loadSightingsData() {
    // Em uma implementação real, esses dados viriam do Firebase
    // Aqui estamos usando os dados de exemplo já incluídos no HTML
}

// Carregar dados de comentários
function loadCommentsData() {
    // Em uma implementação real, esses dados viriam do Firebase
    // Aqui estamos usando os dados de exemplo já incluídos no HTML
}

// Carregar dados de denúncias
function loadReportsData() {
    // Em uma implementação real, esses dados viriam do Firebase
    // Aqui estamos usando os dados de exemplo já incluídos no HTML
}

// Inicializar manipuladores de eventos para ações administrativas
function initAdminActions() {
    // Adicionar eventos para botões de ação nas tabelas
    document.querySelectorAll('.admin-actions button').forEach(button => {
        button.addEventListener('click', handleAdminAction);
    });
    
    // Adicionar eventos para botões de paginação
    document.querySelectorAll('.admin-pagination button').forEach(button => {
        button.addEventListener('click', handlePagination);
    });
    
    // Adicionar eventos para filtros
    const filterSelects = document.querySelectorAll('.admin-filters select');
    filterSelects.forEach(select => {
        select.addEventListener('change', applyFilters);
    });
    
    // Adicionar eventos para busca
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
}

// Manipular ações administrativas
function handleAdminAction(event) {
    const button = event.currentTarget;
    const action = button.className.replace('btn-', '');
    const row = button.closest('tr');
    
    // Obter informações do item
    let itemInfo = '';
    if (row.querySelector('.user-info')) {
        itemInfo = row.querySelector('.user-info span').textContent;
    } else if (row.querySelector('.sighting-info')) {
        itemInfo = row.querySelector('.sighting-info span').textContent;
    } else if (row.querySelector('.comment-content')) {
        itemInfo = row.querySelector('.comment-content').textContent.trim();
    } else if (row.querySelector('.report-content')) {
        itemInfo = row.querySelector('.report-content').textContent.trim();
    }
    
    // Executar ação com base no tipo de botão
    switch (action) {
        case 'view':
            alert(`Visualizando: ${itemInfo}`);
            break;
        case 'edit':
            alert(`Editando: ${itemInfo}`);
            break;
        case 'delete':
            if (confirm(`Tem certeza que deseja excluir: ${itemInfo}?`)) {
                alert(`Item excluído: ${itemInfo}`);
                // Em uma implementação real, você removeria o item do Firebase
                // e atualizaria a interface
            }
            break;
        case 'approve':
            alert(`Item aprovado: ${itemInfo}`);
            break;
        case 'reject':
            alert(`Item rejeitado: ${itemInfo}`);
            break;
        case 'feature':
            alert(`Item destacado: ${itemInfo}`);
            break;
        case 'promote':
            alert(`Usuário promovido: ${itemInfo}`);
            break;
        case 'suspend':
            alert(`Usuário suspenso: ${itemInfo}`);
            break;
        case 'dismiss':
            alert(`Denúncia descartada: ${itemInfo}`);
            break;
        case 'warn':
            alert(`Advertência enviada para: ${itemInfo}`);
            break;
        case 'ban':
            if (confirm(`Tem certeza que deseja banir: ${itemInfo}?`)) {
                alert(`Usuário banido: ${itemInfo}`);
            }
            break;
        case 'remove':
            if (confirm(`Tem certeza que deseja remover o conteúdo: ${itemInfo}?`)) {
                alert(`Conteúdo removido: ${itemInfo}`);
            }
            break;
    }
}

// Manipular paginação
function handlePagination(event) {
    const button = event.currentTarget;
    
    // Remover classe ativa de todos os botões
    document.querySelectorAll('.admin-pagination button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Adicionar classe ativa ao botão clicado
    button.classList.add('active');
    
    // Em uma implementação real, você carregaria os dados da página correspondente
    // Aqui estamos apenas simulando
    alert(`Carregando página: ${button.textContent}`);
}

// Aplicar filtros
function applyFilters() {
    // Obter valores dos filtros
    const filters = {};
    document.querySelectorAll('.admin-filters select').forEach(select => {
        filters[select.id] = select.value;
    });
    
    // Em uma implementação real, você aplicaria esses filtros aos dados
    // Aqui estamos apenas simulando
    console.log('Aplicando filtros:', filters);
}

// Realizar busca
function performSearch() {
    // Obter valor da busca
    let searchInput;
    if (document.getElementById('user-search')) {
        searchInput = document.getElementById('user-search');
    } else if (document.getElementById('sighting-search')) {
        searchInput = document.getElementById('sighting-search');
    } else if (document.getElementById('comment-search')) {
        searchInput = document.getElementById('comment-search');
    } else if (document.getElementById('report-search')) {
        searchInput = document.getElementById('report-search');
    }
    
    if (searchInput) {
        const searchValue = searchInput.value.trim();
        
        // Em uma implementação real, você realizaria a busca nos dados
        // Aqui estamos apenas simulando
        if (searchValue) {
            alert(`Buscando por: ${searchValue}`);
        } else {
            alert('Por favor, digite um termo de busca.');
        }
    }
}

// Inicializar manipuladores de eventos para configurações
function initSettingsHandlers() {
    // Manipular seleção de cores
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            // Remover classe ativa de todas as opções
            document.querySelectorAll('.color-option').forEach(opt => {
                opt.classList.remove('active');
            });
            
            // Adicionar classe ativa à opção selecionada
            this.classList.add('active');
            
            // Em uma implementação real, você aplicaria a cor selecionada
            const color = this.getAttribute('data-color');
            console.log('Cor selecionada:', color);
        });
    });
    
    // Manipular salvamento de configurações
    document.getElementById('save-settings-btn').addEventListener('click', function() {
        // Em uma implementação real, você salvaria as configurações no Firebase
        alert('Configurações salvas com sucesso!');
    });
    
    // Manipular restauração de configurações padrão
    document.getElementById('reset-settings-btn').addEventListener('click', function() {
        if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
            // Em uma implementação real, você restauraria as configurações padrão
            alert('Configurações restauradas para os valores padrão.');
        }
    });
    
    // Manipular backup
    const backupNowBtn = document.getElementById('backup-now-btn');
    if (backupNowBtn) {
        backupNowBtn.addEventListener('click', function() {
            alert('Backup iniciado. Você será notificado quando for concluído.');
            // Em uma implementação real, você iniciaria o processo de backup
        });
    }
    
    // Manipular restauração de backup
    const restoreBackupBtn = document.getElementById('restore-backup-btn');
    if (restoreBackupBtn) {
        restoreBackupBtn.addEventListener('click', function() {
            if (confirm('Tem certeza que deseja restaurar um backup? Isso substituirá todos os dados atuais.')) {
                alert('Por favor, selecione um arquivo de backup para restaurar.');
                // Em uma implementação real, você abriria um seletor de arquivos
            }
        });
    }
}

// Atualizar status online/offline
function updateOnlineStatus() {
    const offlineIndicator = document.getElementById('offline-indicator');
    
    if (offlineIndicator) {
        if (navigator.onLine) {
            offlineIndicator.style.display = 'none';
        } else {
            offlineIndicator.style.display = 'block';
        }
    }
}

// Funções de administração
async function loadAdminDashboard() {
    try {
        if (!isAdmin()) {
            window.location.href = '/';
            return;
        }

        const stats = await api.get('admin/stats');
        displayStats(stats);
        
        const recentActivity = await api.get('admin/recent-activity');
        displayRecentActivity(recentActivity);
        
        initializeCharts(stats);
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        showError('Erro ao carregar informações do dashboard.');
    }
}

async function loadUsers() {
    try {
        const users = await api.get('admin/users');
        displayUsers(users);
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        showError('Erro ao carregar lista de usuários.');
    }
}

async function updateUserRole(userId, isAdmin) {
    try {
        await api.put(`admin/users/${userId}/role`, { is_admin: isAdmin });
        showSuccess('Função do usuário atualizada com sucesso!');
        loadUsers(); // Recarregar lista de usuários
    } catch (error) {
        console.error('Erro ao atualizar função do usuário:', error);
        showError('Erro ao atualizar função do usuário.');
    }
}

async function deleteUser(userId) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
        return;
    }

    try {
        await api.delete(`admin/users/${userId}`);
        showSuccess('Usuário excluído com sucesso!');
        loadUsers(); // Recarregar lista de usuários
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        showError('Erro ao excluir usuário.');
    }
}

async function loadSightings() {
    try {
        const sightings = await api.get('admin/sightings');
        displaySightings(sightings);
    } catch (error) {
        console.error('Erro ao carregar avistamentos:', error);
        showError('Erro ao carregar lista de avistamentos.');
    }
}

async function approveSighting(sightingId) {
    try {
        await api.put(`admin/sightings/${sightingId}/approve`);
        showSuccess('Avistamento aprovado com sucesso!');
        loadSightings(); // Recarregar lista de avistamentos
    } catch (error) {
        console.error('Erro ao aprovar avistamento:', error);
        showError('Erro ao aprovar avistamento.');
    }
}

async function deleteSighting(sightingId) {
    if (!confirm('Tem certeza que deseja excluir este avistamento?')) {
        return;
    }

    try {
        await api.delete(`admin/sightings/${sightingId}`);
        showSuccess('Avistamento excluído com sucesso!');
        loadSightings(); // Recarregar lista de avistamentos
    } catch (error) {
        console.error('Erro ao excluir avistamento:', error);
        showError('Erro ao excluir avistamento.');
    }
}

// Funções auxiliares
function isAdmin() {
    const user = getCurrentUser();
    return user && user.is_admin;
}

function displayStats(stats) {
    document.getElementById('total-users').textContent = stats.total_users;
    document.getElementById('total-sightings').textContent = stats.total_sightings;
    document.getElementById('total-comments').textContent = stats.total_comments;
    document.getElementById('pending-reports').textContent = stats.pending_reports;
}

function displayRecentActivity(activity) {
    const container = document.getElementById('recent-activity');
    container.innerHTML = '';

    activity.forEach(item => {
        const element = document.createElement('div');
        element.className = 'activity-item';
        element.innerHTML = `
            <span class="activity-time">${formatDate(item.created_at)}</span>
            <span class="activity-type">${item.type}</span>
            <span class="activity-description">${item.description}</span>
        `;
        container.appendChild(element);
    });
}

function initializeCharts(stats) {
    // Gráfico de usuários
    new Chart(document.getElementById('users-chart'), {
        type: 'line',
        data: {
            labels: stats.users_timeline.map(item => item.date),
            datasets: [{
                label: 'Novos Usuários',
                data: stats.users_timeline.map(item => item.count),
                borderColor: '#4CAF50',
                tension: 0.1
            }]
        }
    });

    // Gráfico de avistamentos
    new Chart(document.getElementById('sightings-chart'), {
        type: 'line',
        data: {
            labels: stats.sightings_timeline.map(item => item.date),
            datasets: [{
                label: 'Novos Avistamentos',
                data: stats.sightings_timeline.map(item => item.count),
                borderColor: '#2196F3',
                tension: 0.1
            }]
        }
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    const successElement = document.getElementById('success-message');
    successElement.textContent = message;
    successElement.style.display = 'block';
    setTimeout(() => {
        successElement.style.display = 'none';
    }, 5000);
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    if (!isAuthenticated() || !isAdmin()) {
        window.location.href = '/login.html';
        return;
    }

    // Carregar conteúdo apropriado baseado na página atual
    const currentPage = window.location.pathname;
    if (currentPage.includes('admin.html')) {
        loadAdminDashboard();
    } else if (currentPage.includes('admin-users.html')) {
        loadUsers();
    } else if (currentPage.includes('admin-sightings.html')) {
        loadSightings();
    }
});
