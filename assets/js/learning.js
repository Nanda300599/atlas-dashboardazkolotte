document.addEventListener('DOMContentLoaded', function(){
  if (window.AZKOAuth && typeof window.AZKOAuth.requireAuth === 'function') {
    window.AZKOAuth.requireAuth();
  }

  const learningAdminControls = document.getElementById('learningAdminControls');
  const learningHeroTitle = document.getElementById('learningHeroTitle');
  const learningHeroDescription = document.getElementById('learningHeroDescription');
  const learningHeroTitleInput = document.getElementById('learningHeroTitleInput');
  const learningHeroDescriptionInput = document.getElementById('learningHeroDescriptionInput');
  const learningTitleInput = document.getElementById('learningTitleInput');
  const learningMaterialInput = document.getElementById('learningMaterialInput');
  const learningImageInput = document.getElementById('learningImageInput');
  const learningPostIdInput = document.getElementById('learningPostId');
  const newLearningPostBtn = document.getElementById('newLearningPostBtn');
  const saveLearningContentBtn = document.getElementById('saveLearningContentBtn');
  const resetLearningContentBtn = document.getElementById('resetLearningContentBtn');
  const learningPostsList = document.getElementById('learningPostsList');

  const defaultLearningIntro = {
    heroTitle: 'E-Learning Center',
    heroDescription: 'Tempat untuk menampilkan materi belajar, informasi program pelatihan, dan media pendukung yang dapat diperbarui oleh admin.'
  };

  const defaultLearningPosts = [];

  function getLearningIntro(){
    try {
      const stored = localStorage.getItem('azko_learning_intro');
      return stored ? JSON.parse(stored) : defaultLearningIntro;
    } catch (error) {
      return defaultLearningIntro;
    }
  }

  function saveLearningIntro(intro){
    localStorage.setItem('azko_learning_intro', JSON.stringify(intro));
  }

  function getLearningPosts(){
    try {
      const stored = localStorage.getItem('azko_learning_posts');
      return stored ? JSON.parse(stored) : defaultLearningPosts;
    } catch (error) {
      return defaultLearningPosts;
    }
  }

  function saveLearningPosts(posts){
    localStorage.setItem('azko_learning_posts', JSON.stringify(posts));
  }

  function clearPostForm(){
    if (learningTitleInput) learningTitleInput.value = '';
    if (learningMaterialInput) learningMaterialInput.value = '';
    if (learningImageInput) learningImageInput.value = '';
    if (learningPostIdInput) learningPostIdInput.value = '';
    if (learningHeroTitleInput) learningHeroTitleInput.value = '';
    if (learningHeroDescriptionInput) learningHeroDescriptionInput.value = '';
  }

  function renderLearningIntro(){
    const intro = getLearningIntro();
    if (learningHeroTitle) learningHeroTitle.textContent = intro.heroTitle || defaultLearningIntro.heroTitle;
    if (learningHeroDescription) learningHeroDescription.textContent = intro.heroDescription || defaultLearningIntro.heroDescription;
    if (learningHeroTitleInput) learningHeroTitleInput.value = intro.heroTitle || defaultLearningIntro.heroTitle;
    if (learningHeroDescriptionInput) learningHeroDescriptionInput.value = intro.heroDescription || defaultLearningIntro.heroDescription;
  }

  function renderLearningPosts(){
    const posts = getLearningPosts();
    if (!learningPostsList) return;

    if (!posts.length) {
      learningPostsList.innerHTML = '<div class="text-muted border rounded-3 p-3">Belum ada postingan E-Learning.</div>';
      return;
    }

    learningPostsList.innerHTML = posts.map(post => `
      <article class="learning-post-card card mb-3">
        <div class="learning-post-media">
          ${post.image ? `<img src="${post.image}" alt="${post.title || 'Learning'}" class="learning-post-image" data-image-view="${post.id}">` : `<div class="learning-post-placeholder">No image</div>`}
        </div>
        <div class="learning-post-body">
          <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap">
            <div class="flex-grow-1">
              <h5 class="mb-2">${post.title || 'Materi E-Learning'}</h5>
              <p class="learning-post-description mb-0">${post.description || 'Tidak ada deskripsi.'}</p>
            </div>
            ${window.AZKOAuth && typeof window.AZKOAuth.isAdmin === 'function' && window.AZKOAuth.isAdmin() ? `
              <div class="d-flex gap-2">
                <button class="btn btn-outline-secondary btn-sm" type="button" data-edit-post="${post.id}">Edit</button>
                <button class="btn btn-outline-danger btn-sm" type="button" data-delete-post="${post.id}">Hapus</button>
              </div>` : ''}
          </div>
        </div>
      </article>
    `).join('');
  }

  function setAdminVisibility(){
    if (!learningAdminControls) return;
    const isAdmin = window.AZKOAuth && typeof window.AZKOAuth.isAdmin === 'function' ? window.AZKOAuth.isAdmin() : false;
    learningAdminControls.classList.toggle('d-none', !isAdmin);
    renderLearningPosts();
  }

  function openLearningImageModal(imageSrc, title){
    const existing = document.getElementById('learningImageModal');
    if (existing) {
      existing.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'learningImageModal';
    modal.className = 'learning-image-modal';
    modal.innerHTML = `
      <div class="learning-image-modal-backdrop"></div>
      <div class="learning-image-modal-dialog">
        <button class="learning-image-modal-close" type="button" aria-label="Close">×</button>
        <div class="learning-image-modal-title">${title}</div>
        <img src="${imageSrc}" alt="${title}" class="learning-image-modal-image">
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.learning-image-modal-backdrop').addEventListener('click', closeLearningImageModal);
    modal.querySelector('.learning-image-modal-close').addEventListener('click', closeLearningImageModal);
    document.addEventListener('keydown', handleLearningImageModalKeydown);
  }

  function closeLearningImageModal(){
    const modal = document.getElementById('learningImageModal');
    if (modal) {
      modal.remove();
    }
    document.removeEventListener('keydown', handleLearningImageModalKeydown);
  }

  function handleLearningImageModalKeydown(event){
    if (event.key === 'Escape') {
      closeLearningImageModal();
    }
  }

  function readFileAsDataUrl(file){
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function(event){ resolve(event.target.result); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function editPost(postId){
    const posts = getLearningPosts();
    const post = posts.find(item => item.id === postId);
    if (!post) return;
    if (learningTitleInput) learningTitleInput.value = post.title || '';
    if (learningMaterialInput) learningMaterialInput.value = post.description || '';
    if (learningPostIdInput) learningPostIdInput.value = post.id;
    if (learningHeroTitleInput) learningHeroTitleInput.value = getLearningIntro().heroTitle || defaultLearningIntro.heroTitle;
    if (learningHeroDescriptionInput) learningHeroDescriptionInput.value = getLearningIntro().heroDescription || defaultLearningIntro.heroDescription;
  }

  if (learningPostsList) {
    learningPostsList.addEventListener('click', function(e){
      const editBtn = e.target.closest('[data-edit-post]');
      const deleteBtn = e.target.closest('[data-delete-post]');
      const imageTrigger = e.target.closest('[data-image-view]');

      if (editBtn) {
        editPost(editBtn.getAttribute('data-edit-post'));
        return;
      }

      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-delete-post');
        const posts = getLearningPosts().filter(item => item.id !== id);
        saveLearningPosts(posts);
        renderLearningPosts();
        return;
      }

      if (imageTrigger) {
        const postId = imageTrigger.getAttribute('data-image-view');
        const posts = getLearningPosts();
        const post = posts.find(item => item.id === postId);
        if (post && post.image) {
          openLearningImageModal(post.image, post.title || 'Learning');
        }
      }
    });
  }

  if (newLearningPostBtn) {
    newLearningPostBtn.addEventListener('click', function(){
      clearPostForm();
      if (learningHeroTitleInput) learningHeroTitleInput.value = getLearningIntro().heroTitle || defaultLearningIntro.heroTitle;
      if (learningHeroDescriptionInput) learningHeroDescriptionInput.value = getLearningIntro().heroDescription || defaultLearningIntro.heroDescription;
      alert('Form siap untuk membuat postingan baru.');
    });
  }

  if (saveLearningContentBtn) {
    saveLearningContentBtn.addEventListener('click', async function(){
      if (!window.AZKOAuth || typeof window.AZKOAuth.isAdmin !== 'function' || !window.AZKOAuth.isAdmin()) {
        alert('Hanya admin yang bisa mengubah konten Learning.');
        return;
      }

      const intro = {
        heroTitle: learningHeroTitleInput?.value.trim() || defaultLearningIntro.heroTitle,
        heroDescription: learningHeroDescriptionInput?.value.trim() || defaultLearningIntro.heroDescription
      };
      saveLearningIntro(intro);

      const posts = getLearningPosts();
      const postId = learningPostIdInput?.value;
      const title = learningTitleInput?.value.trim() || 'Materi E-Learning';
      const description = learningMaterialInput?.value.trim() || 'Belum ada detail materi.';
      const existingPost = posts.find(item => item.id === postId);
      const file = learningImageInput && learningImageInput.files && learningImageInput.files[0];
      let image = existingPost ? existingPost.image : '';

      if (file) {
        image = await readFileAsDataUrl(file);
      }

      if (existingPost) {
        existingPost.title = title;
        existingPost.description = description;
        existingPost.image = image;
      } else {
        posts.push({ id: Date.now().toString(), title, description, image });
      }

      saveLearningPosts(posts);
      renderLearningIntro();
      renderLearningPosts();
      clearPostForm();
      alert('Konten Learning berhasil disimpan.');
    });
  }

  if (resetLearningContentBtn) {
    resetLearningContentBtn.addEventListener('click', function(){
      clearPostForm();
      renderLearningIntro();
      alert('Form postingan dibersihkan.');
    });
  }

  setAdminVisibility();
  renderLearningIntro();
  renderLearningPosts();
});
