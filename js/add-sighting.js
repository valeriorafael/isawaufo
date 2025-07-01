// Gerenciamento da página de adição de avistamentos

document.addEventListener('DOMContentLoaded', function() {
  // Verificar se estamos na página de adicionar avistamento
  const addSightingForm = document.getElementById('add-sighting-form');
  if (addSightingForm) {
    setupAddSightingForm();
  }
});

// Configurar formulário de adição de avistamento
function setupAddSightingForm() {
  const form = document.getElementById('add-sighting-form');
  const errorElement = document.getElementById('add-sighting-error');
  const successElement = document.getElementById('add-sighting-success');
  const imagePreview = document.getElementById('image-preview');
  const imageInput = document.getElementById('images');
  
  // Configurar preview de imagens
  if (imageInput) {
    imageInput.addEventListener('change', function(e) {
      // Limpar preview anterior
      imagePreview.innerHTML = '';
      
      // Verificar se arquivos foram selecionados
      if (e.target.files.length === 0) return;
      
      // Limitar a 3 imagens
      const maxImages = 3;
      const filesToPreview = Array.from(e.target.files).slice(0, maxImages);
      
      // Criar previews
      filesToPreview.forEach(file => {
        // Verificar se é uma imagem
        if (!file.type.startsWith('image/')) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
          const img = document.createElement('img');
          img.src = event.target.result;
          img.style.maxWidth = '100px';
          img.style.maxHeight = '100px';
          img.style.margin = '5px';
          imagePreview.appendChild(img);
        };
        reader.readAsDataURL(file);
      });
      
      // Mostrar aviso se houver mais imagens do que o permitido
      if (e.target.files.length > maxImages) {
        const warning = document.createElement('p');
        warning.textContent = `Apenas as primeiras ${maxImages} imagens serão enviadas.`;
        warning.style.color = '#856404';
        imagePreview.appendChild(warning);
      }
    });
  }
  
  // Configurar envio do formulário
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Verificar se usuário está autenticado
      if (!auth.currentUser) {
        errorElement.textContent = 'Você precisa estar logado para adicionar um avistamento.';
        errorElement.style.display = 'block';
        return;
      }
      
      // Limpar mensagens anteriores
      errorElement.style.display = 'none';
      successElement.style.display = 'none';
      
      // Obter valores do formulário
      const title = document.getElementById('title').value;
      const description = document.getElementById('description').value;
      const date = document.getElementById('date').value;
      const time = document.getElementById('time').value;
      const category = document.getElementById('category').value;
      const duration = document.getElementById('duration').value;
      const latitude = document.getElementById('latitude').value;
      const longitude = document.getElementById('longitude').value;
      const locationName = document.getElementById('location-name').value;
      const imageFiles = document.getElementById('images').files;
      
      // Validar campos obrigatórios
      if (!title || !description || !date || !time || !category || !duration || !latitude || !longitude || !locationName) {
        errorElement.textContent = 'Por favor, preencha todos os campos obrigatórios.';
        errorElement.style.display = 'block';
        return;
      }
      
      // Desabilitar botão de envio para evitar múltiplos envios
      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = 'Enviando...';
      
      // Criar objeto de data combinando data e hora
      const dateTime = new Date(`${date}T${time}`);
      
      // Criar objeto de avistamento
      const sighting = {
        title: title,
        description: description,
        date: dateTime,
        category: category,
        duration: parseInt(duration),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        locationName: locationName,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Usuário anônimo',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        images: [],
        ratingsCount: 0,
        averageRating: 0
      };
      
      // Se não houver imagens, salvar diretamente
      if (imageFiles.length === 0) {
        saveSighting(sighting, submitButton);
        return;
      }
      
      // Limitar a 3 imagens
      const maxImages = 3;
      const filesToUpload = Array.from(imageFiles).slice(0, maxImages);
      
      // Array para armazenar promessas de upload
      const uploadPromises = [];
      
      // Fazer upload de cada imagem
      filesToUpload.forEach(file => {
        // Verificar se é uma imagem
        if (!file.type.startsWith('image/')) return;
        
        // Criar referência para o arquivo no Storage
        const fileName = `sightings/${auth.currentUser.uid}/${Date.now()}_${file.name}`;
        const fileRef = storage.ref().child(fileName);
        
        // Fazer upload e adicionar promessa ao array
        const uploadTask = fileRef.put(file);
        const uploadPromise = uploadTask
          .then(() => fileRef.getDownloadURL())
          .then(url => {
            // Adicionar URL à lista de imagens
            sighting.images.push(url);
          })
          .catch(error => {
            console.error('Erro ao fazer upload de imagem:', error);
          });
        
        uploadPromises.push(uploadPromise);
      });
      
      // Quando todos os uploads terminarem, salvar o avistamento
      Promise.all(uploadPromises)
        .then(() => {
          saveSighting(sighting, submitButton);
        })
        .catch(error => {
          console.error('Erro ao fazer upload de imagens:', error);
          errorElement.textContent = 'Erro ao fazer upload de imagens. Tente novamente.';
          errorElement.style.display = 'block';
          submitButton.disabled = false;
          submitButton.textContent = 'Publicar Avistamento';
        });
    });
  }
}

// Salvar avistamento no Firestore
function saveSighting(sighting, submitButton) {
  db.collection('sightings').add(sighting)
    .then(docRef => {
      console.log('Avistamento adicionado com ID:', docRef.id);
      
      // Atualizar contador de avistamentos do usuário
      return db.collection('users').doc(auth.currentUser.uid).update({
        sightingsCount: firebase.firestore.FieldValue.increment(1)
      });
    })
    .then(() => {
      // Mostrar mensagem de sucesso
      const successElement = document.getElementById('add-sighting-success');
      successElement.style.display = 'block';
      
      // Limpar formulário
      document.getElementById('add-sighting-form').reset();
      document.getElementById('image-preview').innerHTML = '';
      
      // Reabilitar botão
      submitButton.disabled = false;
      submitButton.textContent = 'Publicar Avistamento';
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        window.location.href = 'sightings.html';
      }, 2000);
    })
    .catch(error => {
      console.error('Erro ao adicionar avistamento:', error);
      
      // Mostrar mensagem de erro
      const errorElement = document.getElementById('add-sighting-error');
      errorElement.textContent = 'Erro ao adicionar avistamento. Tente novamente.';
      errorElement.style.display = 'block';
      
      // Reabilitar botão
      submitButton.disabled = false;
      submitButton.textContent = 'Publicar Avistamento';
    });
}
