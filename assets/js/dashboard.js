// Dashboard page bootstrapping and protected route handling
document.addEventListener('DOMContentLoaded', function(){
  if(window.AZKOAuth && typeof window.AZKOAuth.requireAuth === 'function'){
    window.AZKOAuth.requireAuth();
  }

  const defaultKpis = [
    { label: 'Sales Total (MTD)', value: '', trend: 'Set in Settings', icon: 'fa-chart-line', className: 'sales' },
    { label: 'Achievement', value: '', trend: 'Set in Settings', icon: 'fa-bullseye', className: 'achievement' },
    { label: 'Total Traffic', value: '', trend: 'Set in Settings', icon: 'fa-road', className: 'traffic' },
    { label: 'Transaksi & CR', value: '', trend: 'Set in Settings', icon: 'fa-repeat', className: 'transactions' },
    { label: 'Google Review', value: '', trend: 'Set in Settings', icon: 'fa-star', className: 'review' },
    { label: 'New Member', value: '', trend: 'Set in Settings', icon: 'fa-user-plus', className: 'member' }
  ];

  const defaultSecondaryKpis = [
    { label: 'Proteksi', value: '', trend: 'Set in Settings', icon: 'fa-shield-halved', className: 'protection' },
    { label: 'VOC', value: '', trend: 'Set in Settings', icon: 'fa-headset', className: 'voc' },
    { label: 'Instan Upgrade', value: '', trend: 'Set in Settings', icon: 'fa-bolt', className: 'upgrade' },
    { label: 'WhatsApp Channel', value: '', trend: 'Set in Settings', icon: 'fa-comment-dots', className: 'whatsapp' }
  ];

  const defaultModules = [
    { title: 'Dashboard', icon: 'fa-table-columns', description: 'Executive overview for the current month' },
    { title: 'KPI Detail', icon: 'fa-chart-simple', description: 'Daily, weekly, and monthly performance drilldown' },
    { title: 'Sales Performance', icon: 'fa-users', description: 'Advisor, supervisor, cashier, and service visibility' },
    { title: 'Monitoring', icon: 'fa-sliders', description: 'Flexible operational checks and escalations' }
  ];

  function getSharedDashboardSnapshot(monthKey = getSelectedMonth()) {
    try {
      const stored = localStorage.getItem('azko_dashboard_shared_snapshot');
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      if (!parsed || normalizeMonthKey(parsed.monthKey || parsed.selectedMonth) !== normalizeMonthKey(monthKey)) {
        return null;
      }
      return parsed;
    } catch (error) {
      return null;
    }
  }

  function syncDashboardMonthContent(monthKey = getSelectedMonth(), source = 'system') {
    const normalizedMonth = normalizeMonthKey(monthKey);
    const primaryItems = deduplicateKpiItems(
      getStoredItems('azko_dashboard_kpis', defaultKpis, normalizedMonth),
      defaultKpis,
      defaultSecondaryKpis.map(item => item.label)
    );
    const secondaryItems = deduplicateKpiItems(
      getStoredItems('azko_dashboard_secondary_kpis', defaultSecondaryKpis, normalizedMonth),
      defaultSecondaryKpis,
      defaultKpis.map(item => item.label)
    );

    saveItems('azko_dashboard_kpis', primaryItems, normalizedMonth);
    saveItems('azko_dashboard_secondary_kpis', secondaryItems, normalizedMonth);
    saveScopedString('azko_mading_content', loadScopedString('azko_mading_content', '', normalizedMonth), normalizedMonth);
    saveScopedString('azko_hero_eyebrow', loadScopedString('azko_hero_eyebrow', '', normalizedMonth), normalizedMonth);
    saveScopedString('azko_hero_description', loadScopedString('azko_hero_description', '', normalizedMonth), normalizedMonth);
    saveScopedString('azko_hero_text_scale', loadScopedString('azko_hero_text_scale', '1', normalizedMonth), normalizedMonth);
    persistSharedDashboardSnapshot(normalizedMonth, source);
    return { primaryItems, secondaryItems };
  }

  function persistSharedDashboardSnapshot(monthKey = getSelectedMonth(), source = 'admin') {
    const normalizedMonth = normalizeMonthKey(monthKey);
    const snapshot = {
      monthKey: normalizedMonth,
      selectedMonth: normalizedMonth,
      updatedAt: new Date().toISOString(),
      updatedBy: source,
      heroEyebrow: loadScopedString('azko_hero_eyebrow', '', normalizedMonth),
      heroDescription: loadScopedString('azko_hero_description', '', normalizedMonth),
      heroTextScale: loadScopedString('azko_hero_text_scale', '1', normalizedMonth),
      mading: loadScopedString('azko_mading_content', '', normalizedMonth),
      kpis: getStoredItems('azko_dashboard_kpis', defaultKpis, normalizedMonth),
      secondaryKpis: getStoredItems('azko_dashboard_secondary_kpis', defaultSecondaryKpis, normalizedMonth),
      modules: getStoredItems('azko_dashboard_modules', defaultModules, normalizedMonth)
    };
    localStorage.setItem('azko_dashboard_shared_snapshot', JSON.stringify(snapshot));
    localStorage.setItem('azko_dashboard_content_version', String(Date.now()));
    return snapshot;
  }

  function applySharedDashboardSnapshot(snapshot, monthKey = getSelectedMonth()) {
    if (!snapshot) return false;
    const normalizedMonth = normalizeMonthKey(monthKey);
    saveItems('azko_dashboard_kpis', Array.isArray(snapshot.kpis) ? snapshot.kpis : defaultKpis, normalizedMonth);
    saveItems('azko_dashboard_secondary_kpis', Array.isArray(snapshot.secondaryKpis) ? snapshot.secondaryKpis : defaultSecondaryKpis, normalizedMonth);
    saveItems('azko_dashboard_modules', Array.isArray(snapshot.modules) ? snapshot.modules : defaultModules, normalizedMonth);
    saveScopedString('azko_mading_content', snapshot.mading ?? '', normalizedMonth);
    saveScopedString('azko_hero_eyebrow', snapshot.heroEyebrow ?? '', normalizedMonth);
    saveScopedString('azko_hero_description', snapshot.heroDescription ?? '', normalizedMonth);
    saveScopedString('azko_hero_text_scale', String(snapshot.heroTextScale ?? '1'), normalizedMonth);
    return true;
  }

  function initializeDashboardMonthData(){
    const currentMonth = getSelectedMonth();
    const sharedSnapshot = getSharedDashboardSnapshot(currentMonth);
    const ensureMonthValue = (key, fallbackValue) => {
      if (!localStorage.getItem(getMonthScopedKey(key, currentMonth))) {
        localStorage.setItem(getMonthScopedKey(key, currentMonth), JSON.stringify(fallbackValue));
      }
    };

    ensureMonthValue('azko_dashboard_kpis', defaultKpis);
    ensureMonthValue('azko_dashboard_secondary_kpis', defaultSecondaryKpis);

    const sanitizedPrimary = deduplicateKpiItems(getStoredItems('azko_dashboard_kpis', defaultKpis, currentMonth), defaultKpis, defaultSecondaryKpis.map(item => item.label));
    const sanitizedSecondary = deduplicateKpiItems(getStoredItems('azko_dashboard_secondary_kpis', defaultSecondaryKpis, currentMonth), defaultSecondaryKpis, defaultKpis.map(item => item.label));
    saveItems('azko_dashboard_kpis', sanitizedPrimary, currentMonth);
    saveItems('azko_dashboard_secondary_kpis', sanitizedSecondary, currentMonth);
    ensureMonthValue('azko_dashboard_modules', defaultModules);
    if (!localStorage.getItem(getMonthScopedKey('azko_mading_content', currentMonth))) {
      localStorage.setItem(getMonthScopedKey('azko_mading_content', currentMonth), '');
    }
    if (!localStorage.getItem(getMonthScopedKey('azko_hero_eyebrow', currentMonth))) {
      localStorage.setItem(getMonthScopedKey('azko_hero_eyebrow', currentMonth), '');
    }
    if (!localStorage.getItem(getMonthScopedKey('azko_hero_description', currentMonth))) {
      localStorage.setItem(getMonthScopedKey('azko_hero_description', currentMonth), '');
    }
    if (!localStorage.getItem(getMonthScopedKey('azko_hero_text_scale', currentMonth))) {
      localStorage.setItem(getMonthScopedKey('azko_hero_text_scale', currentMonth), '1');
    }

    if (sharedSnapshot) {
      applySharedDashboardSnapshot(sharedSnapshot, currentMonth);
    }
    syncDashboardMonthContent(currentMonth, 'system');
    window.dispatchEvent(new Event('azko:content-updated'));
  }

  initializeDashboardMonthData();

  function getMonthKey(date = new Date()){
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  function normalizeMonthKey(monthKey){
    const value = String(monthKey || '').trim();
    if (!/^\d{4}-\d{2}$/.test(value)) return getMonthKey();
    return value;
  }

  function formatMonthLabel(monthKey){
    const normalized = normalizeMonthKey(monthKey);
    const [year, month] = normalized.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  }

  function getSelectedMonth(){
    const stored = localStorage.getItem('azko_dashboard_selected_month');
    if (stored) {
      return normalizeMonthKey(stored);
    }
    const currentMonth = getMonthKey();
    localStorage.setItem('azko_dashboard_selected_month', currentMonth);
    return currentMonth;
  }

  function setSelectedMonth(monthKey){
    const normalized = normalizeMonthKey(monthKey);
    localStorage.setItem('azko_dashboard_selected_month', normalized);
    return normalized;
  }

  function getMonthScopedKey(key, monthKey = getSelectedMonth()){
    return `${key}::${normalizeMonthKey(monthKey)}`;
  }

  function getStoredItems(key, fallback, monthKey = getSelectedMonth()){
    try {
      const storageKey = getMonthScopedKey(key, monthKey);
      const stored = localStorage.getItem(storageKey);
      if(!stored) {
        const legacy = localStorage.getItem(key);
        if (legacy) {
          const parsed = JSON.parse(legacy);
          if (Array.isArray(parsed)) {
            localStorage.setItem(storageKey, legacy);
            return parsed;
          }
        }
        const sharedSnapshot = getSharedDashboardSnapshot(monthKey);
        if (sharedSnapshot) {
          if (key === 'azko_dashboard_kpis') return Array.isArray(sharedSnapshot.kpis) ? sharedSnapshot.kpis : fallback;
          if (key === 'azko_dashboard_secondary_kpis') return Array.isArray(sharedSnapshot.secondaryKpis) ? sharedSnapshot.secondaryKpis : fallback;
          if (key === 'azko_dashboard_modules') return Array.isArray(sharedSnapshot.modules) ? sharedSnapshot.modules : fallback;
        }
        return fallback;
      }
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return fallback;
      if ((key === 'azko_dashboard_kpis' || key === 'azko_dashboard_secondary_kpis') && Array.isArray(fallback)) {
        const excludedLabels = key === 'azko_dashboard_kpis'
          ? defaultSecondaryKpis.map(item => item.label)
          : defaultKpis.map(item => item.label);
        return deduplicateKpiItems(parsed, fallback, excludedLabels);
      }
      return parsed;
    } catch (error) {
      return fallback;
    }
  }

  function saveItems(key, items, monthKey = getSelectedMonth()){
    const sanitizedItems = key === 'azko_dashboard_kpis' || key === 'azko_dashboard_secondary_kpis'
      ? deduplicateKpiItems(
          items,
          key === 'azko_dashboard_kpis' ? defaultKpis : defaultSecondaryKpis,
          key === 'azko_dashboard_kpis' ? defaultSecondaryKpis.map(item => item.label) : defaultKpis.map(item => item.label)
        )
      : items;
    localStorage.setItem(getMonthScopedKey(key, monthKey), JSON.stringify(sanitizedItems));
    persistSharedDashboardSnapshot(monthKey, 'admin');
  }

  function loadScopedString(key, fallback, monthKey = getSelectedMonth()){
    const storageKey = getMonthScopedKey(key, monthKey);
    const stored = localStorage.getItem(storageKey);
    if (stored === null) {
      const legacy = localStorage.getItem(key);
      if (legacy !== null) {
        localStorage.setItem(storageKey, legacy);
        return legacy;
      }
      const sharedSnapshot = getSharedDashboardSnapshot(monthKey);
      if (sharedSnapshot) {
        if (key === 'azko_mading_content') return sharedSnapshot.mading ?? fallback;
        if (key === 'azko_hero_eyebrow') return sharedSnapshot.heroEyebrow ?? fallback;
        if (key === 'azko_hero_description') return sharedSnapshot.heroDescription ?? fallback;
        if (key === 'azko_hero_text_scale') return String(sharedSnapshot.heroTextScale ?? '1');
      }
      localStorage.setItem(storageKey, fallback);
      return fallback;
    }
    return stored;
  }

  function saveScopedString(key, value, monthKey = getSelectedMonth()){
    localStorage.setItem(getMonthScopedKey(key, monthKey), String(value ?? ''));
    persistSharedDashboardSnapshot(monthKey, 'admin');
  }

  function normalizeKpiLabel(item) {
    return String(item?.label || '').trim().toLowerCase();
  }

  function deduplicateKpiItems(items, fallback, excludedLabels = []) {
    if (!Array.isArray(items)) return fallback.map(item => ({ ...item }));

    const excludedSet = new Set((excludedLabels || []).map(label => String(label || '').trim().toLowerCase()).filter(Boolean));
    const uniqueItems = [];
    const seenLabels = new Set();
    items.forEach(item => {
      const label = String(item?.label || '').trim();
      const normalizedLabel = label.toLowerCase();
      if (!label || seenLabels.has(normalizedLabel) || excludedSet.has(normalizedLabel)) return;
      seenLabels.add(normalizedLabel);
      uniqueItems.push({ ...item, label });
    });

    const merged = fallback.map(defaultItem => {
      const existing = uniqueItems.find(item => normalizeKpiLabel(item) === normalizeKpiLabel(defaultItem));
      return existing ? { ...defaultItem, ...existing } : { ...defaultItem };
    });
    const extras = uniqueItems.filter(item => !fallback.some(defaultItem => normalizeKpiLabel(defaultItem) === normalizeKpiLabel(item)));
    return merged.concat(extras).filter(item => String(item.label || '').trim());
  }

  function mergeKpiItems(items, fallback) {
    return deduplicateKpiItems(items, fallback);
  }

  function renderSecondaryKpis(){
    renderExecutiveSummary();
  }

  function refreshDashboardContent(){
    renderExecutiveSummary();
    renderModules();
    renderMading();
    updateGreeting();
    syncEditableHints();
  }

  window.addEventListener('azko:content-updated', refreshDashboardContent);
  window.addEventListener('storage', function(event){
    if (!event.key) return;
    if (event.key === 'azko_dashboard_content_version' || event.key.startsWith('azko_')) {
      refreshDashboardContent();
    }
  });
  window.addEventListener('focus', refreshDashboardContent);
  window.addEventListener('pageshow', refreshDashboardContent);
  document.addEventListener('visibilitychange', function(){
    if (document.visibilityState === 'visible') {
      refreshDashboardContent();
    }
  });

  function getActivityLog(){
    try {
      return JSON.parse(localStorage.getItem('azko_activity_log') || '[]');
    } catch (error) {
      return [];
    }
  }

  function saveActivityLog(entries){
    localStorage.setItem('azko_activity_log', JSON.stringify(entries));
  }

  function getUnreadNotificationCount(){
    return Number(localStorage.getItem('azko_notification_unread_count') || '0');
  }

  function setUnreadNotificationCount(count){
    localStorage.setItem('azko_notification_unread_count', String(Math.max(0, count)));
  }

  function addActivity(message){
    const log = getActivityLog();
    log.unshift({ message, time: new Date().toLocaleString() });
    saveActivityLog(log.slice(0, 10));
    setUnreadNotificationCount(getUnreadNotificationCount() + 1);
    renderActivityLog();
    updateNotificationsState();
  }

  function renderActivityLog(){
    const container = document.getElementById('activityLog');
    if (!container) return;
    const entries = getActivityLog();
    container.innerHTML = entries.length ? entries.map(item => `
      <div class="activity-item">
        <div>${item.message}</div>
        <div class="small text-muted">${item.time}</div>
      </div>
    `).join('') : '<div class="activity-item">No admin activity yet.</div>';
  }

  function getCurrentUserRole(){
    const currentUser = window.AZKOAuth && typeof window.AZKOAuth.getCurrentUser === 'function'
      ? window.AZKOAuth.getCurrentUser()
      : null;
    return currentUser?.role || 'user';
  }

  function updateTopbarUserRole(){
    const roleEl = document.getElementById('topbarUserRole');
    if (!roleEl) return;
    roleEl.textContent = getCurrentUserRole() === 'admin' ? 'Owner' : 'User';
  }

  function getCurrentDisplayName(){
    const currentUser = window.AZKOAuth && typeof window.AZKOAuth.getCurrentUser === 'function'
      ? window.AZKOAuth.getCurrentUser()
      : null;
    const rawName = currentUser?.name || currentUser?.username || 'Admin';
    return String(rawName).split(' ')[0];
  }

  function getDisplayScale(){
    const stored = localStorage.getItem('azko_display_scale');
    const parsed = Number(stored);
    if (!Number.isFinite(parsed)) return 1;
    return Math.min(2, Math.max(0.5, parsed));
  }

  function applyDisplayScale(scale = getDisplayScale()){
    const normalized = Number(scale);
    const safeScale = Number.isFinite(normalized) ? Math.min(2, Math.max(0.5, normalized)) : 1;
    const zoomValue = String(safeScale);
    document.documentElement.style.setProperty('--display-scale', zoomValue);
    document.body.style.zoom = zoomValue;
    document.body.setAttribute('data-display-scale', zoomValue);
    const select = document.getElementById('displayScaleSelect');
    if (select) {
      select.value = zoomValue;
    }
    return safeScale;
  }

  function initializeDisplayScale(){
    const select = document.getElementById('displayScaleSelect');
    if (select) {
      select.addEventListener('change', function(){
        const nextScale = Number(this.value);
        localStorage.setItem('azko_display_scale', String(nextScale));
        applyDisplayScale(nextScale);
      });
    }
    applyDisplayScale(getDisplayScale());
  }

  function updateNotificationsState(){
    const badge = document.querySelector('.notification-count');
    if (!badge) return;
    const count = getUnreadNotificationCount();
    badge.textContent = count > 99 ? '99+' : String(count);
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  }

  function showNotifications(){
    const notifications = getActivityLog().slice(0, 5);
    if (!notifications.length) {
      alert('No new notifications');
      return;
    }
    const message = notifications.map((item, idx) => `${idx + 1}. ${item.message} (${item.time})`).join('\n\n');
    alert(`Recent notifications:\n\n${message}`);
    setUnreadNotificationCount(0);
    updateNotificationsState();
  }

  function filterDashboardSearch(query){
    const normalized = String(query || '').trim().toLowerCase();
    const kpiCards = document.querySelectorAll('.kpi-card');
    const moduleCards = document.querySelectorAll('.module-card');
    let anyVisible = false;

    kpiCards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const match = !normalized || text.includes(normalized);
      card.style.display = match ? '' : 'none';
      card.classList.toggle('search-match', normalized && match);
      if (match) anyVisible = true;
    });

    moduleCards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const match = !normalized || text.includes(normalized);
      card.style.display = match ? '' : 'none';
      card.classList.toggle('search-match', normalized && match);
      if (match) anyVisible = true;
    });

    const noResults = document.getElementById('searchNoResultsMessage');
    if (noResults) {
      noResults.style.display = !anyVisible && normalized ? 'block' : 'none';
    }
  }

  function getAutomaticGreeting(){
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${greeting}, ${getCurrentDisplayName()}`;
  }

  function updateGreeting(){
    const greetingEl = document.getElementById('heroGreeting');
    if (!greetingEl) return;
    greetingEl.textContent = getAutomaticGreeting();
  }

  function escapeHtml(value){
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function loadMadingContent(){
    const defaultMadingContent = 'Selamat datang di AZKO LOTTE MALL. Info penting dan update cepat hadir di sini. BISA DIEDIT OLEH ADMIN';
    const storedValue = loadScopedString('azko_mading_content', defaultMadingContent);
    const legacyValues = [
      'Selamat datang di AZKO LOTTE MALL. Informasi dan pengumuman penting akan ditampilkan di sini. Hanya admin yang dapat mengubah konten ini.',
      'Selamat datang di AZKO LOTTE MALL. Info penting dan update cepat hadir di sini.',
      'Selamat datang di AZKO LOTTE MALL. Info penting dan update cepat hadir di sini. Bisa diedit oleh admin.'
    ];
    if (legacyValues.includes(storedValue) || storedValue.includes('Informasi dan pengumuman penting') || storedValue.includes('Hanya admin')) {
      saveScopedString('azko_mading_content', defaultMadingContent);
      return defaultMadingContent;
    }

    return storedValue;
  }

  function saveMadingContent(text){
    saveScopedString('azko_mading_content', text);
  }

  function loadHeroEyebrowContent(){
    return loadScopedString('azko_hero_eyebrow', 'Welcome to AZKO Lotte Mall 👋');
  }

  function saveHeroEyebrowContent(text){
    saveScopedString('azko_hero_eyebrow', text || 'Welcome to AZKO Lotte Mall 👋');
  }

  function loadHeroGreetingContent(){
    return getAutomaticGreeting();
  }

  function saveHeroGreetingContent(){
    // Greeting is generated automatically from the current time.
  }

  function loadHeroDescriptionContent(){
    return loadScopedString('azko_hero_description', 'Orang yang peduli dengan pekerjaannya selalu tahu targetnya, karena setiap pencapaian dimulai dari kesadaran.');
  }

  function saveHeroDescriptionContent(text){
    saveScopedString('azko_hero_description', text);
  }

  function loadHeroTextScale(){
    const stored = loadScopedString('azko_hero_text_scale', '1');
    return Number(stored) || 1;
  }

  function saveHeroTextScale(value){
    saveScopedString('azko_hero_text_scale', String(value));
  }

  function syncEditableHints(){
    const canEdit = isAdminUser() && getAdminMode();
    document.querySelectorAll('.editable-hero, .editable-news, .editable-card').forEach(element => {
      element.classList.toggle('is-editable', canEdit);
      const hint = element.querySelector('.edit-hint');
      if (hint) {
        hint.style.display = canEdit ? 'inline-flex' : 'none';
      }
    });
  }

  function renderMading(){
    const preview = document.getElementById('heroMadingPreview');
    const heroEyebrow = document.getElementById('heroEyebrow');
    const heroGreeting = document.getElementById('heroGreeting');
    const heroDesc = document.getElementById('heroDescriptionText');
    const heroBubble = document.getElementById('heroBubble');
    const textarea = document.getElementById('madingTextareaAdmin');
    const heroEyebrowInput = document.getElementById('heroEyebrowTextareaAdmin');
    const heroTextarea = document.getElementById('heroDescriptionTextareaAdmin');
    const textScaleRange = document.getElementById('heroTextScaleRange');
    const textScaleLabel = document.getElementById('heroTextScaleLabel');
    const countLabel = document.getElementById('madingCountAdmin');
    const content = loadMadingContent();
    const eyebrowContent = loadHeroEyebrowContent();
    const greetingContent = loadHeroGreetingContent();
    const heroContent = loadHeroDescriptionContent();
    const textScale = loadHeroTextScale();

    if (heroEyebrow) {
      heroEyebrow.textContent = eyebrowContent;
    }
    if (heroGreeting) {
      heroGreeting.textContent = greetingContent;
    }
    if (heroDesc) {
      heroDesc.textContent = heroContent;
    }
    if (heroBubble) {
      heroBubble.style.setProperty('--hero-scale', textScale);
    }
    syncEditableHints();
    if (preview) {
      const previewText = content.length > 0 ? content : 'Selamat datang di AZKO LOTTE MALL. Info penting dan update cepat hadir di sini. BISA DIEDIT OLEH ADMIN';
      preview.innerHTML = escapeHtml(previewText).replace(/\n/g, '<br>');
    }
    if (textarea) {
      textarea.value = content;
      const words = content.trim().split(/\s+/).filter(Boolean).length;
      if (countLabel) countLabel.textContent = `${words} kata`;
    }
    if (heroEyebrowInput) {
      heroEyebrowInput.value = eyebrowContent;
    }
    if (heroTextarea) {
      heroTextarea.value = heroContent;
    }
    if (textScaleRange) {
      textScaleRange.value = String(textScale);
    }
    if (textScaleLabel) {
      textScaleLabel.textContent = `${Math.round(textScale * 100)}%`;
    }
  }

  function getSnapshots(){
    try {
      return JSON.parse(localStorage.getItem('azko_dashboard_snapshots') || '[]');
    } catch (error) {
      return [];
    }
  }

  function saveSnapshots(items){
    localStorage.setItem('azko_dashboard_snapshots', JSON.stringify(items));
  }

  function renderSnapshots(){
    const container = document.getElementById('snapshotList');
    if (!container) return;
    const snapshots = getSnapshots();
    container.innerHTML = snapshots.length ? snapshots.map((snapshot, index) => `
      <div class="snapshot-item">
        <div class="fw-semibold">${snapshot.name}</div>
        <div class="small">${snapshot.time}</div>
        <div class="d-flex gap-2 mt-2">
          <button class="btn btn-outline-secondary btn-sm" type="button" data-restore-snapshot="${index}">Restore</button>
        </div>
      </div>
    `).join('') : '<div class="snapshot-item">No snapshots yet.</div>';
  }

  function saveCurrentSnapshot(){
    const snapshots = getSnapshots();
    const name = window.prompt('Name this snapshot', `Snapshot ${snapshots.length + 1}`);
    if (name === null) return;
    snapshots.unshift({
      name,
      time: new Date().toLocaleString(),
      kpis: getStoredItems('azko_dashboard_kpis', defaultKpis),
      modules: getStoredItems('azko_dashboard_modules', defaultModules),
      theme: document.documentElement.getAttribute('data-theme') || 'light'
    });
    saveSnapshots(snapshots.slice(0, 8));
    renderSnapshots();
    addActivity(`Saved snapshot: ${name}`);
  }

  function restoreSnapshot(index){
    const snapshots = getSnapshots();
    const snapshot = snapshots[index];
    if (!snapshot) return;
    saveItems('azko_dashboard_kpis', snapshot.kpis || defaultKpis);
    saveItems('azko_dashboard_modules', snapshot.modules || defaultModules);
    if (snapshot.theme) applyTheme(snapshot.theme);
    addActivity(`Restored snapshot: ${snapshot.name}`);
    renderExecutiveSummary();
    renderModules();
    renderSnapshots();
  }

  let editorState = null;

  function openEditorModal(type, item, index){
    editorState = { type, index, item };
    const title = document.getElementById('editorModalTitle');
    const fields = document.getElementById('editorFields');
    const backdrop = document.getElementById('editorModalBackdrop');
    const modal = document.getElementById('editorModal');
    if (!title || !fields || !backdrop || !modal) return;

    if (type === 'hero') {
      title.textContent = 'Edit hero content';
      fields.innerHTML = `
        <label class="form-label">Eyebrow</label>
        <input class="form-control" id="editorEyebrow" value="${(item.eyebrow || '').replace(/"/g, '&quot;')}" />
        <div class="small text-muted mt-2">Greeting is generated automatically based on the current time.</div>
        <label class="form-label">Description</label>
        <textarea class="form-control" id="editorDescription" rows="4">${(item.description || '').replace(/"/g, '&quot;')}</textarea>
        <label class="form-label">Text size</label>
        <input class="form-range" id="editorTextScale" type="range" min="0.8" max="1.4" step="0.05" value="${item.scale || 1}">
      `;
    } else if (type === 'mading') {
      title.textContent = "Edit today's news";
      fields.innerHTML = `
        <label class="form-label">Today's news</label>
        <textarea class="form-control" id="editorMading" rows="6">${(item.text || '').replace(/"/g, '&quot;')}</textarea>
      `;
    } else if (type === 'kpi' || type === 'secondary-kpi') {
      title.textContent = type === 'kpi' ? 'Edit KPI card' : 'Edit KPI card';
      const isNumericKpi = ['VOC', 'Instan Upgrade', 'Transaksi & CR'].includes(String(item.label || '').trim());
      fields.innerHTML = `
        <label class="form-label">Label</label>
        <input class="form-control" id="editorLabel" value="${(item.label || '').replace(/"/g, '&quot;')}" />
        <label class="form-label">Value</label>
        <input class="form-control" id="editorValue" type="text" placeholder="Contoh: 2500000000, 85%, atau teks bebas" value="${(item.value || '').replace(/"/g, '&quot;')}" />
        <label class="form-label">Trend</label>
        <input class="form-control" id="editorTrend" value="${(item.trend || '').replace(/"/g, '&quot;')}" />
        <label class="form-label">Icon class</label>
        <input class="form-control" id="editorIcon" value="${(item.icon || 'fa-chart-line').replace(/"/g, '&quot;')}" />
        <label class="form-label">Color</label>
        <select class="form-select" id="editorColor">
          <option value="sales" ${item.className === 'sales' ? 'selected' : ''}>Sales</option>
          <option value="review" ${item.className === 'review' ? 'selected' : ''}>Review</option>
          <option value="member" ${item.className === 'member' ? 'selected' : ''}>Member</option>
          <option value="whatsapp" ${item.className === 'whatsapp' ? 'selected' : ''}>WhatsApp</option>
          <option value="upgrade" ${item.className === 'upgrade' ? 'selected' : ''}>Upgrade</option>
          <option value="achievement" ${item.className === 'achievement' ? 'selected' : ''}>Achievement</option>
          <option value="traffic" ${item.className === 'traffic' ? 'selected' : ''}>Traffic</option>
          <option value="transactions" ${item.className === 'transactions' ? 'selected' : ''}>Transactions</option>
          <option value="protection" ${item.className === 'protection' ? 'selected' : ''}>Protection</option>
          <option value="voc" ${item.className === 'voc' ? 'selected' : ''}>VOC</option>
        </select>
      `;
    } else {
      title.textContent = 'Edit module card';
      fields.innerHTML = `
        <label class="form-label">Title</label>
        <input class="form-control" id="editorTitle" value="${(item.title || '').replace(/"/g, '&quot;')}" />
        <label class="form-label">Description</label>
        <input class="form-control" id="editorDescription" value="${(item.description || '').replace(/"/g, '&quot;')}" />
        <label class="form-label">Icon class</label>
        <input class="form-control" id="editorIcon" value="${(item.icon || 'fa-cubes').replace(/"/g, '&quot;')}" />
      `;
    }

    backdrop.hidden = false;
    modal.hidden = false;
  }

  function closeEditorModal(){
    const backdrop = document.getElementById('editorModalBackdrop');
    const modal = document.getElementById('editorModal');
    if (backdrop) backdrop.hidden = true;
    if (modal) modal.hidden = true;
    editorState = null;
  }

  function saveEditorModal(e){
    e.preventDefault();
    if (!editorState) return;
    if (editorState.type === 'hero') {
      const eyebrow = document.getElementById('editorEyebrow').value.trim();
      const description = document.getElementById('editorDescription').value.trim();
      const scale = Number(document.getElementById('editorTextScale').value || 1);
      saveHeroEyebrowContent(eyebrow || loadHeroEyebrowContent());
      saveHeroGreetingContent();
      saveHeroDescriptionContent(description || loadHeroDescriptionContent());
      saveHeroTextScale(scale || 1);
      renderMading();
      addActivity('Updated hero content');
    } else if (editorState.type === 'mading') {
      const text = document.getElementById('editorMading').value.trim();
      saveMadingContent(text || loadMadingContent());
      renderMading();
      addActivity("Updated today's news");
    } else if (editorState.type === 'kpi' || editorState.type === 'secondary-kpi') {
      const label = document.getElementById('editorLabel').value.trim();
      const value = document.getElementById('editorValue').value.trim();
      const trend = document.getElementById('editorTrend').value.trim();
      const icon = document.getElementById('editorIcon').value.trim();
      const className = document.getElementById('editorColor').value;
      if (editorState.type === 'kpi') {
        const kpis = getStoredItems('azko_dashboard_kpis', defaultKpis);
        const target = kpis[editorState.index];
        if (target) {
          target.label = label || target.label;
          target.value = value || target.value;
          target.trend = trend || target.trend;
          target.icon = icon || target.icon;
          target.className = className || target.className;
          saveItems('azko_dashboard_kpis', kpis);
          addActivity(`Updated KPI: ${target.label}`);
          renderExecutiveSummary();
        }
      } else {
        const kpis = getStoredItems('azko_dashboard_secondary_kpis', defaultSecondaryKpis);
        const target = kpis[editorState.index];
        if (target) {
          target.label = label || target.label;
          target.value = value || target.value;
          target.trend = trend || target.trend;
          target.icon = icon || target.icon;
          target.className = className || target.className;
          saveItems('azko_dashboard_secondary_kpis', kpis);
          addActivity(`Updated KPI: ${target.label}`);
          renderSecondaryKpis();
        }
      }
    } else {
      const title = document.getElementById('editorTitle').value.trim();
      const description = document.getElementById('editorDescription').value.trim();
      const icon = document.getElementById('editorIcon').value.trim();
      const modules = getStoredItems('azko_dashboard_modules', defaultModules);
      const target = modules[editorState.index];
      if (target) {
        target.title = title || target.title;
        target.description = description || target.description;
        target.icon = icon || target.icon;
        saveItems('azko_dashboard_modules', modules);
        addActivity(`Updated module: ${target.title}`);
        renderModules();
      }
    }
    closeEditorModal();
  }

  function isAdminUser(){
    return window.AZKOAuth && typeof window.AZKOAuth.isAdmin === 'function' ? window.AZKOAuth.isAdmin() : false;
  }

  function getAdminMode(){
    if (!isAdminUser()) return false;
    const saved = localStorage.getItem('azko_admin_mode');
    if (saved === 'off') return false;
    return true;
  }

  function setAdminMode(value){
    if (!isAdminUser()) return;
    localStorage.setItem('azko_admin_mode', value ? 'on' : 'off');
  }

  function populateMonthSelector(){
    const trigger = document.getElementById('dashboardMonthTrigger');
    const triggerLabel = document.getElementById('dashboardMonthTriggerLabel');
    const optionsContainer = document.getElementById('dashboardMonthOptions');
    const popover = document.getElementById('dashboardMonthPopover');
    const caption = document.getElementById('dashboardMonthCaption');
    if (!trigger || !triggerLabel || !optionsContainer) return;

    const months = [];
    const start = new Date(2026, 4, 1);
    const end = new Date(2028, 11, 1);
    for (let current = new Date(start); current <= end; current.setMonth(current.getMonth() + 1)) {
      const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      months.push({ key, label: formatMonthLabel(key) });
    }

    const currentValue = getSelectedMonth();
    optionsContainer.innerHTML = months.map(item => `
      <button type="button" class="month-picker-option ${item.key === currentValue ? 'active' : ''}" data-month="${item.key}">
        ${item.label}
      </button>
    `).join('');

    const selectedMonthLabel = formatMonthLabel(currentValue);
    triggerLabel.textContent = selectedMonthLabel;
    if (caption) {
      caption.textContent = `Data untuk ${selectedMonthLabel}`;
    }

    Array.from(optionsContainer.querySelectorAll('.month-picker-option')).forEach(button => {
      button.addEventListener('click', function() {
        const selectedMonth = this.getAttribute('data-month');
        if (!selectedMonth) return;
        setSelectedMonth(selectedMonth);
        syncDashboardMonthContent(selectedMonth, 'admin');
        populateMonthSelector();
        if (popover) popover.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
        refreshDashboardContent();
      });
    });
  }

  function updateClock(){
    const el = document.getElementById('liveDateTime');
    if(!el) return;
    const now = new Date();
    el.textContent = now.toLocaleString('en-US', { weekday:'short', month:'short', day:'numeric', hour:'numeric', minute:'2-digit' });
  }

  function applyTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('azko_theme', theme);
    const icon = document.querySelector('#themeToggle i');
    if(icon){ icon.className = theme === 'dark' ? 'fa fa-sun' : 'fa fa-moon'; }
  }

  function initTheme(){
    const saved = localStorage.getItem('azko_theme') || 'light';
    applyTheme(saved);
    const toggle = document.getElementById('themeToggle');
    if(toggle){
      toggle.addEventListener('click', function(){
        const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      });
    }
  }

  function getStoredBrandLogo() {
    return localStorage.getItem('azko_brand_logo');
  }

  function applyBrandLogoImage(root) {
    if (!root) return;
    const logo = getStoredBrandLogo();
    const images = root.querySelectorAll('.azko-brand-logo');
    images.forEach(img => {
      img.src = logo || 'assets/icons/AZKO LOGO.png';
    });
  }

  function applyBrandLogoToComponents() {
    applyBrandLogoImage(document.getElementById('sidebar'));
    applyBrandLogoImage(document.getElementById('topnav'));
  }

  const defaultSidebarHtml = `
    <div class="sidebar-brand mb-4 text-center">
      <button id="sidebarCollapseBtn" class="btn btn-sm btn-outline-light mb-3">Toggle menu</button>
      <div class="brand-card p-3 rounded-4 d-inline-block">
        <img id="sidebarBrandLogo" src="assets/icons/AZKO LOGO.png" alt="AZKO logo" class="azko-brand-logo rounded-circle" style="display:block;margin:0 auto 10px;filter:drop-shadow(0 6px 12px rgba(0,0,0,0.18));">
        <h5 class="mb-1 fw-bold" style="letter-spacing:0.04em;">AZKO</h5>
        <div class="brand-subtitle">LOTTE MALL</div>
        <small class="d-block mt-2" style="color:#f8c9c9;opacity:0.92;">Store Performance Dashboard</small>
      </div>
    </div>
    <ul class="nav flex-column h-100">
      <li class="nav-item"><a class="nav-link text-white" href="dashboard.html"><i class="fa fa-home me-2"></i><span class="nav-text">Dashboard</span></a></li>
      <li class="nav-item"><a class="nav-link text-white" href="monitoring.html"><i class="fa fa-chart-line me-2"></i><span class="nav-text">Monitoring</span></a></li>
      <li class="nav-item"><a class="nav-link text-white" href="settings.html"><i class="fa fa-cog me-2"></i><span class="nav-text">Settings</span></a></li>
      <li class="nav-item"><a class="nav-link text-white" href="learning.html"><i class="fa fa-graduation-cap me-2"></i><span class="nav-text">Learning</span></a></li>
      <li class="nav-item"><a class="nav-link text-white" href="promo.html"><i class="fa fa-tags me-2"></i><span class="nav-text">Info Promo</span></a></li>
      <li class="nav-item"><a class="nav-link text-white" href="customer-service.html"><i class="fa fa-headset me-2"></i><span class="nav-text">Customer Service</span></a></li>
      <li class="nav-item"><a class="nav-link text-white" id="logoutBtn" href="#"><i class="fa fa-sign-out-alt me-2"></i><span class="nav-text">Logout</span></a></li>
    </ul>`;

  const defaultTopnavHtml = `
    <nav class="d-flex align-items-center justify-content-between p-3 topbar-shell">
      <div class="d-flex align-items-center gap-3">
        <button class="btn btn-sm btn-outline-secondary" id="menuToggle" type="button"><i class="fa fa-bars"></i></button>
        <div class="input-group d-none d-md-flex topbar-search">
          <span class="input-group-text bg-transparent border-0"><i class="fa fa-search"></i></span>
          <input id="topbarSearchInput" class="form-control form-control-sm" placeholder="Search widgets, stores, products...">
          <button class="btn btn-sm btn-outline-secondary" id="searchClearBtn" type="button" title="Clear search"><i class="fa fa-times"></i></button>
        </div>
      </div>
      <div class="d-flex align-items-center gap-2 flex-wrap">
        <div class="topbar-pill live-clock-pill" id="liveDateTime">--</div>
        <button class="btn btn-sm btn-outline-secondary" id="themeToggle" title="Toggle theme"><i class="fa fa-moon"></i></button>
        <div class="position-relative">
          <button class="btn btn-sm btn-outline-secondary" id="notificationBtn" title="View notifications"><i class="fa fa-bell"></i></button>
          <span class="notification-count badge bg-danger position-absolute top-0 start-100 translate-middle">0</span>
        </div>
        <button class="btn btn-sm btn-outline-secondary" id="chatBtn" title="Chat admin via WhatsApp"><i class="fa fa-comment-dots"></i></button>
        <div class="dropdown">
          <a href="#" class="d-flex align-items-center text-decoration-none topbar-user" data-bs-toggle="dropdown">
            <img id="topnavBrandLogo" src="assets/icons/AZKO LOGO.png" alt="AZKO icon" width="42" height="42" class="azko-brand-logo rounded-circle me-2" style="background:#fff;padding:4px;object-fit:contain;box-shadow:0 6px 14px rgba(0,0,0,0.16);">
            <div>
              <div class="fw-semibold" id="topbarUserRole">Admin</div>
            </div>
          </a>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><a class="dropdown-item" href="#">Profile</a></li>
            <li><a class="dropdown-item" href="#" id="logoutBtn">Logout</a></li>
          </ul>
        </div>
      </div>
    </nav>`;

  function loadComponentMarkup(containerId, componentPath, fallbackHtml) {
    const container = document.getElementById(containerId);
    if (!container) return Promise.resolve(false);

    const url = new URL(componentPath, window.location.href);
    return fetch(url, { cache: 'no-store' })
      .then(response => {
        if (!response.ok) throw new Error('Component load failed');
        return response.text();
      })
      .catch(() => fallbackHtml)
      .then(html => {
        container.innerHTML = html;
        return true;
      });
  }

  window.applyAzkoBrandLogo = applyBrandLogoToComponents;

  // Load sidebar and topnav components
  const sidebarPromise = loadComponentMarkup('sidebar', 'assets/components/sidebar.html', defaultSidebarHtml).then(loaded => {
    if (!loaded) return;
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      const isAdmin = window.AZKOAuth && typeof window.AZKOAuth.isAdmin === 'function' ? window.AZKOAuth.isAdmin() : false;
      if (!isAdmin) {
        const settingsLink = sidebar.querySelector('a[href="settings.html"]');
        if (settingsLink) {
          const listItem = settingsLink.closest('li');
          if (listItem) listItem.remove();
        }
      }
      applyBrandLogoImage(sidebar);
    }
  });

  const topnavPromise = loadComponentMarkup('topnav', 'assets/components/topnav.html', defaultTopnavHtml).then(() => {
    const topnav = document.getElementById('topnav');
    if (topnav) {
      applyBrandLogoImage(topnav);
    }
  });

  Promise.all([sidebarPromise, topnavPromise]).then(()=>{
    updateClock();
    setInterval(updateClock, 60000);
    initTheme();
    initializeDisplayScale();
    updateTopbarUserRole();
    updateNotificationsState();

    const searchInput = document.getElementById('topbarSearchInput') || document.querySelector('.topbar-search input');
    const searchClearBtn = document.getElementById('searchClearBtn');
    if (searchInput) {
      searchInput.addEventListener('input', function(e){ filterDashboardSearch(e.target.value); });
      searchInput.addEventListener('keypress', function(e){ if (e.key === 'Enter') e.preventDefault(); });
    }
    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', function(){
        if (!searchInput) return;
        searchInput.value = '';
        filterDashboardSearch('');
        searchInput.focus();
      });
    }

    if (searchInput && searchInput.value.trim()) {
      filterDashboardSearch(searchInput.value.trim());
    }

    const notificationBtn = document.getElementById('notificationBtn');
    if (notificationBtn) {
      notificationBtn.addEventListener('click', showNotifications);
    }

    const chatBtn = document.getElementById('chatBtn');
    if (chatBtn) {
      chatBtn.addEventListener('click', function(){
        window.open('https://wa.me/6281912119021?text=Halo%20Admin%20AZKO', '_blank');
      });
    }

    attachShellInteractions();
  });

  // Wire logout buttons
  document.body.addEventListener('click', function(e){
    if(e.target && (e.target.id === 'logoutBtn' || e.target.closest && e.target.closest('#logoutBtn'))){
      window.AZKOAuth.logout();
    }
  });

  function attachShellInteractions(){
    const sidebar = document.querySelector('.sidebar');
    const main = document.querySelector('.main') || document.querySelector('.main-panel');
    const topnavToggle = document.getElementById('menuToggle');
    const sidebarCollapseBtn = document.getElementById('sidebarCollapseBtn');
    const backdrop = document.createElement('div');
    backdrop.className = 'mobile-drawer-backdrop';
    document.body.appendChild(backdrop);

    if (!sidebar || !main) return;

    const collapsedClass = 'sidebar-collapsed';
    const saved = localStorage.getItem('azko_sidebar_state');
    if (saved === 'collapsed') {
      sidebar.classList.add(collapsedClass);
    }

    function closeMobileDrawer(){
      if (window.innerWidth <= 991) {
        sidebar.style.transform = 'translateX(-100%)';
        backdrop.classList.remove('show');
      }
    }

    function openMobileDrawer(){
      if (window.innerWidth <= 991) {
        sidebar.style.transform = 'translateX(0)';
        backdrop.classList.add('show');
      }
    }

    function toggleSidebar(){
      if (window.innerWidth <= 991) {
        if (sidebar.style.transform === 'translateX(0px)' || sidebar.style.transform === 'translateX(0)') {
          closeMobileDrawer();
        } else {
          openMobileDrawer();
        }
        return;
      }
      sidebar.classList.toggle(collapsedClass);
      if (sidebar.classList.contains(collapsedClass)) {
        sidebar.style.transform = 'translateX(0)';
      } else {
        sidebar.style.transform = 'translateX(0)';
      }
      localStorage.setItem('azko_sidebar_state', sidebar.classList.contains(collapsedClass) ? 'collapsed' : 'expanded');
    }

    if (topnavToggle) {
      topnavToggle.addEventListener('click', toggleSidebar);
    }
    if (sidebarCollapseBtn) {
      sidebarCollapseBtn.addEventListener('click', toggleSidebar);
    }

    backdrop.addEventListener('click', closeMobileDrawer);

    window.addEventListener('resize', function(){
      if (window.innerWidth > 991) {
        sidebar.style.transform = 'translateX(0)';
        backdrop.classList.remove('show');
      } else {
        if (!sidebar.classList.contains(collapsedClass)) {
          sidebar.style.transform = 'translateX(-100%)';
        }
      }
    });

    document.body.addEventListener('click', function(e){
      if (window.innerWidth > 991) return;
      if (!sidebar.contains(e.target) && !topnavToggle?.contains(e.target) && !sidebarCollapseBtn?.contains(e.target)) {
        closeMobileDrawer();
      }
    });
  }

  function parseNumericValue(value){
    if (value == null) return NaN;
    const raw = String(value).trim().replace(/IDR|Rp/gi, '').replace(/\s+/g, '');
    const normalized = raw.replace(/\./g, '').replace(/,/g, '.');
    const numeric = Number(normalized);
    return Number.isNaN(numeric) ? NaN : numeric;
  }

  function formatCurrencyValue(value){
    const numeric = parseNumericValue(value);
    if (Number.isNaN(numeric)) return String(value ?? '');
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(numeric);
  }

  async function renderExecutiveSummary(){
    const container = document.getElementById('overviewKpis');
    if (!container) return;

    const primaryKpis = mergeKpiItems(getStoredItems('azko_dashboard_kpis', defaultKpis), defaultKpis).map(item => {
      const result = { ...item };
      const rawValue = String(item.value ?? '').trim();
      if (!rawValue) {
        result.value = 'Set in Settings';
      } else if (item.label === 'Sales Total (MTD)') {
        result.value = formatCurrencyValue(rawValue);
      } else {
        result.value = rawValue;
      }
      result.trend = result.trend || 'Set in Settings';
      return result;
    });
    const secondaryKpis = mergeKpiItems(getStoredItems('azko_dashboard_secondary_kpis', defaultSecondaryKpis), defaultSecondaryKpis).map(item => {
      const result = { ...item };
      const rawValue = String(item.value ?? '').trim();
      if (!rawValue) {
        result.value = 'Set in Settings';
      } else if (item.label === 'Sales Total (MTD)') {
        result.value = formatCurrencyValue(rawValue);
      } else {
        result.value = rawValue;
      }
      result.trend = result.trend || 'Set in Settings';
      return result;
    });
    const kpis = deduplicateKpiItems(primaryKpis.concat(secondaryKpis), []).filter(Boolean);
    const adminMode = getAdminMode();
    const canEdit = adminMode && isAdminUser();

    container.innerHTML = kpis.map((kpi, index) => `
      <div class="kpi-card ${canEdit ? 'editable-card' : ''}" draggable="${canEdit ? 'true' : 'false'}" data-kind="kpi" data-index="${index}">
        ${canEdit ? `
          <span class="edit-hint">Click to edit</span>
          <div class="card-actions">
            <button class="card-action-btn" data-action="edit-kpi" data-index="${index}" title="Edit KPI"><i class="fa fa-pencil"></i></button>
            <button class="card-action-btn" data-action="duplicate-kpi" data-index="${index}" title="Duplicate KPI"><i class="fa fa-copy"></i></button>
            <button class="card-action-btn danger" data-action="remove-kpi" data-index="${index}" title="Remove KPI"><i class="fa fa-xmark"></i></button>
          </div>
        ` : ''}
        <div class="kpi-head">
          <div>
            <div class="kpi-label">${kpi.label}</div>
            <div class="kpi-value">${kpi.value}</div>
            <div class="kpi-trend">${kpi.trend}</div>
          </div>
          <div class="kpi-icon ${kpi.className || 'sales'}"><i class="fa ${kpi.icon || 'fa-chart-line'}"></i></div>
        </div>
      </div>
    `).join('');
    syncEditableHints();
  }

  async function renderModules(){
    const container = document.getElementById('moduleGrid');
    if (!container) return;

    const modules = getStoredItems('azko_dashboard_modules', defaultModules);
    const adminMode = getAdminMode();
    const canEdit = adminMode && isAdminUser();

    container.innerHTML = modules.map((module, index) => `
      <div class="module-card ${canEdit ? 'editable-card' : ''}" data-kind="module" data-index="${index}" draggable="${canEdit ? 'true' : 'false'}">
        ${canEdit ? `
          <span class="edit-hint">Click to edit</span>
          <div class="card-actions">
            <button class="card-action-btn" data-action="edit-module" data-index="${index}" title="Edit module"><i class="fa fa-pencil"></i></button>
            <button class="card-action-btn" data-action="duplicate-module" data-index="${index}" title="Duplicate module"><i class="fa fa-copy"></i></button>
            <button class="card-action-btn danger" data-action="remove-module" data-index="${index}" title="Remove module"><i class="fa fa-xmark"></i></button>
          </div>
        ` : ''}
        <i class="fa ${module.icon || 'fa-cubes'}"></i>
        <h4>${module.title}</h4>
        <p>${module.description}</p>
      </div>
    `).join('');
  }

  async function renderFocusList(){
    const container = document.getElementById('focusList');
    if (!container) return;

    const items = [
      { title: 'Protect bundles', detail: 'Boost attachment rate before evening peak' },
      { title: 'Service window', detail: 'Target 4PM–6PM for conversion uplift' },
      { title: 'Member acquisition', detail: 'Re-engage store visitors through WhatsApp' }
    ];

    container.innerHTML = items.map(item => `
      <div class="focus-item">
        <strong>${item.title}</strong>
        <span>${item.detail}</span>
      </div>
    `).join('');
  }

  async function renderLeaderboard(){
    const container = document.getElementById('leaderboard');
    if (!container) return;

    let data = {};
    try {
      const response = await fetch('assets/data/monitoring-data.json');
      data = await response.json();
    } catch (error) {
      console.warn('Could not load leaderboard data', error);
    }

    const items = (data.advisors || []).slice(0, 5);
    container.innerHTML = items.map((item, index) => `
      <div class="leaderboard-item">
        <div>
          <div class="name">#${index + 1} ${item.name}</div>
          <div class="meta">${item.position} • ${item.team}</div>
        </div>
        <div class="d-flex align-items-center gap-2">
          <span class="badge-pill">${item.achievement}%</span>
          <span class="badge-pill">${item.trend}</span>
        </div>
      </div>
    `).join('');
  }

  function syncAdminUI(){
    const adminControls = document.getElementById('adminControls');
    const adminEditorPanel = document.getElementById('adminEditorPanel');
    const toggleBtn = document.getElementById('toggleAdminModeBtn');
    const isAdmin = isAdminUser();

    if (adminControls) {
      adminControls.classList.toggle('d-none', !isAdmin);
    }

    if (toggleBtn) {
      toggleBtn.textContent = getAdminMode() ? 'Disable edit mode' : 'Enable edit mode';
    }

    if (adminEditorPanel) {
      adminEditorPanel.classList.toggle('d-none', !getAdminMode() || !isAdmin);
    }
    syncEditableHints();
  }

  let dragState = null;

  document.body.addEventListener('click', function(e){
    const target = e.target.closest('[data-action]');
    if (target) {
      e.stopPropagation();
      const action = target.dataset.action;
      const index = Number(target.dataset.index || 0);

      if (action === 'remove-kpi') {
        const kpis = getStoredItems('azko_dashboard_kpis', defaultKpis);
        kpis.splice(index, 1);
        saveItems('azko_dashboard_kpis', kpis);
        addActivity('Removed KPI card');
        renderExecutiveSummary();
        return;
      }

      if (action === 'duplicate-kpi') {
        const kpis = getStoredItems('azko_dashboard_kpis', defaultKpis);
        const item = kpis[index];
        if (!item) return;
        kpis.splice(index + 1, 0, { ...item, label: `${item.label} copy` });
        saveItems('azko_dashboard_kpis', kpis);
        addActivity(`Duplicated KPI: ${item.label}`);
        renderExecutiveSummary();
        return;
      }

      if (action === 'edit-kpi') {
        const kpis = getStoredItems('azko_dashboard_kpis', defaultKpis);
        const item = kpis[index];
        if (!item) return;
        openEditorModal('kpi', item, index);
        return;
      }

      if (action === 'remove-module') {
        const modules = getStoredItems('azko_dashboard_modules', defaultModules);
        modules.splice(index, 1);
        saveItems('azko_dashboard_modules', modules);
        addActivity('Removed module card');
        renderModules();
        return;
      }

      if (action === 'duplicate-module') {
        const modules = getStoredItems('azko_dashboard_modules', defaultModules);
        const item = modules[index];
        if (!item) return;
        modules.splice(index + 1, 0, { ...item, title: `${item.title} copy` });
        saveItems('azko_dashboard_modules', modules);
        addActivity(`Duplicated module: ${item.title}`);
        renderModules();
        return;
      }

      if (action === 'edit-module') {
        const modules = getStoredItems('azko_dashboard_modules', defaultModules);
        const item = modules[index];
        if (!item) return;
        openEditorModal('module', item, index);
        return;
      }

    }

    const heroTarget = e.target.closest('[data-edit-target="hero"]');
    if (heroTarget && isAdminUser() && getAdminMode()) {
      openEditorModal('hero', {
        eyebrow: loadHeroEyebrowContent(),
        greeting: loadHeroGreetingContent(),
        description: loadHeroDescriptionContent(),
        scale: loadHeroTextScale()
      });
      return;
    }

    const madingTarget = e.target.closest('[data-edit-target="mading"]');
    if (madingTarget && isAdminUser() && getAdminMode()) {
      openEditorModal('mading', { text: loadMadingContent() });
      return;
    }
  });

  document.body.addEventListener('dragstart', function(e){
    const card = e.target.closest('.editable-card');
    if (!card || !getAdminMode()) return;
    dragState = { kind: card.dataset.kind, index: Number(card.dataset.index) };
    card.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });

  document.body.addEventListener('dragover', function(e){
    const card = e.target.closest('.editable-card');
    if (!card || !getAdminMode() || !dragState) return;
    e.preventDefault();
    document.querySelectorAll('.editable-card.drop-target').forEach(item => item.classList.remove('drop-target'));
    card.classList.add('drop-target');
  });

  document.body.addEventListener('dragleave', function(e){
    const card = e.target.closest('.editable-card');
    if (card) card.classList.remove('drop-target');
  });

  document.body.addEventListener('drop', function(e){
    const card = e.target.closest('.editable-card');
    if (!card || !getAdminMode() || !dragState) return;
    e.preventDefault();
    const targetIndex = Number(card.dataset.index);
    const targetKind = card.dataset.kind;
    if (dragState.kind !== targetKind) return;

    if (dragState.kind === 'kpi') {
      const items = getStoredItems('azko_dashboard_kpis', defaultKpis);
      const [moved] = items.splice(dragState.index, 1);
      items.splice(targetIndex, 0, moved);
      saveItems('azko_dashboard_kpis', items);
      addActivity('Reordered KPI cards');
      renderExecutiveSummary();
    }

    if (dragState.kind === 'module') {
      const items = getStoredItems('azko_dashboard_modules', defaultModules);
      const [moved] = items.splice(dragState.index, 1);
      items.splice(targetIndex, 0, moved);
      saveItems('azko_dashboard_modules', items);
      addActivity('Reordered module cards');
      renderModules();
    }

    document.querySelectorAll('.editable-card.drop-target').forEach(item => item.classList.remove('drop-target'));
    dragState = null;
  });

  document.body.addEventListener('dragend', function(){
    document.querySelectorAll('.editable-card.dragging, .editable-card.drop-target').forEach(item => {
      item.classList.remove('dragging');
      item.classList.remove('drop-target');
    });
    dragState = null;
  });

  document.body.addEventListener('click', function(e){
    const restoreBtn = e.target.closest('[data-restore-snapshot]');
    if (restoreBtn) {
      restoreSnapshot(Number(restoreBtn.getAttribute('data-restore-snapshot')));
    }
  });

  const exportConfigBtn = document.getElementById('exportConfigBtn');
  if (exportConfigBtn) {
    exportConfigBtn.addEventListener('click', function(){
      const payload = {
        kpis: getStoredItems('azko_dashboard_kpis', defaultKpis),
        modules: getStoredItems('azko_dashboard_modules', defaultModules),
        theme: document.documentElement.getAttribute('data-theme') || 'light'
      };
      document.getElementById('configImportBox').value = JSON.stringify(payload, null, 2);
      addActivity('Exported dashboard config');
    });
  }

  const importConfigBtn = document.getElementById('importConfigBtn');
  if (importConfigBtn) {
    importConfigBtn.addEventListener('click', function(){
      const value = document.getElementById('configImportBox').value.trim();
      if (!value) return;
      try {
        const payload = JSON.parse(value);
        if (payload.kpis) {
          saveItems('azko_dashboard_kpis', payload.kpis);
        }
        if (payload.modules) {
          saveItems('azko_dashboard_modules', payload.modules);
        }
        if (payload.theme) {
          applyTheme(payload.theme);
        }
        addActivity('Imported dashboard config');
        renderExecutiveSummary();
        renderModules();
      } catch (error) {
        alert('Invalid config JSON.');
      }
    });
  }

  const restoreDefaultsBtn = document.getElementById('restoreDefaultsBtn');
  if (restoreDefaultsBtn) {
    restoreDefaultsBtn.addEventListener('click', function(){
      if (!window.confirm('Restore dashboard defaults?')) return;
      saveItems('azko_dashboard_kpis', defaultKpis);
      saveItems('azko_dashboard_modules', defaultModules);
      addActivity('Restored default dashboard layout');
      renderExecutiveSummary();
      renderModules();
    });
  }

  const saveSnapshotBtn = document.getElementById('saveSnapshotBtn');
  if (saveSnapshotBtn) {
    saveSnapshotBtn.addEventListener('click', function(){
      saveCurrentSnapshot();
    });
  }

  const closeEditorModalBtn = document.getElementById('closeEditorModalBtn');
  const cancelEditorBtn = document.getElementById('cancelEditorBtn');
  const editorForm = document.getElementById('editorForm');
  const editorBackdrop = document.getElementById('editorModalBackdrop');
  if (closeEditorModalBtn) closeEditorModalBtn.addEventListener('click', closeEditorModal);
  if (cancelEditorBtn) cancelEditorBtn.addEventListener('click', closeEditorModal);
  if (editorBackdrop) editorBackdrop.addEventListener('click', closeEditorModal);
  if (editorForm) editorForm.addEventListener('submit', saveEditorModal);

  const toggleAdminModeBtn = document.getElementById('toggleAdminModeBtn');
  if (toggleAdminModeBtn) {
    toggleAdminModeBtn.addEventListener('click', function(){
      if (!isAdminUser()) {
        alert('Only admin users can edit the dashboard.');
        return;
      }
      const next = !getAdminMode();
      setAdminMode(next);
      addActivity(next ? 'Enabled admin edit mode' : 'Disabled admin edit mode');
      syncAdminUI();
      renderExecutiveSummary();
      renderSecondaryKpis();
      renderMading();
    });
  }

  const saveMadingBtnControl = document.getElementById('saveMadingBtn');
  if (saveMadingBtnControl) {
    saveMadingBtnControl.addEventListener('click', function(e){
      e.preventDefault();
      if (!isAdminUser()) {
        alert('Only admin users can save mading content.');
        return;
      }
      const textarea = document.getElementById('madingTextareaAdmin');
      const heroEyebrowInput = document.getElementById('heroEyebrowTextareaAdmin');
      const heroTextarea = document.getElementById('heroDescriptionTextareaAdmin');
      const heroTextScaleRange = document.getElementById('heroTextScaleRange');
      if (!textarea || !heroEyebrowInput || !heroTextarea || !heroTextScaleRange) return;
      saveMadingContent(textarea.value || '');
      saveHeroEyebrowContent(heroEyebrowInput.value || 'Welcome to AZKO Lotte Mall 👋');
      saveHeroGreetingContent();
      saveHeroDescriptionContent(heroTextarea.value || 'Orang yang peduli dengan pekerjaannya selalu tahu targetnya, karena setiap pencapaian dimulai dari kesadaran.');
      saveHeroTextScale(Number(heroTextScaleRange.value) || 1);
      renderMading();
      addActivity('Updated dashboard hero and mading content');
      alert('Konten hero dan mading berhasil disimpan.');
    });
  }

  const madingTextareaAdmin = document.getElementById('madingTextareaAdmin');
  if (madingTextareaAdmin) {
    madingTextareaAdmin.addEventListener('input', function(){
      const countLabel = document.getElementById('madingCountAdmin');
      const words = this.value.trim().split(/\s+/).filter(Boolean).length;
      if (countLabel) countLabel.textContent = `${words} kata`;
    });
  }

  const heroTextScaleRange = document.getElementById('heroTextScaleRange');
  if (heroTextScaleRange) {
    heroTextScaleRange.addEventListener('input', function(){
      const heroTextScaleLabel = document.getElementById('heroTextScaleLabel');
      if (heroTextScaleLabel) {
        heroTextScaleLabel.textContent = `${Math.round(Number(this.value) * 100)}%`;
      }
      const heroBubble = document.getElementById('heroBubble');
      if (heroBubble) {
        heroBubble.style.setProperty('--hero-scale', this.value);
      }
    });
  }

  const addKpiBtn = document.getElementById('addKpiBtn');
  if (addKpiBtn) {
    addKpiBtn.addEventListener('click', function(e){
      e.preventDefault();
      const label = document.getElementById('newKpiLabel').value.trim();
      const value = document.getElementById('newKpiValue').value.trim();
      const trend = document.getElementById('newKpiTrend').value.trim();
      const icon = document.getElementById('newKpiIcon').value.trim();
      const className = document.getElementById('newKpiColor').value;

      if (!label || !value) {
        alert('Please enter a KPI label and value.');
        return;
      }

      const kpis = getStoredItems('azko_dashboard_kpis', defaultKpis);
      kpis.push({ label, value, trend: trend || '+0%', icon: icon || 'fa-chart-line', className });
      saveItems('azko_dashboard_kpis', kpis);
      addActivity(`Added KPI: ${label}`);
      document.getElementById('newKpiLabel').value = '';
      document.getElementById('newKpiValue').value = '';
      document.getElementById('newKpiTrend').value = '';
      document.getElementById('newKpiIcon').value = '';
      document.getElementById('newKpiColor').value = 'sales';
      renderExecutiveSummary();
    });
  }

  const addModuleBtn = document.getElementById('addModuleBtn');
  if (addModuleBtn) {
    addModuleBtn.addEventListener('click', function(e){
      e.preventDefault();
      const title = document.getElementById('newModuleTitle').value.trim();
      const description = document.getElementById('newModuleDescription').value.trim();
      const icon = document.getElementById('newModuleIcon').value.trim();

      if (!title || !description) {
        alert('Please enter a module title and description.');
        return;
      }

      const modules = getStoredItems('azko_dashboard_modules', defaultModules);
      modules.push({ title, description, icon: icon || 'fa-cubes' });
      saveItems('azko_dashboard_modules', modules);
      addActivity(`Added module: ${title}`);
      document.getElementById('newModuleTitle').value = '';
      document.getElementById('newModuleDescription').value = '';
      document.getElementById('newModuleIcon').value = '';
      renderModules();
    });
  }

  const refreshDashboardBtn = document.getElementById('refreshDashboardBtn');
  if (refreshDashboardBtn) {
    refreshDashboardBtn.addEventListener('click', function(){
      renderExecutiveSummary();
      renderSecondaryKpis();
      renderModules();
      renderFocusList();
      renderLeaderboard();
      syncAdminUI();
      updateGreeting();
    });
  }

  const monthTrigger = document.getElementById('dashboardMonthTrigger');
  const monthPopover = document.getElementById('dashboardMonthPopover');
  if (monthTrigger && monthPopover) {
    monthTrigger.addEventListener('click', function(event){
      event.stopPropagation();
      const isOpen = monthPopover.hidden;
      document.querySelectorAll('.month-picker-popover').forEach(popover => {
        if (popover !== monthPopover) popover.hidden = true;
      });
      monthPopover.hidden = isOpen ? false : true;
      monthTrigger.setAttribute('aria-expanded', String(isOpen));
    });
  }

  document.addEventListener('click', function(event){
    if (!event.target.closest('.month-picker')) {
      document.querySelectorAll('.month-picker-popover').forEach(popover => {
        popover.hidden = true;
      });
      document.querySelectorAll('.month-picker-trigger').forEach(button => {
        button.setAttribute('aria-expanded', 'false');
      });
    }
  });

  setTimeout(function(){
    populateMonthSelector();
    if(window.initDefaultCharts) window.initDefaultCharts();
    syncAdminUI();
    renderActivityLog();
    renderSnapshots();
    renderExecutiveSummary();
    renderSecondaryKpis();
    renderModules();
    renderFocusList();
    renderLeaderboard();
    updateGreeting();
  }, 400);
});
