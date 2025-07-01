// Gerenciamento da página de perfil do usuário

document.addEventListener('DOMContentLoaded', function() {
  // Verificar se estamos na página de perfil
  const profileContainer = document.getElementById('profile-container');
  if (profileContainer) {
    // Verificar autenticação é feito no auth.js
    // Carregar dados do perfil quando o usuário estiver autenticado
    auth.onAuthStateChanged(user => {
      if (user) {
        loadUserProfile(user.uid);
      }
    });
  }
});

// Funções para gerenciar perfil do usuário
async function loadUserProfile() {
    try {
        const user = getCurrentUser();
        if (!user) {
            window.location.href = '/login.html';
            return;
        }

        const profile = await api.get(`users/${user.id}`);
        displayUserProfile(profile);
        loadUserSightings(user.id);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
        showError('Erro ao carregar perfil. Tente novamente mais tarde.');
    }
}

async function updateProfile(profileData) {
    try {
        // Se houver uma nova imagem de perfil, fazer upload primeiro
        if (profileData.profileImage) {
            const uploadResult = await api.uploadFile(profileData.profileImage);
            profileData.profile_image = uploadResult.url;
            delete profileData.profileImage;
        }

        const user = getCurrentUser();
        const updatedProfile = await api.put(`users/${user.id}`, profileData);
        
        // Atualizar dados do usuário no localStorage
        const userData = {
            ...user,
            name: profileData.name,
            profile_image: profileData.profile_image
        };
        localStorage.setItem('userData', JSON.stringify(userData));

        showSuccess('Perfil atualizado com sucesso!');
        return updatedProfile;
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        showError('Erro ao atualizar perfil. Tente novamente mais tarde.');
        throw error;
    }
}

async function loadUserSightings(userId) {
    try {
        const sightings = await api.get(`users/${userId}/sightings`);
        displayUserSightings(sightings);
    } catch (error) {
        console.error('Erro ao carregar avistamentos:', error);
        showError('Erro ao carregar avistamentos. Tente novamente mais tarde.');
    }
}

async function changePassword(currentPassword, newPassword) {
    try {
        await api.post('users/change-password', {
            current_password: currentPassword,
            new_password: newPassword
        });
        showSuccess('Senha alterada com sucesso!');
    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        showError('Erro ao alterar senha. Verifique sua senha atual e tente novamente.');
        throw error;
    }
}

// Funções auxiliares de UI
function displayUserProfile(profile) {
    document.getElementById('profile-name').value = profile.name || '';
    document.getElementById('profile-email').value = profile.email || '';
    
    const profileImage = document.getElementById('profile-image');
    if (profile.profile_image) {
        profileImage.src = profile.profile_image;
    } else {
        profileImage.src = '/images/user-placeholder.png';
    }

    // Exibir estatísticas
    document.getElementById('sightings-count').textContent = profile.sightings_count || 0;
    document.getElementById('comments-count').textContent = profile.comments_count || 0;
    document.getElementById('ratings-count').textContent = profile.ratings_count || 0;
}

function displayUserSightings(sightings) {
    const container = document.getElementById('user-sightings');
    container.innerHTML = '';

    if (!sightings || sightings.length === 0) {
        container.innerHTML = '<p class="text-center">Nenhum avistamento registrado ainda.</p>';
        return;
      }
      
    sightings.forEach(sighting => {
        const card = createSightingCard(sighting);
        container.appendChild(card);
    });
}

function createSightingCard(sighting) {
  const card = document.createElement('div');
  card.className = 'sighting-card';
  card.innerHTML = `
        <img src="${sighting.image_url || '/images/default-sighting.jpg'}" alt="${sighting.title}">
        <div class="card-content">
      <h3>${sighting.title}</h3>
            <p>${sighting.description.substring(0, 100)}...</p>
            <div class="card-footer">
                <span>${new Date(sighting.date_time).toLocaleDateString()}</span>
                <a href="/sighting-details.html?id=${sighting.id}" class="btn-view">Ver Detalhes</a>
            </div>
    </div>
  `;
  return card;
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
    if (!isAuthenticated()) {
        window.location.href = '/login.html';
        return;
      }
      
    loadUserProfile();

    // Event listeners
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(profileForm);
            const profileData = {
                name: formData.get('name'),
                profileImage: formData.get('profile-image')
            };
            await updateProfile(profileData);
        });
    }

    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(passwordForm);
            await changePassword(
                formData.get('current-password'),
                formData.get('new-password')
            );
            passwordForm.reset();
        });
    }
});
