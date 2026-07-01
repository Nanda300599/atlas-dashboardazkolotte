document.addEventListener('DOMContentLoaded', async function(){
  if (window.AZKOAuth && typeof window.AZKOAuth.requireAuth === 'function') {
    window.AZKOAuth.requireAuth();
  }

  const advisorTableBody = document.querySelector('#advisorTable tbody');
  const monitoringEyebrow = document.getElementById('monitoringEyebrow');
  const monitoringTitle = document.getElementById('monitoringTitle');
  const monitoringDescription = document.getElementById('monitoringDescription');
  const monitoringMonthSelect = document.getElementById('monitoringMonthSelect');
  const monitoringMonthCaption = document.getElementById('monitoringMonthCaption');
  const monitoringAdminControls = document.getElementById('monitoringAdminControls');
  const monitoringTableAdminControls = document.getElementById('monitoringTableAdminControls');
  const monitoringLabelInput = document.getElementById('monitoringLabelInput');
  const monitoringTitleInput = document.getElementById('monitoringTitleInput');
  const monitoringDescriptionInput = document.getElementById('monitoringDescriptionInput');
  const saveMonitoringHeaderBtn = document.getElementById('saveMonitoringHeaderBtn');
  const resetMonitoringHeaderBtn = document.getElementById('resetMonitoringHeaderBtn');
  const addAdvisorBtn = document.getElementById('addAdvisorBtn');
  const bulkEditAdvisorBtn = document.getElementById('bulkEditAdvisorBtn');
  const resetAdvisorDataBtn = document.getElementById('resetAdvisorDataBtn');
  const advisorModal = document.getElementById('advisorModal');
  const advisorModalTitle = document.getElementById('advisorModalTitle');
  const closeAdvisorModalBtn = document.getElementById('closeAdvisorModalBtn');
  const bulkAdvisorModal = document.getElementById('bulkAdvisorModal');
  const closeBulkAdvisorModalBtn = document.getElementById('closeBulkAdvisorModalBtn');
  const cancelBulkAdvisorModalBtn = document.getElementById('cancelBulkAdvisorModalBtn');
  const fullscreenTableModal = document.getElementById('fullscreenTableModal');
  const fullscreenTableBtn = document.getElementById('fullscreenTableBtn');
  const closeFullscreenTableBtn = document.getElementById('closeFullscreenTableBtn');
  const advisorTableFullscreen = document.getElementById('advisorTableFullscreen');
  const bulkAdvisorTableBody = document.getElementById('bulkAdvisorTableBody');
  const bulkAdvisorForm = document.getElementById('bulkAdvisorForm');
  const cancelAdvisorModalBtn = document.getElementById('cancelAdvisorModalBtn');
  const advisorForm = document.getElementById('advisorForm');
  const advisorName = document.getElementById('advisorName');
  const advisorPosition = document.getElementById('advisorPosition');
  const advisorNip = document.getElementById('advisorNip');
  const advisorSalesId = document.getElementById('advisorSalesId');
  const advisorAchievement = document.getElementById('advisorAchievement');
  const advisorTargetBerjalan = document.getElementById('advisorTargetBerjalan');
  const advisorProtection = document.getElementById('advisorProtection');
  const advisorTps = document.getElementById('advisorTps');
  const advisorContToStore = document.getElementById('advisorContToStore');

  const advisorDetailModal = document.getElementById('advisorDetailModal');
  const closeAdvisorDetailModalBtn = document.getElementById('closeAdvisorDetailModalBtn');
  const closeAdvisorDetailModalBtn2 = document.getElementById('closeAdvisorDetailModalBtn2');
  const detailAdvisorName = document.getElementById('detailAdvisorName');
  const detailAdvisorPosition = document.getElementById('detailAdvisorPosition');
  const detailEmployeeId = document.getElementById('detailEmployeeId');
  const detailTrxSid = document.getElementById('detailTrxSid');
  const detailQtySid = document.getElementById('detailQtySid');
  const detailValueSid = document.getElementById('detailValueSid');
  const detailBsSid = document.getElementById('detailBsSid');
  const detailStatus = document.getElementById('detailStatus');
  const detailCost = document.getElementById('detailCost');
  const detailNote = document.getElementById('detailNote');
  const detailSolved = document.getElementById('detailSolved');

  const achievementTableFullscreen = document.getElementById('achievementTableFullscreen');
  const fullscreenAchievementTableBtn = document.getElementById('fullscreenAchievementTableBtn');
  const closeFullscreenAchievementTableBtn = document.getElementById('closeFullscreenAchievementTableBtn');
  const fullscreenAchievementTableModal = document.getElementById('fullscreenAchievementTableModal');
  const tambahAchievementBtn = document.getElementById('tambahAchievementBtn');
  const bulkEditAchievementBtn = document.getElementById('bulkEditAchievementBtn');
  const resetAchievementDataBtn = document.getElementById('resetAchievementDataBtn');
  const achievementModal = document.getElementById('achievementModal');
  const achievementModalTitle = document.getElementById('achievementModalTitle');
  const closeAchievementModalBtn = document.getElementById('closeAchievementModalBtn');
  const cancelAchievementModalBtn = document.getElementById('cancelAchievementModalBtn');
  const achievementForm = document.getElementById('achievementForm');
  const achievementNik = document.getElementById('achievementNik');
  const achievementName = document.getElementById('achievementName');
  const achievementJobTitle = document.getElementById('achievementJobTitle');
  const achievementQty = document.getElementById('achievementQty');
  const achievementDetailModal = document.getElementById('achievementDetailModal');
  const closeAchievementDetailModalBtn = document.getElementById('closeAchievementDetailModalBtn');
  const closeAchievementDetailModalBtn2 = document.getElementById('closeAchievementDetailModalBtn2');
  const detailAchievementName = document.getElementById('detailAchievementName');
  const detailAchievementJobTitle = document.getElementById('detailAchievementJobTitle');
  const detailAchievementNik = document.getElementById('detailAchievementNik');
  const detailAchievementQty = document.getElementById('detailAchievementQty');
  const bulkAchievementModal = document.getElementById('bulkAchievementModal');
  const closeBulkAchievementModalBtn = document.getElementById('closeBulkAchievementModalBtn');
  const cancelBulkAchievementModalBtn = document.getElementById('cancelBulkAchievementModalBtn');
  const bulkAchievementTableBody = document.getElementById('bulkAchievementTableBody');
  const bulkAchievementForm = document.getElementById('bulkAchievementForm');

  const defaultHeader = {
    label: 'Customer Service',
    title: 'Customer Service Performance',
    description: 'Pantau performa customer service dengan tabel data operasional yang sama seperti monitoring.'
  };

  let monitoringData = null;
  let editingAdvisorId = null;
  const isAdmin = true;

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
    const stored = localStorage.getItem(SHARED_MONTH_KEY);
    if (stored) {
      return normalizeMonthKey(stored);
    }
    const currentMonth = getMonthKey();
    localStorage.setItem(SHARED_MONTH_KEY, currentMonth);
    return currentMonth;
  }

  async function setSelectedMonth(monthKey) {
    const normalized = normalizeMonthKey(monthKey);
    localStorage.setItem(SHARED_MONTH_KEY, normalized);
    localStorage.setItem('azko_dashboard_content_version', String(Date.now()));
    try {
      await window.AZKOAuth?.apiCall?.('/api/shared-state', {
        method: 'PUT',
        body: JSON.stringify({ selectedMonth: normalized, customerService: { selectedMonth: normalized } })
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

  function getStoredMonitoringData(monthKey = getSelectedMonth()) {
    try {
      const storageKey = getMonthScopedKey('azko_customer_service_advisors', monthKey);
      return JSON.parse(localStorage.getItem(storageKey) || 'null');
    } catch (e) {
      return null;
    }
  }

  function saveMonitoringData(data, monthKey = getSelectedMonth()) {
    localStorage.setItem(getMonthScopedKey('azko_customer_service_advisors', monthKey), JSON.stringify(data));
  }

  function getMonitoringHeader(monthKey = getSelectedMonth()) {
    try {
      return JSON.parse(localStorage.getItem(getMonthScopedKey('azko_customer_service_header', monthKey)) || 'null') || defaultHeader;
    } catch (e) {
      return defaultHeader;
    }
  }

  function saveMonitoringHeader(header, monthKey = getSelectedMonth()) {
    localStorage.setItem(getMonthScopedKey('azko_customer_service_header', monthKey), JSON.stringify(header));
  }

  // Achievement Data Functions
  function getStoredAchievements(monthKey = getSelectedMonth()) {
    try {
      return JSON.parse(localStorage.getItem(getMonthScopedKey('azko_customer_service_achievement_data', monthKey)) || 'null');
    } catch (e) {
      return null;
    }
  }

  function saveAchievements(data, monthKey = getSelectedMonth()) {
    localStorage.setItem(getMonthScopedKey('azko_customer_service_achievement_data', monthKey), JSON.stringify(data));
  }

  function getAchievements(monthKey = getSelectedMonth()) {
    const stored = getStoredAchievements(monthKey);
    return Array.isArray(stored) ? stored : [];
  }

  async function restoreSharedStateFromServer() {
    try {
      const response = await window.AZKOAuth?.apiCall?.('/api/shared-state');
      if (response?.selectedMonth) {
        const normalized = normalizeMonthKey(response.selectedMonth);
        localStorage.setItem('azko_dashboard_selected_month', normalized);
        localStorage.setItem('azko_dashboard_content_version', String(Date.now()));
      }
    } catch (error) {
      console.warn('Unable to restore shared state from server', error);
    }
  }

  function populateMonthSelector() {
    if (!monitoringMonthSelect) return;
    const months = [];
    const start = new Date();
    start.setMonth(start.getMonth() - 6);
    for (let index = 0; index < 24; index += 1) {
      const current = new Date(start.getFullYear(), start.getMonth() + index, 1);
      const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      months.push({ key, label: formatMonthLabel(key) });
    }
    const currentValue = getSelectedMonth();
    monitoringMonthSelect.innerHTML = months.map(item => `<option value="${item.key}" ${item.key === currentValue ? 'selected' : ''}>${item.label}</option>`).join('');
    if (!monitoringMonthSelect.querySelector(`option[value="${currentValue}"]`)) {
      const fallback = document.createElement('option');
      fallback.value = currentValue;
      fallback.textContent = formatMonthLabel(currentValue);
      monitoringMonthSelect.appendChild(fallback);
    }
    monitoringMonthSelect.value = currentValue;
    if (monitoringMonthCaption) monitoringMonthCaption.textContent = `Data akan disimpan untuk ${formatMonthLabel(currentValue)}.`;
  }

  function renderMonitoringHeader() {
    const header = getMonitoringHeader();
    if (monitoringEyebrow) monitoringEyebrow.textContent = header.label;
    if (monitoringTitle) monitoringTitle.textContent = header.title;
    if (monitoringDescription) monitoringDescription.textContent = header.description;
    if (monitoringLabelInput) monitoringLabelInput.value = header.label;
    if (monitoringTitleInput) monitoringTitleInput.value = header.title;
    if (monitoringDescriptionInput) monitoringDescriptionInput.value = header.description;
  }

  function toggleAdminElements(show) {
    document.querySelectorAll('.admin-only').forEach(el => {
      el.classList.toggle('d-none', !show);
    });
  }

  function initAdminControls() {
    if (monitoringAdminControls) monitoringAdminControls.classList.toggle('d-none', !isAdmin);
    if (monitoringTableAdminControls) monitoringTableAdminControls.classList.toggle('d-none', !isAdmin);
    toggleAdminElements(isAdmin);
  }

  function parseNumericValue(value) {
    if (value == null || value === '') return null;
    const cleaned = String(value).replace(/[^0-9,.-]/g, '').trim();
    if (!cleaned) return null;
    const normalized = cleaned.replace(/,/g, '');
    const numericValue = Number(normalized);
    return Number.isFinite(numericValue) ? numericValue : null;
  }

  function formatValue(value, suffix = '') {
    if (value == null || value === '') return '-';
    const numericValue = parseNumericValue(value);
    if (numericValue !== null) {
      return `${numericValue.toLocaleString('id-ID')}${suffix}`;
    }
    return `${value}${suffix}`;
  }

  const VALUE_SID_WINNER_THRESHOLD = 105000000;

  function getValueSidStatus(value) {
    const numericValue = parseNumericValue(value);
    if (numericValue === null) {
      return { label: 'Pending', className: 'status-pending', icon: 'fa-minus-circle' };
    }

    if (numericValue >= VALUE_SID_WINNER_THRESHOLD) {
      return { label: 'Winner', className: 'status-winner', icon: 'fa-trophy' };
    }

    return { label: 'Fighting', className: 'status-fighting', icon: 'fa-fist-raised' };
  }

  function getSortedAdvisorsForDisplay() {
    return [...getAdvisors()].sort((a, b) => {
      const aValue = String(a?.customerName || '').trim();
      const bValue = String(b?.customerName || '').trim();
      return aValue.localeCompare(bValue, 'id-ID');
    });
  }

  function buildAdvisorRow(item) {
    const ticketNo = item?.ticketNo || item?.nip || item?.id || '-';
    const customerName = item?.customerName || item?.name || '-';
    const phone = item?.phone || item?.position || '-';
    const article = item?.article || item?.salesId || '-';
    const itemName = item?.itemName || item?.achievement || '-';
    const status = item?.status || item?.targetBerjalan || '-';
    const cost = item?.cost != null && item.cost !== '' ? String(item.cost) : '-';
    const note = item?.note || item?.tps || '-';
    const solved = Boolean(item?.solved);
    const checklistText = solved ? '✓ Solved' : 'Belum Solved';

    return `
      <tr class="advisor-row">
        <td><span class="employee-id-pill">${ticketNo}</span></td>
        <td>${customerName}</td>
        <td>${phone}</td>
        <td>${article}</td>
        <td>${itemName}</td>
        <td>${status}</td>
        <td>${cost}</td>
        <td>${note}</td>
        <td>${checklistText}</td>
        <td class="admin-only">
          <div class="btn-group btn-group-sm">
            <button type="button" class="btn btn-outline-info view-advisor-btn" data-advisor-id="${item.id}" title="View Details">
              <i class="fa-solid fa-eye"></i>
            </button>
            <button type="button" class="btn btn-outline-secondary edit-advisor-btn" data-advisor-id="${item.id}">Edit</button>
            ${isAdmin ? `<button type="button" class="btn btn-outline-danger delete-advisor-btn" data-advisor-id="${item.id}">Delete</button>` : ''}
          </div>
        </td>
      </tr>`;
  }

  function getAdvisors() {
    const stored = getStoredMonitoringData(getSelectedMonth());
    if (Array.isArray(stored)) {
      return stored;
    }
    return Array.isArray(monitoringData?.advisors) ? monitoringData.advisors : [];
  }

  function renderTargetSummary() {
    const summaryEl = document.getElementById('monitoringTargetSummary');
    if (!summaryEl) return;

    const advisors = getAdvisors();
    const withValue = advisors.filter(item => parseNumericValue(item.protectionSales) !== null);
    if (!withValue.length) {
      summaryEl.innerHTML = '';
      return;
    }

    const winnerCount = withValue.filter(item => parseNumericValue(item.protectionSales) >= VALUE_SID_WINNER_THRESHOLD).length;
    const fightingCount = withValue.length - winnerCount;
    summaryEl.innerHTML = `
      <div class="monitoring-target-summary-card">
        <div class="monitoring-target-summary-title">Value SID Status</div>
        <div class="monitoring-target-summary-value">${winnerCount} Winner • ${fightingCount} Fighting</div>
      </div>
    `;
  }

  function renderTable() {
    if (!advisorTableBody) return;
    const advisors = getSortedAdvisorsForDisplay();
    const visibleAdvisors = advisors.slice(0, 10);
    advisorTableBody.innerHTML = visibleAdvisors.map(advisor => buildAdvisorRow(advisor)).join('');
    bindAdvisorActionButtons(advisorTableBody);
    renderTargetSummary();
    renderFullscreenTable();
  }

  function buildAchievementRow(item) {
    const nik = item.nik || '-';
    const name = item.name || '-';
    const jobTitle = item.jobTitle || '-';
    const qty = item.qty != null ? Number(item.qty).toLocaleString('id-ID', { maximumFractionDigits: 2 }) : '-';

    const actionButtons = `
      <div class="btn-group btn-group-sm" role="group">
        <button type="button" class="btn btn-outline-info view-achievement-btn" data-achievement-id="${item.id}" title="View Details">
          <i class="fa-solid fa-eye"></i>
        </button>
        ${isAdmin ? `
          <button type="button" class="btn btn-outline-secondary" onclick="editAchievement('${item.id}')">
            <i class="fa-solid fa-pen"></i> Edit
          </button>
          <button type="button" class="btn btn-outline-danger" onclick="deleteAchievement('${item.id}')">
            <i class="fa-solid fa-trash"></i> Delete
          </button>
        ` : ''}
      </div>
    `;

    return `<tr class="achievement-row" data-achievement-id="${item.id}">
      <td><strong>${nik}</strong></td>
      <td>${name}</td>
      <td>${jobTitle}</td>
      <td>${qty}</td>
      <td class="text-nowrap">${actionButtons}</td>
    </tr>`;
  }

  function renderFullscreenTable() {
    if (!advisorTableFullscreen) return;
    const tbody = advisorTableFullscreen.querySelector('tbody');
    if (!tbody) return;
    const advisors = getSortedAdvisorsForDisplay();
    tbody.innerHTML = advisors.map(advisor => {
      const ticketNo = advisor?.ticketNo || advisor?.nip || advisor?.id || '-';
      const customerName = advisor?.customerName || advisor?.name || '-';
      const phone = advisor?.phone || advisor?.position || '-';
      const article = advisor?.article || advisor?.salesId || '-';
      const itemName = advisor?.itemName || advisor?.achievement || '-';
      const status = advisor?.status || advisor?.targetBerjalan || '-';
      const cost = advisor?.cost != null && advisor.cost !== '' ? String(advisor.cost) : '-';
      const note = advisor?.note || advisor?.tps || '-';
      const solved = Boolean(advisor?.solved);
      const checklistText = solved ? '✓ Solved' : 'Belum Solved';

      return `
        <tr class="advisor-row">
          <td><span class="employee-id-pill">${ticketNo}</span></td>
          <td>${customerName}</td>
          <td>${phone}</td>
          <td>${article}</td>
          <td>${itemName}</td>
          <td>${status}</td>
          <td>${cost}</td>
          <td>${note}</td>
          <td>${checklistText}</td>
          <td>
            <div class="btn-group btn-group-sm">
              <button type="button" class="btn btn-outline-info view-advisor-btn" data-advisor-id="${advisor.id}" title="View Details">
                <i class="fa-solid fa-eye"></i>
              </button>
              <button type="button" class="btn btn-outline-secondary edit-advisor-btn" data-advisor-id="${advisor.id}">Edit</button>
            </div>
          </td>
        </tr>`;
    }).join('');
    bindAdvisorActionButtons(tbody);
  }

  function renderAchievementTable() {
    const table = document.getElementById('achievementTable');
    if (!table) return;
    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const achievements = getAchievements();
    tbody.innerHTML = achievements.map(item => buildAchievementRow(item)).join('');
  }

  function renderFullscreenAchievementTable() {
    if (!achievementTableFullscreen) return;
    const tbody = achievementTableFullscreen.querySelector('tbody');
    if (!tbody) return;
    const achievements = getAchievements();
    tbody.innerHTML = achievements.map(item => {
      const qty = item.qty != null ? Number(item.qty).toLocaleString('id-ID', { maximumFractionDigits: 2 }) : '-';
      return `<tr>
        <td><strong>${item.nik || '-'}</strong></td>
        <td>${item.name || '-'}</td>
        <td>${item.jobTitle || '-'}</td>
        <td>${qty}</td>
      </tr>`;
    }).join('');
  }

  function openFullscreenTable() {
    if (!fullscreenTableModal) return;
    renderFullscreenTable();
    fullscreenTableModal.classList.remove('d-none');
  }

  function closeFullscreenTable() {
    if (!fullscreenTableModal) return;
    fullscreenTableModal.classList.add('d-none');
  }

  function openFullscreenAchievementTable() {
    if (!fullscreenAchievementTableModal) return;
    renderFullscreenAchievementTable();
    fullscreenAchievementTableModal.classList.remove('d-none');
  }

  function closeFullscreenAchievementTable() {
    if (!fullscreenAchievementTableModal) return;
    fullscreenAchievementTableModal.classList.add('d-none');
  }

  function openAdvisorModal(mode, advisor) {
    if (!advisorModal || !advisorModalTitle) return;
    editingAdvisorId = advisor?.id || null;
    advisorModalTitle.textContent = mode === 'edit' ? 'Edit Ticket' : 'Tambah Ticket';
    if (advisorNip) advisorNip.value = advisor?.ticketNo || advisor?.nip || '';
    if (advisorName) advisorName.value = advisor?.customerName || advisor?.name || '';
    if (advisorPosition) advisorPosition.value = advisor?.phone || advisor?.position || '';
    if (advisorSalesId) advisorSalesId.value = advisor?.article || advisor?.salesId || '';
    if (advisorAchievement) advisorAchievement.value = advisor?.itemName || advisor?.achievement || '';
    if (advisorTargetBerjalan) advisorTargetBerjalan.value = advisor?.status || advisor?.targetBerjalan || '';
    if (advisorProtection) advisorProtection.value = advisor?.cost != null ? advisor.cost : '';
    if (advisorTps) advisorTps.value = advisor?.note || advisor?.tps || '';
    if (advisorContToStore) advisorContToStore.checked = Boolean(advisor?.solved);
    advisorModal.classList.remove('d-none');
  }

  function closeAdvisorModal() {
    if (!advisorModal) return;
    advisorModal.classList.add('d-none');
    editingAdvisorId = null;
    if (advisorForm) advisorForm.reset();
  }

  function openAdvisorDetailModal(advisor) {
    if (!advisorDetailModal) return;
    if (detailAdvisorName) detailAdvisorName.textContent = advisor?.customerName || advisor?.name || '-';
    if (detailAdvisorPosition) detailAdvisorPosition.textContent = advisor?.phone || advisor?.position || '-';
    if (detailEmployeeId) detailEmployeeId.textContent = advisor?.ticketNo || advisor?.nip || '-';
    if (detailTrxSid) detailTrxSid.textContent = advisor?.article || advisor?.salesId || advisor?.id || '-';
    if (detailQtySid) detailQtySid.textContent = advisor?.itemName || advisor?.achievement || '-';
    if (detailValueSid) detailValueSid.textContent = advisor?.cost != null && advisor.cost !== '' ? String(advisor.cost) : '-';
    if (detailBsSid) detailBsSid.textContent = advisor?.status || advisor?.tps || '-';
    if (detailStatus) detailStatus.textContent = advisor?.status || '-';
    if (detailCost) detailCost.textContent = advisor?.cost != null && advisor.cost !== '' ? String(advisor.cost) : '-';
    if (detailNote) detailNote.textContent = advisor?.note || advisor?.tps || '-';
    if (detailSolved) detailSolved.textContent = advisor?.solved ? 'Sudah Solved' : 'Belum Solved';
    advisorDetailModal.classList.remove('d-none');
  }

  function closeAdvisorDetailModal() {
    if (!advisorDetailModal) return;
    advisorDetailModal.classList.add('d-none');
  }

  function persistAdvisors(advisors) {
    saveMonitoringData(advisors, getSelectedMonth());
    renderTable();
  }

  function parseBulkAdvisorRowsFromTable() {
    if (!bulkAdvisorTableBody) return [];

    const parsed = [];
    const rows = Array.from(bulkAdvisorTableBody.querySelectorAll('tr'));

    rows.forEach((row, index) => {
      const cells = Array.from(row.querySelectorAll('input')).map(input => input.value.trim());
      const [ticketNo, customerName, phone, article, itemName, status, cost, note, solved] = cells;
      const hasAnyValue = [ticketNo, customerName, phone, article, itemName, status, cost, note, solved].some(Boolean);
      if (!hasAnyValue) return;
      if (!customerName) return;

      parsed.push({
        id: ticketNo || `advisor-${Date.now()}-${index + 1}`,
        ticketNo: ticketNo || '',
        customerName,
        phone,
        article,
        itemName,
        status,
        cost: cost || '',
        note,
        solved: /true|yes|ya|checked|solved/i.test(solved)
      });
    });

    return parsed;
  }

  function openBulkAdvisorModal() {
    if (!bulkAdvisorModal || !bulkAdvisorTableBody) return;
    bulkAdvisorTableBody.querySelectorAll('input').forEach(input => input.value = '');
    bulkAdvisorModal.classList.remove('d-none');
  }

  function closeBulkAdvisorModal() {
    if (!bulkAdvisorModal) return;
    bulkAdvisorModal.classList.add('d-none');
  }

  // Achievement Modal Functions
  let editingAchievementId = null;

  function openAchievementModal(mode, achievement) {
    if (!achievementModal || !achievementModalTitle) return;
    editingAchievementId = achievement?.id || null;
    achievementModalTitle.textContent = mode === 'edit' ? 'Edit Achievement' : 'Tambah Achievement';
    if (achievementNik) achievementNik.value = achievement?.nik || '';
    if (achievementName) achievementName.value = achievement?.name || '';
    if (achievementJobTitle) achievementJobTitle.value = achievement?.jobTitle || '';
    if (achievementQty) achievementQty.value = achievement?.qty != null ? achievement.qty : '';
    achievementModal.classList.remove('d-none');
  }

  function closeAchievementModal() {
    if (!achievementModal) return;
    achievementModal.classList.add('d-none');
    editingAchievementId = null;
    if (achievementForm) achievementForm.reset();
  }

  function openAchievementDetailModal(achievement) {
    if (!achievementDetailModal) return;
    if (detailAchievementName) detailAchievementName.textContent = achievement?.name || '-';
    if (detailAchievementJobTitle) detailAchievementJobTitle.textContent = achievement?.jobTitle || '-';
    if (detailAchievementNik) detailAchievementNik.textContent = achievement?.nik || '-';
    if (detailAchievementQty) detailAchievementQty.textContent = achievement?.qty != null ? `${Number(achievement.qty).toLocaleString('id-ID', { maximumFractionDigits: 2 })}` : '-';
    achievementDetailModal.classList.remove('d-none');
  }

  function closeAchievementDetailModal() {
    if (!achievementDetailModal) return;
    achievementDetailModal.classList.add('d-none');
  }

  function openBulkAchievementModal() {
    if (!bulkAchievementModal || !bulkAchievementTableBody) return;
    bulkAchievementTableBody.querySelectorAll('input').forEach(input => input.value = '');
    bulkAchievementModal.classList.remove('d-none');
  }

  function closeBulkAchievementModal() {
    if (!bulkAchievementModal) return;
    bulkAchievementModal.classList.add('d-none');
  }

  function addBulkAchievementRow() {
    if (!bulkAchievementTableBody) return null;
    const row = document.createElement('tr');
    const columns = ['nik', 'name', 'jobTitle', 'qty'];
    columns.forEach(field => {
      const td = document.createElement('td');
      const input = document.createElement('input');
      input.className = 'form-control form-control-sm';
      input.setAttribute('type', 'text');
      input.setAttribute('data-bulk-field', field);
      td.appendChild(input);
      row.appendChild(td);
    });
    bulkAchievementTableBody.appendChild(row);
    return row;
  }

  function parseBulkAchievementRowsFromTable() {
    if (!bulkAchievementTableBody) return [];
    const rows = Array.from(bulkAchievementTableBody.querySelectorAll('tr'));
    return rows.map(row => {
      const inputs = row.querySelectorAll('input');
      const nik = (inputs[0]?.value || '').trim();
      const name = (inputs[1]?.value || '').trim();
      const jobTitle = (inputs[2]?.value || '').trim();
      const qty = (inputs[3]?.value || '').trim();

      if (!nik || !name) return null;
      return {
        id: Math.random().toString(36).substr(2, 9),
        nik,
        name,
        jobTitle,
        qty: isNaN(qty) ? 0 : parseFloat(qty)
      };
    }).filter(item => item !== null);
  }

  function addBulkAdvisorRow() {
    if (!bulkAdvisorTableBody) return null;
    const row = document.createElement('tr');
    const columns = ['ticketNo', 'customerName', 'phone', 'article', 'itemName', 'status', 'cost', 'note', 'solved'];
    columns.forEach(field => {
      const td = document.createElement('td');
      const input = document.createElement('input');
      input.className = 'form-control form-control-sm';
      input.type = 'text';
      input.setAttribute('data-bulk-field', field);
      td.appendChild(input);
      row.appendChild(td);
    });
    bulkAdvisorTableBody.appendChild(row);
    return row;
  }

  function handleBulkAdvisorPaste(event) {
    const activeInput = document.activeElement;
    if (!activeInput || !bulkAdvisorTableBody || !bulkAdvisorTableBody.contains(activeInput)) return;

    const pastedText = event.clipboardData?.getData('text/plain') || '';
    if (!pastedText) return;

    event.preventDefault();

    const rows = pastedText
      .split(/\r?\n/)
      .map(line => line.split(/\t|;|\|/).map(cell => cell.trim()))
      .filter(line => line.some(Boolean));

    if (!rows.length) return;

    const activeRow = activeInput.closest('tr');
    const rowIndex = Array.from(bulkAdvisorTableBody.children).indexOf(activeRow);
    const activeColumnIndex = Array.from(activeRow?.children || []).findIndex(cell => cell.contains(activeInput));
    const startRowIndex = rowIndex >= 0 ? rowIndex : 0;
    const startColumnIndex = activeColumnIndex >= 0 ? activeColumnIndex : 0;

    rows.forEach((cells, rowOffset) => {
      let targetRow = bulkAdvisorTableBody.children[startRowIndex + rowOffset];
      if (!targetRow) {
        targetRow = addBulkAdvisorRow();
      }
      const inputs = targetRow.querySelectorAll('input');
      cells.forEach((cellValue, colOffset) => {
        const targetInput = inputs[startColumnIndex + colOffset];
        if (targetInput) targetInput.value = cellValue;
      });
    });
  }

  if (bulkAdvisorTableBody) {
    bulkAdvisorTableBody.addEventListener('paste', handleBulkAdvisorPaste);
  }

  if (monitoringMonthSelect) {
    monitoringMonthSelect.addEventListener('change', async function() {
      const selectedMonth = await setSelectedMonth(this.value);
      populateMonthSelector();
      await loadData();
      renderMonitoringHeader();
      renderAchievementTable();
      if (monitoringMonthCaption) monitoringMonthCaption.textContent = `Data akan disimpan untuk ${formatMonthLabel(selectedMonth)}.`;
    });
  }

  if (saveMonitoringHeaderBtn) {
    saveMonitoringHeaderBtn.addEventListener('click', function() {
      const header = {
        label: monitoringLabelInput?.value.trim() || defaultHeader.label,
        title: monitoringTitleInput?.value.trim() || defaultHeader.title,
        description: monitoringDescriptionInput?.value.trim() || defaultHeader.description
      };
      saveMonitoringHeader(header, getSelectedMonth());
      renderMonitoringHeader();
      alert('Monitoring header updated for the selected month.');
    });
  }

  if (resetMonitoringHeaderBtn) {
    resetMonitoringHeaderBtn.addEventListener('click', function() {
      saveMonitoringHeader(defaultHeader, getSelectedMonth());
      renderMonitoringHeader();
      alert('Monitoring header reset to default for the selected month.');
    });
  }

  if (addAdvisorBtn) {
    addAdvisorBtn.addEventListener('click', function() {
      if (!isAdmin) {
        alert('Hanya admin yang dapat mengedit data ini.');
        return;
      }
      openAdvisorModal('create', null);
    });
  }

  if (bulkEditAdvisorBtn) {
    bulkEditAdvisorBtn.addEventListener('click', function() {
      if (!isAdmin) {
        alert('Hanya admin yang dapat mengedit data ini.');
        return;
      }
      openBulkAdvisorModal();
    });
  }

  if (resetAdvisorDataBtn) {
    resetAdvisorDataBtn.addEventListener('click', function() {
      if (!confirm('Hapus semua data advisor dari tabel monitoring?')) return;
      saveMonitoringData([], getSelectedMonth());
      renderTable();
      alert('Semua data advisor telah dihapus untuk bulan ini.');
    });
  }

  if (closeAdvisorModalBtn) closeAdvisorModalBtn.addEventListener('click', closeAdvisorModal);
  if (closeBulkAdvisorModalBtn) closeBulkAdvisorModalBtn.addEventListener('click', closeBulkAdvisorModal);
  if (cancelBulkAdvisorModalBtn) cancelBulkAdvisorModalBtn.addEventListener('click', closeBulkAdvisorModal);
  if (closeAdvisorDetailModalBtn) closeAdvisorDetailModalBtn.addEventListener('click', closeAdvisorDetailModal);
  if (closeAdvisorDetailModalBtn2) closeAdvisorDetailModalBtn2.addEventListener('click', closeAdvisorDetailModal);
  if (fullscreenTableBtn) fullscreenTableBtn.addEventListener('click', openFullscreenTable);
  if (closeFullscreenTableBtn) closeFullscreenTableBtn.addEventListener('click', closeFullscreenTable);
  if (fullscreenAchievementTableBtn) fullscreenAchievementTableBtn.addEventListener('click', openFullscreenAchievementTable);
  if (closeFullscreenAchievementTableBtn) closeFullscreenAchievementTableBtn.addEventListener('click', closeFullscreenAchievementTable);
  if (fullscreenTableModal) fullscreenTableModal.addEventListener('click', function(e) {
    if (e.target === fullscreenTableModal) closeFullscreenTable();
  });
  if (fullscreenAchievementTableModal) fullscreenAchievementTableModal.addEventListener('click', function(e) {
    if (e.target === fullscreenAchievementTableModal) closeFullscreenAchievementTable();
  });
  if (advisorDetailModal) advisorDetailModal.addEventListener('click', function(e) {
    if (e.target === advisorDetailModal) closeAdvisorDetailModal();
  });
  if (bulkAdvisorModal) bulkAdvisorModal.addEventListener('click', function(e) {
    if (e.target === bulkAdvisorModal) closeBulkAdvisorModal();
  });
  if (cancelAdvisorModalBtn) {
    cancelAdvisorModalBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      closeAdvisorModal();
    });
  }
  if (advisorModal) {
    advisorModal.addEventListener('click', function(e) {
      if (e.target === advisorModal) closeAdvisorModal();
    });
  }

  // Achievement Event Listeners
  if (tambahAchievementBtn) {
    tambahAchievementBtn.addEventListener('click', function() {
      if (!isAdmin) {
        alert('Hanya admin yang dapat mengedit data ini.');
        return;
      }
      openAchievementModal('create', null);
    });
  }

  if (bulkEditAchievementBtn) {
    bulkEditAchievementBtn.addEventListener('click', function() {
      if (!isAdmin) {
        alert('Hanya admin yang dapat mengedit data ini.');
        return;
      }
      openBulkAchievementModal();
    });
  }

  if (resetAchievementDataBtn) {
    resetAchievementDataBtn.addEventListener('click', function() {
      if (!confirm('Hapus semua data achievement dari tabel?')) return;
      saveAchievements([], getSelectedMonth());
      renderAchievementTable();
      alert('Semua data achievement telah dihapus untuk bulan ini.');
    });
  }

  if (closeAchievementModalBtn) closeAchievementModalBtn.addEventListener('click', closeAchievementModal);
  if (cancelAchievementModalBtn) cancelAchievementModalBtn.addEventListener('click', closeAchievementModal);
  if (closeAchievementDetailModalBtn) closeAchievementDetailModalBtn.addEventListener('click', closeAchievementDetailModal);
  if (closeAchievementDetailModalBtn2) closeAchievementDetailModalBtn2.addEventListener('click', closeAchievementDetailModal);
  if (closeBulkAchievementModalBtn) closeBulkAchievementModalBtn.addEventListener('click', closeBulkAchievementModal);
  if (cancelBulkAchievementModalBtn) cancelBulkAchievementModalBtn.addEventListener('click', closeBulkAchievementModal);
  
  if (achievementModal) achievementModal.addEventListener('click', function(e) {
    if (e.target === achievementModal) closeAchievementModal();
  });

  if (achievementDetailModal) achievementDetailModal.addEventListener('click', function(e) {
    if (e.target === achievementDetailModal) closeAchievementDetailModal();
  });

  if (bulkAchievementModal) bulkAchievementModal.addEventListener('click', function(e) {
    if (e.target === bulkAchievementModal) closeBulkAchievementModal();
  });

  if (bulkAdvisorForm) {
    bulkAdvisorForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const parsedAdvisors = parseBulkAdvisorRowsFromTable();
      if (!parsedAdvisors.length) {
        alert('Tidak ada data advisor yang valid untuk diterapkan.');
        return;
      }
      persistAdvisors(parsedAdvisors);
      closeBulkAdvisorModal();
      alert(`Berhasil menerapkan ${parsedAdvisors.length} data advisor.`);
    });
  }

  if (advisorForm) {
    advisorForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const advisors = getAdvisors();
      const ticketNo = advisorNip?.value.trim() || '';
      const customerName = advisorName?.value.trim() || '';
      const phone = advisorPosition?.value.trim() || '';
      const article = advisorSalesId?.value.trim() || '';
      const itemName = advisorAchievement?.value.trim() || '';
      const status = advisorTargetBerjalan?.value.trim() || '';
      const cost = advisorProtection?.value.trim() || '';
      const note = advisorTps?.value.trim() || '';
      const solved = Boolean(advisorContToStore?.checked);

      if (!customerName || !phone) {
        alert('Nama customer dan nomor telepon harus diisi.');
        return;
      }

      const advisorData = {
        id: ticketNo || `advisor-${Date.now()}`,
        ticketNo,
        customerName,
        phone,
        article,
        itemName,
        status,
        cost,
        note,
        solved
      };

      if (editingAdvisorId) {
        const updated = advisors.map(item => item.id === editingAdvisorId ? advisorData : item);
        persistAdvisors(updated);
      } else {
        persistAdvisors([advisorData, ...advisors]);
      }
      closeAdvisorModal();
    });
  }

  function bindAdvisorActionButtons(container) {
    const root = container || document;
    root.querySelectorAll('.view-advisor-btn').forEach(button => {
      button.onclick = function() {
        const advisorId = this.getAttribute('data-advisor-id');
        const advisor = getAdvisors().find(item => String(item.id) === String(advisorId));
        if (advisor) openAdvisorDetailModal(advisor);
      };
    });

    root.querySelectorAll('.edit-advisor-btn').forEach(button => {
      button.onclick = function() {
        const advisorId = this.getAttribute('data-advisor-id');
        const advisor = getAdvisors().find(item => String(item.id) === String(advisorId));
        if (advisor) openAdvisorModal('edit', advisor);
      };
    });

    root.querySelectorAll('.delete-advisor-btn').forEach(button => {
      button.onclick = function() {
        const advisorId = this.getAttribute('data-advisor-id');
        if (!confirm('Hapus advisor ini?')) return;
        const updated = getAdvisors().filter(item => String(item.id) !== String(advisorId));
        persistAdvisors(updated);
      };
    });
  }

  // Achievement Form Handlers
  if (achievementForm) {
    achievementForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const achievements = getAchievements();
      const nik = achievementNik?.value.trim() || '';
      const name = achievementName?.value.trim() || '';
      const jobTitle = achievementJobTitle?.value.trim() || '';
      const qty = achievementQty?.value ? parseFloat(achievementQty.value) : 0;

      if (!nik || !name) {
        alert('NIK dan Name harus diisi.');
        return;
      }

      const achievementData = {
        id: editingAchievementId || Math.random().toString(36).substr(2, 9),
        nik,
        name,
        jobTitle,
        qty
      };

      if (editingAchievementId) {
        const updated = achievements.map(item => item.id === editingAchievementId ? achievementData : item);
        saveAchievements(updated, getSelectedMonth());
      } else {
        saveAchievements([achievementData, ...achievements], getSelectedMonth());
      }
      closeAchievementModal();
      renderAchievementTable();
    });
  }

  if (bulkAchievementForm) {
    bulkAchievementForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const parsedAchievements = parseBulkAchievementRowsFromTable();
      if (!parsedAchievements.length) {
        alert('Tidak ada data achievement yang valid untuk diterapkan.');
        return;
      }
      saveAchievements(parsedAchievements, getSelectedMonth());
      closeBulkAchievementModal();
      renderAchievementTable();
      alert(`Berhasil menerapkan ${parsedAchievements.length} data achievement.`);
    });
  }

  // Achievement CRUD Functions (Global)
  window.editAchievement = function(achievementId) {
    const achievements = getAchievements();
    const achievement = achievements.find(item => item.id === achievementId);
    if (achievement) {
      openAchievementModal('edit', achievement);
    }
  };

  window.deleteAchievement = function(achievementId) {
    if (!confirm('Hapus data achievement ini?')) return;
    const achievements = getAchievements();
    const updated = achievements.filter(item => item.id !== achievementId);
    saveAchievements(updated, getSelectedMonth());
    renderAchievementTable();
  };

  // Initial Render
  renderAchievementTable();

  document.addEventListener('click', function(e) {
    const viewAchievementBtn = e.target.closest('.view-achievement-btn');
    if (viewAchievementBtn) {
      const achievementId = viewAchievementBtn.getAttribute('data-achievement-id');
      const achievement = getAchievements().find(item => item.id === achievementId);
      if (achievement) openAchievementDetailModal(achievement);
      return;
    }

    const achievementRow = e.target.closest('tr.achievement-row');
    if (achievementRow && !e.target.closest('button')) {
      const achievementId = achievementRow.getAttribute('data-achievement-id');
      const achievement = getAchievements().find(item => item.id === achievementId);
      if (achievement) openAchievementDetailModal(achievement);
    }
  });

  async function loadData() {
    const selectedMonth = getSelectedMonth();
    const stored = getStoredMonitoringData(selectedMonth);
    if (Array.isArray(stored)) {
      monitoringData = { advisors: stored };
    } else {
      monitoringData = { advisors: [] };
    }
    renderTable();
    renderAchievementTable();
  }

  initAdminControls();
  populateMonthSelector();
  renderMonitoringHeader();
  await loadData();
});
