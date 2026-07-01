document.addEventListener('DOMContentLoaded', function(){
  if (window.AZKOAuth && typeof window.AZKOAuth.requireAuth === 'function') {
    window.AZKOAuth.requireAuth();
  }

  const promoAdminControls = document.getElementById('promoAdminControls');
  const promoIncentiveList = document.getElementById('promoIncentiveList');
  const promoDepartmentList = document.getElementById('promoDepartmentList');
  const resetPromoBtn = document.getElementById('resetPromoBtn');

  const promoFormRefs = {
    incentive: {
      titleInput: document.getElementById('promoIncentiveTitleInput'),
      descriptionInput: document.getElementById('promoIncentiveDescriptionInput'),
      imageInput: document.getElementById('promoIncentiveImageInput'),
      postIdInput: document.getElementById('promoIncentivePostId'),
      saveBtn: document.getElementById('savePromoIncentiveBtn'),
      newBtn: document.getElementById('newPromoIncentiveBtn'),
      cancelBtn: document.getElementById('cancelPromoIncentiveBtn')
    },
    department: {
      titleInput: document.getElementById('promoDepartmentTitleInput'),
      descriptionInput: document.getElementById('promoDepartmentDescriptionInput'),
      imageInput: document.getElementById('promoDepartmentImageInput'),
      postIdInput: document.getElementById('promoDepartmentPostId'),
      saveBtn: document.getElementById('savePromoDepartmentBtn'),
      newBtn: document.getElementById('newPromoDepartmentBtn'),
      cancelBtn: document.getElementById('cancelPromoDepartmentBtn')
    }
  };

  const defaultPromoContent = {
    incentive: [],
    department: []
  };

  function escapeHtml(value){
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function isAdmin(){
    return window.AZKOAuth && typeof window.AZKOAuth.isAdmin === 'function' ? window.AZKOAuth.isAdmin() : false;
  }

  function normalizePromoContent(content){
    const normalized = { incentive: [], department: [] };
    const parsed = content || {};

    if (Array.isArray(parsed.incentive)) {
      normalized.incentive = parsed.incentive;
    } else if (typeof parsed.incentive === 'string' && parsed.incentive) {
      normalized.incentive = [{ id: 'legacy-incentive', title: 'Promo Insentif', description: '', image: parsed.incentive }];
    }

    if (Array.isArray(parsed.department)) {
      normalized.department = parsed.department;
    } else if (typeof parsed.department === 'string' && parsed.department) {
      normalized.department = [{ id: 'legacy-department', title: 'Promo Departemen', description: '', image: parsed.department }];
    }

    return normalized;
  }

  function getPromoContent(){
    try {
      const stored = localStorage.getItem('azko_promo_content');
      return stored ? normalizePromoContent(JSON.parse(stored)) : defaultPromoContent;
    } catch (error) {
      return defaultPromoContent;
    }
  }

  function savePromoContent(content){
    localStorage.setItem('azko_promo_content', JSON.stringify(normalizePromoContent(content)));
  }

  function getPostsForType(type){
    const content = getPromoContent();
    return Array.isArray(content[type]) ? content[type] : [];
  }

  function savePostsForType(type, posts){
    const content = getPromoContent();
    content[type] = posts;
    savePromoContent(content);
  }

  function clearPromoForm(type){
    const refs = promoFormRefs[type];
    if (!refs) return;
    if (refs.titleInput) refs.titleInput.value = '';
    if (refs.descriptionInput) refs.descriptionInput.value = '';
    if (refs.imageInput) refs.imageInput.value = '';
    if (refs.postIdInput) refs.postIdInput.value = '';
  }

  function openPromoImageModal(imageSrc, title){
    const existing = document.getElementById('promoImageModal');
    if (existing) {
      existing.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'promoImageModal';
    modal.className = 'learning-image-modal';
    modal.innerHTML = `
      <div class="learning-image-modal-backdrop"></div>
      <div class="learning-image-modal-dialog">
        <button class="learning-image-modal-close" type="button" aria-label="Close">×</button>
        <div class="learning-image-modal-title">${escapeHtml(title || 'Promo')}</div>
        <img src="${imageSrc}" alt="${escapeHtml(title || 'Promo')}" class="learning-image-modal-image">
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.learning-image-modal-backdrop').addEventListener('click', closePromoImageModal);
    modal.querySelector('.learning-image-modal-close').addEventListener('click', closePromoImageModal);
    document.addEventListener('keydown', handlePromoImageModalKeydown);
  }

  function closePromoImageModal(){
    const modal = document.getElementById('promoImageModal');
    if (modal) {
      modal.remove();
    }
    document.removeEventListener('keydown', handlePromoImageModalKeydown);
  }

  function handlePromoImageModalKeydown(event){
    if (event.key === 'Escape') {
      closePromoImageModal();
    }
  }

  function renderPromoType(type, container){
    if (!container) return;
    const posts = getPostsForType(type);

    if (!posts.length) {
      container.innerHTML = `<div class="text-muted border rounded-3 p-3">Belum ada postingan ${type === 'incentive' ? 'Promo Insentif' : 'Promo Departemen'}.</div>`;
      return;
    }

    container.innerHTML = posts.map(post => `
      <article class="card mb-3 overflow-hidden">
        ${post.image ? `<img src="${post.image}" alt="${escapeHtml(post.title || 'Promo')}" class="img-fluid" style="width:100%;height:200px;object-fit:cover;cursor:pointer;" data-promo-image="${post.id}" data-promo-type="${type}">` : '<div class="bg-light text-muted d-flex align-items-center justify-content-center" style="height:160px;">Tidak ada foto</div>'}
        <div class="p-3">
          <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap">
            <div>
              <h6 class="fw-semibold mb-1">${escapeHtml(post.title || (type === 'incentive' ? 'Promo Insentif' : 'Promo Departemen'))}</h6>
              <p class="mb-0 text-muted small">${escapeHtml(post.description || 'Tidak ada deskripsi.')}</p>
            </div>
            ${isAdmin() ? `
              <div class="d-flex gap-2">
                <button class="btn btn-outline-secondary btn-sm" type="button" data-edit-promo="${type}" data-promo-id="${post.id}">Edit</button>
                <button class="btn btn-outline-danger btn-sm" type="button" data-delete-promo="${type}" data-promo-id="${post.id}">Hapus</button>
              </div>` : ''}
          </div>
        </div>
      </article>
    `).join('');
  }

  function renderPromoContent(){
    renderPromoType('incentive', promoIncentiveList);
    renderPromoType('department', promoDepartmentList);
  }

  function setAdminVisibility(){
    if (!promoAdminControls) return;
    promoAdminControls.classList.toggle('d-none', !isAdmin());
    renderPromoContent();
  }

  function readFileAsDataUrl(file){
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function(event){ resolve(event.target.result); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function savePromoEntry(type){
    if (!isAdmin()) {
      alert('Hanya admin yang bisa mengubah promo.');
      return;
    }

    const refs = promoFormRefs[type];
    if (!refs) return;

    const posts = getPostsForType(type);
    const postId = refs.postIdInput ? refs.postIdInput.value : '';
    const title = refs.titleInput && refs.titleInput.value.trim() ? refs.titleInput.value.trim() : (type === 'incentive' ? 'Promo Insentif' : 'Promo Departemen');
    const description = refs.descriptionInput ? refs.descriptionInput.value.trim() : '';
    const existingPost = posts.find(item => item.id === postId);
    const file = refs.imageInput && refs.imageInput.files && refs.imageInput.files[0];
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

    savePostsForType(type, posts);
    renderPromoContent();
    clearPromoForm(type);
    alert('Posting promo berhasil disimpan.');
  }

  function editPromoEntry(type, postId){
    const refs = promoFormRefs[type];
    if (!refs) return;
    const posts = getPostsForType(type);
    const post = posts.find(item => item.id === postId);
    if (!post) return;
    if (refs.titleInput) refs.titleInput.value = post.title || '';
    if (refs.descriptionInput) refs.descriptionInput.value = post.description || '';
    if (refs.postIdInput) refs.postIdInput.value = post.id;
  }

  function handlePromoListClick(container, event){
    const editBtn = event.target.closest('[data-edit-promo]');
    const deleteBtn = event.target.closest('[data-delete-promo]');
    const imageTrigger = event.target.closest('[data-promo-image]');

    if (editBtn) {
      editPromoEntry(editBtn.getAttribute('data-edit-promo'), editBtn.getAttribute('data-promo-id'));
      return;
    }

    if (deleteBtn) {
      const type = deleteBtn.getAttribute('data-delete-promo');
      const id = deleteBtn.getAttribute('data-promo-id');
      const posts = getPostsForType(type).filter(item => item.id !== id);
      savePostsForType(type, posts);
      renderPromoContent();
      return;
    }

    if (imageTrigger) {
      const type = imageTrigger.getAttribute('data-promo-type');
      const id = imageTrigger.getAttribute('data-promo-image');
      const posts = getPostsForType(type);
      const post = posts.find(item => item.id === id);
      if (post && post.image) {
        openPromoImageModal(post.image, post.title || (type === 'incentive' ? 'Promo Insentif' : 'Promo Departemen'));
      }
    }
  }

  if (promoIncentiveList) {
    promoIncentiveList.addEventListener('click', function(e){
      handlePromoListClick(promoIncentiveList, e);
    });
  }

  if (promoDepartmentList) {
    promoDepartmentList.addEventListener('click', function(e){
      handlePromoListClick(promoDepartmentList, e);
    });
  }

  Object.entries(promoFormRefs).forEach(([type, refs]) => {
    if (refs.newBtn) {
      refs.newBtn.addEventListener('click', function(){ clearPromoForm(type); });
    }
    if (refs.cancelBtn) {
      refs.cancelBtn.addEventListener('click', function(){ clearPromoForm(type); });
    }
    if (refs.saveBtn) {
      refs.saveBtn.addEventListener('click', function(){ savePromoEntry(type); });
    }
  });

  if (resetPromoBtn) {
    resetPromoBtn.addEventListener('click', function(){
      if (!isAdmin()) {
        alert('Hanya admin yang bisa mengubah promo.');
        return;
      }
      savePromoContent({ incentive: [], department: [] });
      renderPromoContent();
      clearPromoForm('incentive');
      clearPromoForm('department');
      alert('Semua posting promo dibersihkan.');
    });
  }

  setAdminVisibility();
  renderPromoContent();
});
