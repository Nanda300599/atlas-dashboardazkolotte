// Settings page user management for Azko Lotte Mall
// Admin-only page: view, add, edit, remove users and show password details.
document.addEventListener('DOMContentLoaded', function() {
  const accessMessage = document.getElementById('accessMessage');
  const adminPanel = document.getElementById('adminPanel');
  const userSearch = document.getElementById('userSearch');
  const userRoleFilter = document.getElementById('userRoleFilter');
  const userStatusFilter = document.getElementById('userStatusFilter');
  const userSort = document.getElementById('userSort');
  const userTableBody = document.getElementById('userTableBody');
  const newUserBtn = document.getElementById('newUserBtn');
  const userModal = document.getElementById('userModal');
  const userModalTitle = document.getElementById('userModalTitle');
  const brandLogoInput = document.getElementById('brandLogoInput');
  const brandLogoPreview = document.getElementById('brandLogoPreview');
  const brandLogoRemoveBtn = document.getElementById('brandLogoRemoveBtn');
  let currentBrandLogo = null;
  const userForm = document.getElementById('userForm');
  const closeUserModalBtn = document.getElementById('closeUserModalBtn');
  const cancelUserModalBtn = document.getElementById('cancelUserModalBtn');
  const newPassword = document.getElementById('newPassword');
  const confirmPassword = document.getElementById('confirmPassword');
  const toggleUserPasswordBtn = document.getElementById('toggleUserPasswordBtn');
  const generatePasswordBtn = document.getElementById('generatePasswordBtn');
  const passwordStrength = document.getElementById('passwordStrength');
  const passwordHint = document.getElementById('passwordHint');
  const profilePhotoInput = document.getElementById('profilePhoto');
  const profilePhotoPreview = document.getElementById('profilePhotoPreview');
  const dashboardContentEditor = document.getElementById('dashboardContentEditor');
  const dashboardContentModal = document.getElementById('dashboardContentModal');
  const openDashboardContentModalBtn = document.getElementById('openDashboardContentModalBtn');
  const closeDashboardContentModalBtn = document.getElementById('closeDashboardContentModalBtn');
  const saveDashboardContentBtn = document.getElementById('saveDashboardContentBtn');
  const resetDashboardMonthDataBtn = document.getElementById('resetDashboardMonthDataBtn');
  let uploadedPhotoData = null;

  if (!window.AZKOAuth || typeof window.AZKOAuth.requireAdmin !== 'function') return;

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

  function getMonthKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  function normalizeMonthKey(monthKey) {
    const value = String(monthKey || '').trim();
    if (!/^\d{4}-\d{2}$/.test(value)) return getMonthKey();
    return value;
  }

  function formatMonthLabel(monthKey) {
    const normalized = normalizeMonthKey(monthKey);
    const [year, month] = normalized.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  }

  const SHARED_MONTH_KEY = 'azko_dashboard_selected_month';

  function getSelectedMonth() {
    return normalizeMonthKey(localStorage.getItem(SHARED_MONTH_KEY) || getMonthKey());
  }

  async function setSelectedMonth(monthKey) {
    const normalized = normalizeMonthKey(monthKey);
    localStorage.setItem(SHARED_MONTH_KEY, normalized);
    localStorage.setItem('azko_dashboard_content_version', String(Date.now()));
    try {
      await window.AZKOAuth?.apiCall?.('/api/shared-state', {
        method: 'PUT',
        body: JSON.stringify({ selectedMonth: normalized, dashboard: { selectedMonth: normalized } })
      });
    } catch (error) {
      console.warn('Unable to sync selected month to server', error);
    }
    window.dispatchEvent(new CustomEvent('azko:dashboard-month-changed', { detail: { monthKey: normalized } }));
    return normalized;
  }

  function getMonthScopedKey(key, monthKey = getSelectedMonth()) {
    return `${key}::${normalizeMonthKey(monthKey)}`;
  }

  function getStoredItems(key, fallback, monthKey = getSelectedMonth()) {
    try {
      const storageKey = getMonthScopedKey(key, monthKey);
      const stored = localStorage.getItem(storageKey);
      if (!stored) {
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

  function syncDashboardMonthContent(monthKey = getSelectedMonth(), source = 'admin') {
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

  async function persistSharedDashboardSnapshot(monthKey = getSelectedMonth(), source = 'admin') {
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
    try {
      await window.AZKOAuth?.apiCall?.('/api/shared-state', {
        method: 'PUT',
        body: JSON.stringify({ selectedMonth: normalizedMonth, dashboard: { snapshot, selectedMonth: normalizedMonth, updatedBy: source } })
      });
    } catch (error) {
      console.warn('Unable to sync dashboard snapshot to server', error);
    }
    window.dispatchEvent(new Event('azko:content-updated'));
    return snapshot;
  }

  function saveItems(key, items, monthKey = getSelectedMonth()) {
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

  function loadScopedString(key, fallback, monthKey = getSelectedMonth()) {
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

  function saveScopedString(key, value, monthKey = getSelectedMonth()) {
    localStorage.setItem(getMonthScopedKey(key, monthKey), String(value ?? ''));
    persistSharedDashboardSnapshot(monthKey, 'admin');
  }

  function normalizeKpiItems(items, fallback) {
    return deduplicateKpiItems(items, fallback);
  }

  async function restoreSharedStateFromServer() {
    try {
      const response = await window.AZKOAuth?.apiCall?.('/api/shared-state');
      if (response?.selectedMonth) {
        const normalized = normalizeMonthKey(response.selectedMonth);
        localStorage.setItem(SHARED_MONTH_KEY, normalized);
        if (response.dashboard?.snapshot) {
          const sharedSnapshot = response.dashboard.snapshot;
          localStorage.setItem('azko_dashboard_shared_snapshot', JSON.stringify(sharedSnapshot));
          localStorage.setItem('azko_dashboard_content_version', String(Date.now()));
          if (sharedSnapshot?.kpis) {
            saveItems('azko_dashboard_kpis', sharedSnapshot.kpis, normalized);
          }
          if (sharedSnapshot?.secondaryKpis) {
            saveItems('azko_dashboard_secondary_kpis', sharedSnapshot.secondaryKpis, normalized);
          }
          if (sharedSnapshot?.modules) {
            saveItems('azko_dashboard_modules', sharedSnapshot.modules, normalized);
          }
        }
      }
    } catch (error) {
      console.warn('Unable to restore shared state from server', error);
    }
  }

  function populateMonthSelector(){
    const trigger = document.getElementById('settingsMonthTrigger');
    const triggerLabel = document.getElementById('settingsMonthTriggerLabel');
    const optionsContainer = document.getElementById('settingsMonthOptions');
    const popover = document.getElementById('settingsMonthPopover');
    const caption = document.getElementById('dashboardMonthCaptionSettings');
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
    if (caption) caption.textContent = `Data akan disimpan untuk ${selectedMonthLabel}.`;

    Array.from(optionsContainer.querySelectorAll('.month-picker-option')).forEach(button => {
      button.addEventListener('click', async function() {
        const selectedMonth = this.getAttribute('data-month');
        if (!selectedMonth) return;
        const normalizedMonth = await setSelectedMonth(selectedMonth);
        syncDashboardMonthContent(normalizedMonth, 'admin');
        populateMonthSelector();
        if (popover) popover.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
        renderDashboardContentEditor();
      });
    });

    if (!trigger.dataset.bound) {
      trigger.addEventListener('click', function(event) {
        event.stopPropagation();
        const isOpen = !popover.hidden;
        document.querySelectorAll('.month-picker-popover').forEach(item => {
          item.hidden = true;
          const button = item.closest('.month-picker')?.querySelector('.month-picker-trigger');
          if (button) button.setAttribute('aria-expanded', 'false');
        });
        if (isOpen) {
          if (popover) popover.hidden = true;
          trigger.setAttribute('aria-expanded', 'false');
          return;
        }
        if (popover) {
          popover.hidden = false;
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
      document.addEventListener('click', function(event) {
        if (!event.target.closest('.month-picker')) {
          document.querySelectorAll('.month-picker-popover').forEach(item => {
            item.hidden = true;
            const button = item.closest('.month-picker')?.querySelector('.month-picker-trigger');
            if (button) button.setAttribute('aria-expanded', 'false');
          });
        }
      });
      trigger.dataset.bound = 'true';
    }
  }

  restoreSharedStateFromServer();

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

  function saveMadingContent(text, monthKey = getSelectedMonth()){
    saveScopedString('azko_mading_content', text, monthKey);
  }

  function loadHeroEyebrowContent(){
    return loadScopedString('azko_hero_eyebrow', 'Welcome to AZKO Lotte Mall 👋');
  }

  function saveHeroEyebrowContent(text, monthKey = getSelectedMonth()){
    saveScopedString('azko_hero_eyebrow', text || 'Welcome to AZKO Lotte Mall 👋', monthKey);
  }

  function loadHeroGreetingContent(){
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${greeting}, ${window.AZKOAuth?.getCurrentUser?.()?.name?.split(' ')[0] || 'Administrator'}`;
  }

  function saveHeroGreetingContent(){
    // Greeting is generated automatically from the current time.
  }

  function loadHeroDescriptionContent(){
    return loadScopedString('azko_hero_description', 'Orang yang peduli dengan pekerjaannya selalu tahu targetnya, karena setiap pencapaian dimulai dari kesadaran.');
  }

  function saveHeroDescriptionContent(text, monthKey = getSelectedMonth()){
    saveScopedString('azko_hero_description', text, monthKey);
  }

  function loadHeroTextScale(){
    const stored = loadScopedString('azko_hero_text_scale', '1');
    return Number(stored) || 1;
  }

  function saveHeroTextScale(value, monthKey = getSelectedMonth()){
    saveScopedString('azko_hero_text_scale', String(value), monthKey);
  }

  function renderDashboardContentEditor(){
    if (!dashboardContentEditor) return;
    const primaryKpis = normalizeKpiItems(getStoredItems('azko_dashboard_kpis', defaultKpis), defaultKpis);
    const secondaryKpis = normalizeKpiItems(getStoredItems('azko_dashboard_secondary_kpis', defaultSecondaryKpis), defaultSecondaryKpis);
    const combinedKpiItems = [
      ...primaryKpis.map(item => ({ ...item, sourceGroup: 'primary' })),
      ...secondaryKpis.map(item => ({ ...item, sourceGroup: 'secondary' }))
    ];
    const modules = getStoredItems('azko_dashboard_modules', defaultModules);

    const renderKpiCardMarkup = (items, title, subtitle, badgeLabel) => `
      <div class="mb-4 settings-section-card">
        <div class="settings-section-heading">
          <div>
            <h6 class="mb-1"><i class="fa fa-chart-line me-2"></i>${title}</h6>
            <p class="settings-section-subtitle">${subtitle}</p>
          </div>
          <span class="settings-badge-inline">${badgeLabel}</span>
        </div>
        <div class="vstack gap-3 mt-3">
          ${items.map((item, index) => `
            <div class="settings-kpi-card" data-kpi-group="${item.sourceGroup || 'primary'}" data-index="${index}">
              <div class="row g-3">
                <div class="col-md-4">
                  <div class="settings-field-shell">
                    <label class="form-label">Label</label>
                    <input class="form-control settings-input" data-field="label" placeholder="Nama KPI" value="${(item.label || '').replace(/"/g, '&quot;')}" />
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="settings-field-shell">
                    <label class="form-label">Value</label>
                    <input class="form-control settings-input" data-field="value" type="text" placeholder="Contoh: 2500000000, 85%, atau teks bebas" value="${(item.value || '').replace(/"/g, '&quot;')}" />
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="settings-field-shell">
                    <label class="form-label">Trend</label>
                    <input class="form-control settings-input" data-field="trend" placeholder="Contoh: +12.4%" value="${(item.trend || '').replace(/"/g, '&quot;')}" />
                  </div>
                </div>
                <div class="col-md-2">
                  <div class="settings-field-shell">
                    <label class="form-label">Color</label>
                    <select class="form-select settings-input" data-field="className">
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
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    dashboardContentEditor.innerHTML = `
      <div class="mb-4 settings-section-card">
        <div class="settings-section-heading">
          <div>
            <h6 class="mb-1"><i class="fa fa-star me-2"></i>Hero content</h6>
            <p class="settings-section-subtitle">Atur headline, deskripsi, dan ukuran teks agar lebih menarik.</p>
          </div>
          <span class="settings-badge-inline">Hero</span>
        </div>
        <div class="row g-3 mt-2">
          <div class="col-md-6">
            <div class="settings-field-shell">
              <label class="form-label">Eyebrow</label>
              <input id="settingsHeroEyebrow" class="form-control settings-input" placeholder="Contoh: Welcome to AZKO..." value="${loadHeroEyebrowContent().replace(/"/g, '&quot;')}" />
            </div>
          </div>
          <div class="col-md-6">
            <div class="settings-field-shell">
              <label class="form-label">Greeting</label>
              <div class="form-control-plaintext settings-readonly">${loadHeroGreetingContent().replace(/"/g, '&quot;')} <small>(auto)</small></div>
            </div>
          </div>
          <div class="col-12">
            <div class="settings-field-shell">
              <label class="form-label">Description</label>
              <textarea id="settingsHeroDescription" class="form-control settings-input" rows="3" placeholder="Tulis deskripsi singkat untuk hero section">${loadHeroDescriptionContent().replace(/"/g, '&quot;')}</textarea>
            </div>
          </div>
          <div class="col-md-4">
            <div class="settings-field-shell">
              <label class="form-label">Text scale</label>
              <input id="settingsHeroTextScale" type="range" min="0.8" max="1.4" step="0.05" value="${loadHeroTextScale()}" class="form-range" />
              <div class="small text-muted">${loadHeroTextScale()}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-4 settings-section-card">
        <div class="settings-section-heading">
          <div>
            <h6 class="mb-1"><i class="fa fa-newspaper me-2"></i>Today's news</h6>
            <p class="settings-section-subtitle">Masukkan berita atau pengumuman penting untuk ditampilkan di dashboard.</p>
          </div>
          <span class="settings-badge-inline">News</span>
        </div>
        <div class="mt-3">
          <textarea id="settingsMadingContent" class="form-control settings-input" rows="4" placeholder="Contoh: Promo minggu ini, update operasional, dll.">${loadMadingContent().replace(/"/g, '&quot;')}</textarea>
        </div>
      </div>

      ${renderKpiCardMarkup(combinedKpiItems, 'Main KPI cards', 'Atur semua KPI yang tampil di dashboard, termasuk KPI tambahan seperti Proteksi, VOC, Instan Upgrade, dan WhatsApp Channel.', 'KPI')}
    `;
  }

  function validateKpiValue() {
    return '';
  }

  function resetDashboardMonthData(){
    const selectedMonth = getSelectedMonth();
    const confirmed = window.confirm(`Reset semua value dan trend untuk ${formatMonthLabel(selectedMonth)}?`);
    if (!confirmed) return;

    const resetKpiItems = (items) => items.map(item => ({ ...item, value: '', trend: '' }));
    saveItems('azko_dashboard_kpis', resetKpiItems(defaultKpis), selectedMonth);
    saveItems('azko_dashboard_secondary_kpis', resetKpiItems(defaultSecondaryKpis), selectedMonth);
    saveScopedString('azko_mading_content', '', selectedMonth);
    saveScopedString('azko_hero_eyebrow', '', selectedMonth);
    saveScopedString('azko_hero_description', '', selectedMonth);
    saveScopedString('azko_hero_text_scale', '1', selectedMonth);
    syncDashboardMonthContent(selectedMonth, 'admin');
    renderDashboardContentEditor();
    alert(`Data untuk ${formatMonthLabel(selectedMonth)} berhasil direset.`);
  }

  function saveDashboardContentFromForm(){
    const selectedMonth = getSelectedMonth();
    const heroEyebrow = document.getElementById('settingsHeroEyebrow')?.value || '';
    const heroDescription = document.getElementById('settingsHeroDescription')?.value || '';
    const heroScale = document.getElementById('settingsHeroTextScale')?.value || '1';
    const mading = document.getElementById('settingsMadingContent')?.value || '';

    saveHeroEyebrowContent(heroEyebrow, selectedMonth);
    saveHeroGreetingContent();
    saveHeroDescriptionContent(heroDescription, selectedMonth);
    saveHeroTextScale(heroScale, selectedMonth);
    saveMadingContent(mading, selectedMonth);

    const allKpiItems = Array.from(document.querySelectorAll('.settings-kpi-card')).map(container => {
      const fields = container.querySelectorAll('[data-field]');
      const record = {
        sourceGroup: container.getAttribute('data-kpi-group') || 'primary'
      };
      fields.forEach(field => { record[field.dataset.field] = field.value; });
      return record;
    });
    const primaryItems = allKpiItems.filter(item => item.sourceGroup === 'primary');
    const secondaryItems = allKpiItems.filter(item => item.sourceGroup === 'secondary');
    const moduleItems = Array.from(document.querySelectorAll('[data-module-group="module"]')).map(container => {
      const fields = container.querySelectorAll('[data-field]');
      const record = {};
      fields.forEach(field => { record[field.dataset.field] = field.value; });
      return record;
    });

    const normalizedPrimaryItems = (primaryItems.length ? primaryItems : defaultKpis).map(({ sourceGroup, ...item }) => ({
      ...item,
      value: item.value ?? '',
      trend: item.trend ?? ''
    }));
    const normalizedSecondaryItems = (secondaryItems.length ? secondaryItems : defaultSecondaryKpis).map(({ sourceGroup, ...item }) => ({
      ...item,
      value: item.value ?? '',
      trend: item.trend ?? ''
    }));

    validateKpiValue();

    saveItems('azko_dashboard_kpis', normalizedPrimaryItems, selectedMonth);
    saveItems('azko_dashboard_secondary_kpis', normalizedSecondaryItems, selectedMonth);
    saveItems('azko_dashboard_modules', moduleItems.length ? moduleItems : defaultModules, selectedMonth);
    syncDashboardMonthContent(selectedMonth, 'admin');
    alert(`Dashboard content saved for ${formatMonthLabel(selectedMonth)}. The dashboard will refresh automatically.`);
  }

  function loadBrandLogo() {
    const stored = localStorage.getItem('azko_brand_logo');
    currentBrandLogo = stored || null;
    if (brandLogoPreview) {
      if (stored) {
        brandLogoPreview.src = stored;
        brandLogoPreview.style.display = 'block';
      } else {
        brandLogoPreview.src = 'assets/icons/AZKO LOGO.png';
        brandLogoPreview.style.display = 'block';
      }
    }
  }

  function saveBrandLogo(dataUrl) {
    if (dataUrl) {
      localStorage.setItem('azko_brand_logo', dataUrl);
      currentBrandLogo = dataUrl;
    } else {
      localStorage.removeItem('azko_brand_logo');
      currentBrandLogo = null;
    }
    if (window.applyAzkoBrandLogo) window.applyAzkoBrandLogo();
  }

  const canAccess = window.AZKOAuth.requireAdmin();
  if (!canAccess) {
    if (accessMessage) {
      accessMessage.textContent = 'This page is reserved for administrators only.';
      accessMessage.classList.remove('d-none');
    }
    return;
  }

  if (adminPanel) adminPanel.classList.remove('d-none');
  if (accessMessage) accessMessage.classList.add('d-none');

  const state = {
    editingUserId: null
  };

  function formatDate(value) {
    if (!value) return '–';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-GB');
  }

  function renderUsers() {
    if (!userTableBody) return;
    const users = window.AZKOAuth.getUsers().map(user => ({
      ...user,
      status: user.status || 'active',
      createdAt: user.createdAt || new Date().toISOString(),
      lastLogin: user.lastLogin || ''
    }));

    const query = userSearch?.value.trim().toLowerCase() || '';
    const role = userRoleFilter?.value || 'all';
    const status = userStatusFilter?.value || 'all';
    const sort = userSort?.value || 'name-asc';

    const filtered = users.filter(user => {
      const matchesQuery = !query || [user.name, user.username, user.role, user.password].join(' ').toLowerCase().includes(query);
      const matchesRole = role === 'all' || user.role === role;
      const matchesStatus = status === 'all' || user.status === status;
      return matchesQuery && matchesRole && matchesStatus;
    });

    filtered.sort((a, b) => {
      if (sort === 'createdAt-desc') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === 'lastLogin-desc') return new Date(b.lastLogin || 0) - new Date(a.lastLogin || 0);
      return String(a.name || a.username).localeCompare(String(b.name || b.username));
    });

    if (!filtered.length) {
      userTableBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-3">No users found.</td></tr>';
      return;
    }

    userTableBody.innerHTML = filtered.map(user => `
      <tr>
        <td>${user.name || '–'}</td>
        <td>${user.username}</td>
        <td><span class="text-monospace">${user.password || '–'}</span></td>
        <td>${user.role}</td>
        <td><span class="status-pill ${user.status}">${user.status}</span></td>
        <td>${formatDate(user.lastLogin)}</td>
        <td>${formatDate(user.createdAt)}</td>
        <td>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary" data-edit-user="${user.username}">Edit</button>
            <button class="btn btn-outline-secondary" data-reset-password="${user.username}">Reset</button>
            <button class="btn btn-outline-secondary" data-toggle-status="${user.username}">${user.status === 'locked' ? 'Unlock' : 'Lock'}</button>
            ${user.username === 'admin@azkolotte.id' ? '' : `<button class="btn btn-outline-danger" data-delete-user="${user.username}">Delete</button>`}
          </div>
        </td>
      </tr>
    `).join('');
  }

  function showUserModal(mode, user) {
    if (brandLogoPreview && currentBrandLogo) {
      brandLogoPreview.src = currentBrandLogo;
      brandLogoPreview.style.display = 'block';
    }
    if (!userModal || !userModalTitle || !userForm) return;
    state.editingUserId = user?.username || null;
    userModalTitle.textContent = mode === 'edit' ? 'Edit User' : 'Create User';
    document.getElementById('fullName').value = user?.name || '';
    document.getElementById('newUsername').value = user?.username || '';
    newPassword.value = '';
    confirmPassword.value = '';
    document.getElementById('newRole').value = user?.role || 'user';
    document.getElementById('newStatus').value = user?.status || 'active';
    if (profilePhotoInput) profilePhotoInput.value = '';
    uploadedPhotoData = null;
    if (profilePhotoPreview) {
      if (user?.photo) {
        profilePhotoPreview.src = user.photo;
        profilePhotoPreview.style.display = 'block';
      } else {
        profilePhotoPreview.src = '';
        profilePhotoPreview.style.display = 'none';
      }
    }
    document.getElementById('forceReset').checked = Boolean(user?.passwordResetRequired);
    newPassword.required = !user;
    confirmPassword.required = !user;
    passwordStrength.style.width = '0%';
    passwordStrength.className = 'progress-bar';
    passwordHint.textContent = 'Create a strong password.';
    userModal.classList.remove('d-none');
  }

  function hideUserModal() {
    if (!userModal) return;
    userModal.classList.add('d-none');
    state.editingUserId = null;
  }

  function evaluatePasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    if (/[^A-Za-z0-9]/.test(password)) score += 25;
    return score;
  }

  function updatePasswordUI(password) {
    const score = evaluatePasswordStrength(password);
    const colorClass = score < 50 ? 'bg-danger' : score < 75 ? 'bg-warning' : 'bg-success';
    passwordStrength.style.width = `${score}%`;
    passwordStrength.className = `progress-bar ${colorClass}`;
    passwordHint.textContent = score < 50 ? 'Add uppercase, numbers, and symbols.' : score < 75 ? 'Good strength.' : 'Strong password.';
  }

  function generatePassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < 12; i += 1) {
      pwd += chars[Math.floor(Math.random() * chars.length)];
    }
    newPassword.value = pwd;
    confirmPassword.value = pwd;
    updatePasswordUI(pwd);
    return pwd;
  }

  if (newUserBtn) newUserBtn.addEventListener('click', function() { showUserModal('create', null); });
  if (closeUserModalBtn) closeUserModalBtn.addEventListener('click', hideUserModal);
  if (cancelUserModalBtn) cancelUserModalBtn.addEventListener('click', hideUserModal);
  if (userModal) userModal.addEventListener('click', function(e) { if (e.target === userModal) hideUserModal(); });
  if (newPassword) newPassword.addEventListener('input', function(e) { updatePasswordUI(e.target.value); });
  if (toggleUserPasswordBtn) toggleUserPasswordBtn.addEventListener('click', function() {
    newPassword.type = newPassword.type === 'password' ? 'text' : 'password';
  });
  if (brandLogoInput) {
    brandLogoInput.addEventListener('change', function(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(event) {
        const dataUrl = event.target.result;
        if (brandLogoPreview) {
          brandLogoPreview.src = dataUrl;
          brandLogoPreview.style.display = 'block';
        }
        saveBrandLogo(dataUrl);
      };
      reader.readAsDataURL(file);
    });
  }
  if (brandLogoRemoveBtn) {
    brandLogoRemoveBtn.addEventListener('click', function() {
      if (!confirm('Remove the custom AZKO logo and restore the default?')) return;
      saveBrandLogo(null);
      if (brandLogoPreview) {
        brandLogoPreview.src = 'assets/icons/AZKO LOGO.png';
      }
    });
  }
  if (profilePhotoInput) {
    profilePhotoInput.addEventListener('change', function(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) {
        uploadedPhotoData = null;
        if (profilePhotoPreview) profilePhotoPreview.style.display = 'none';
        return;
      }
      const reader = new FileReader();
      reader.onload = function(event) {
        uploadedPhotoData = event.target.result;
        if (profilePhotoPreview) {
          profilePhotoPreview.src = uploadedPhotoData;
          profilePhotoPreview.style.display = 'block';
        }
      };
      reader.readAsDataURL(file);
    });
  }
  if (generatePasswordBtn) generatePasswordBtn.addEventListener('click', function(e) {
    e.preventDefault();
    generatePassword();
  });

  function openDashboardContentModal() {
    populateMonthSelector();
    renderDashboardContentEditor();
    if (dashboardContentModal) {
      dashboardContentModal.classList.remove('d-none');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDashboardContentModal() {
    if (dashboardContentModal) {
      dashboardContentModal.classList.add('d-none');
      document.body.style.overflow = '';
    }
  }

  if (openDashboardContentModalBtn) {
    openDashboardContentModalBtn.addEventListener('click', openDashboardContentModal);
  }

  if (closeDashboardContentModalBtn) {
    closeDashboardContentModalBtn.addEventListener('click', closeDashboardContentModal);
  }

  if (dashboardContentModal) {
    dashboardContentModal.addEventListener('click', function(event) {
      if (event.target === dashboardContentModal) closeDashboardContentModal();
    });
  }

  if (saveDashboardContentBtn) {
    saveDashboardContentBtn.addEventListener('click', function() {
      saveDashboardContentFromForm();
    });
  }

  if (resetDashboardMonthDataBtn) {
    resetDashboardMonthDataBtn.addEventListener('click', resetDashboardMonthData);
  }

  if (userForm) {
    userForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const username = document.getElementById('newUsername').value.trim();
      const password = newPassword.value;
      const confirm = confirmPassword.value;
      const fullName = document.getElementById('fullName').value.trim();
      const role = document.getElementById('newRole').value;
      const status = document.getElementById('newStatus').value;
      const photo = uploadedPhotoData;
      const forceReset = document.getElementById('forceReset').checked;

      if (!username) {
        alert('Username is required.');
        return;
      }
      if (!fullName) {
        alert('Full name is required.');
        return;
      }
      if (password && password !== confirm) {
        alert('Passwords do not match.');
        return;
      }

      try {
        if (state.editingUserId) {
          window.AZKOAuth.updateUser(state.editingUserId, {
            name: fullName,
            username,
            role,
            status,
            photo: photo || window.AZKOAuth.getUsers().find(item => item.username === state.editingUserId)?.photo || '',
            passwordResetRequired: forceReset,
            password: password || undefined
          });
          alert('User updated successfully.');
        } else {
          if (!password) {
            alert('Password is required for a new user.');
            return;
          }
          window.AZKOAuth.createUser({
            username,
            password,
            name: fullName,
            role,
            status,
            photo: photo || '',
            passwordResetRequired: forceReset
          });
          alert('User created successfully.');
        }
        hideUserModal();
        renderUsers();
      } catch (error) {
        alert(error.message || 'Unable to save user.');
      }
    });
  }

  if (userTableBody) {
    userTableBody.addEventListener('click', function(e) {
      const editBtn = e.target.closest('[data-edit-user]');
      if (editBtn) {
        const username = editBtn.getAttribute('data-edit-user');
        const user = window.AZKOAuth.getUsers().find(item => item.username === username);
        if (user) showUserModal('edit', user);
        return;
      }
      const resetBtn = e.target.closest('[data-reset-password]');
      if (resetBtn) {
        const username = resetBtn.getAttribute('data-reset-password');
        try {
          const password = window.AZKOAuth.resetPassword(username);
          navigator.clipboard?.writeText(password);
          alert(`Password reset. New password: ${password}`);
          renderUsers();
        } catch (error) {
          alert(error.message || 'Unable to reset password.');
        }
        return;
      }
      const toggleBtn = e.target.closest('[data-toggle-status]');
      if (toggleBtn) {
        const username = toggleBtn.getAttribute('data-toggle-status');
        const user = window.AZKOAuth.getUsers().find(item => item.username === username);
        if (!user) return;
        try {
          const nextStatus = user.status === 'locked' ? 'active' : 'locked';
          window.AZKOAuth.updateUser(username, { status: nextStatus });
          renderUsers();
        } catch (error) {
          alert(error.message || 'Unable to toggle status.');
        }
        return;
      }
      const deleteBtn = e.target.closest('[data-delete-user]');
      if (deleteBtn) {
        const username = deleteBtn.getAttribute('data-delete-user');
        if (!confirm(`Remove user ${username}? This cannot be undone.`)) return;
        try {
          window.AZKOAuth.deleteUser(username);
          renderUsers();
        } catch (error) {
          alert(error.message || 'Unable to delete user.');
        }
      }
    });
  }

  if (userSearch) userSearch.addEventListener('input', renderUsers);
  if (userRoleFilter) userRoleFilter.addEventListener('change', renderUsers);
  if (userStatusFilter) userStatusFilter.addEventListener('change', renderUsers);
  if (userSort) userSort.addEventListener('change', renderUsers);

  populateMonthSelector();
  renderDashboardContentEditor();
  loadBrandLogo();
  renderUsers();
});
