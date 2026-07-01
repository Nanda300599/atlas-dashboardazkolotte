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
  const achievementAdminControls = document.getElementById('achievementAdminControls');
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
  const fullscreenAchievementTableModal = document.getElementById('fullscreenAchievementTableModal');
  const fullscreenAchievementTableBtn = document.getElementById('fullscreenAchievementTableBtn');
  const closeFullscreenAchievementTableBtn = document.getElementById('closeFullscreenAchievementTableBtn');
  const achievementTableFullscreen = document.getElementById('achievementTableFullscreen');

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
  const achievementDetailModal = document.getElementById('achievementDetailModal');
  const closeAchievementDetailModalBtn = document.getElementById('closeAchievementDetailModalBtn');
  const closeAchievementDetailModalBtn2 = document.getElementById('closeAchievementDetailModalBtn2');
  const detailAchievementName = document.getElementById('detailAchievementName');
  const detailAchievementJobTitle = document.getElementById('detailAchievementJobTitle');
  const detailAchievementNik = document.getElementById('detailAchievementNik');
  const detailAchievementQty = document.getElementById('detailAchievementQty');

  // Achievement elements
  const achievementTableBody = document.querySelector('#achievementTable tbody');
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
  const bulkAchievementModal = document.getElementById('bulkAchievementModal');
  const closeBulkAchievementModalBtn = document.getElementById('closeBulkAchievementModalBtn');
  const cancelBulkAchievementModalBtn = document.getElementById('cancelBulkAchievementModalBtn');
  const bulkAchievementForm = document.getElementById('bulkAchievementForm');
  const bulkAchievementTableBody = document.getElementById('bulkAchievementTableBody');
  const detailTrxSid = document.getElementById('detailTrxSid');
  const detailQtySid = document.getElementById('detailQtySid');
  const detailValueSid = document.getElementById('detailValueSid');
  const detailBsSid = document.getElementById('detailBsSid');
  const detailContToStore = document.getElementById('detailContToStore');

  const defaultHeader = {
    label: 'Monitoring',
    title: 'Monitoring Sales Performance',
    description: 'Lihat kinerja sales per individu dengan tabel data operasional yang sederhana.'
  };

  let monitoringData = null;
  let editingAdvisorId = null;
  const isAdmin = window.AZKOAuth && typeof window.AZKOAuth.isAdmin === 'function' ? window.AZKOAuth.isAdmin() : false;

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

  function getSelectedMonth() {
    const stored = localStorage.getItem('azko_monitoring_selected_month');
    if (stored) {
      return normalizeMonthKey(stored);
    }
    const currentMonth = getMonthKey();
    localStorage.setItem('azko_monitoring_selected_month', currentMonth);
    return currentMonth;
  }

  function setSelectedMonth(monthKey) {
    const normalized = normalizeMonthKey(monthKey);
    localStorage.setItem('azko_monitoring_selected_month', normalized);
    return normalized;
  }

  function getMonthScopedKey(key, monthKey = getSelectedMonth()) {
    return `${key}::${normalizeMonthKey(monthKey)}`;
  }

  function getStoredMonitoringData(monthKey = getSelectedMonth()) {
    try {
      const storageKey = getMonthScopedKey('azko_monitoring_advisors', monthKey);
      return JSON.parse(localStorage.getItem(storageKey) || 'null');
    } catch (e) {
      return null;
    }
  }

  function saveMonitoringData(data, monthKey = getSelectedMonth()) {
    localStorage.setItem(getMonthScopedKey('azko_monitoring_advisors', monthKey), JSON.stringify(data));
  }

  function getMonitoringHeader(monthKey = getSelectedMonth()) {
    try {
      return JSON.parse(localStorage.getItem(getMonthScopedKey('azko_monitoring_header', monthKey)) || 'null') || defaultHeader;
    } catch (e) {
      return defaultHeader;
    }
  }

  function saveMonitoringHeader(header, monthKey = getSelectedMonth()) {
    localStorage.setItem(getMonthScopedKey('azko_monitoring_header', monthKey), JSON.stringify(header));
  }

  // Achievement Data Functions
  function getStoredAchievements(monthKey = getSelectedMonth()) {
    try {
      return JSON.parse(localStorage.getItem(getMonthScopedKey('azko_achievement_data', monthKey)) || 'null');
    } catch (e) {
      return null;
    }
  }

  function saveAchievements(data, monthKey = getSelectedMonth()) {
    localStorage.setItem(getMonthScopedKey('azko_achievement_data', monthKey), JSON.stringify(data));
  }

  function getAchievements(monthKey = getSelectedMonth()) {
    const stored = getStoredAchievements(monthKey);
    return Array.isArray(stored) ? stored : [];
  }

  function populateMonthSelector() {
    const trigger = document.getElementById('monitoringMonthTrigger');
    const triggerLabel = document.getElementById('monitoringMonthTriggerLabel');
    const optionsContainer = document.getElementById('monitoringMonthOptions');
    const popover = document.getElementById('monitoringMonthPopover');
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

    triggerLabel.textContent = formatMonthLabel(currentValue);
    if (monitoringMonthCaption) monitoringMonthCaption.textContent = `Data akan disimpan untuk ${formatMonthLabel(currentValue)}.`;

    Array.from(optionsContainer.querySelectorAll('.month-picker-option')).forEach(button => {
      button.addEventListener('click', async function() {
        const selectedMonth = this.getAttribute('data-month');
        if (!selectedMonth) return;
        setSelectedMonth(selectedMonth);
        populateMonthSelector();
        if (popover) popover.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
        await loadData();
        renderMonitoringHeader();
        renderAchievementTable();
        if (monitoringMonthCaption) monitoringMonthCaption.textContent = `Data akan disimpan untuk ${formatMonthLabel(getSelectedMonth())}.`;
      });
    });
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
    if (achievementAdminControls) achievementAdminControls.classList.toggle('d-none', !isAdmin);
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
      const aValue = parseNumericValue(a.protectionSales);
      const bValue = parseNumericValue(b.protectionSales);
      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return 1;
      if (bValue === null) return -1;
      return bValue - aValue;
    });
  }

  function buildAdvisorRow(item, rankNumber) {
    const employeeId = item.nip || item.id || '-';
    const employeeName = item.name || '-';
    const jobTitle = item.position || '-';
    const trxSid = item.salesId || item.id || '-';
    const qtySid = formatValue(item.achievement, '');
    const valueSid = formatValue(item.protectionSales, '');
    const bsSid = formatValue(item.tps || item.transactions, '');
    const contToStore = item.contToStore != null ? `${Number(item.contToStore).toLocaleString('id-ID', { maximumFractionDigits: 2 })}%` : '-';
    const valueStatus = getValueSidStatus(item.protectionSales);
    const rankBadge = rankNumber && rankNumber <= 3 ? `<span class="best-rank-badge">BEST ${rankNumber}</span>` : '';

    return `
      <tr class="advisor-row ${valueStatus.className}">
        <td><span class="employee-id-pill">${employeeId}</span></td>
        <td>
          <div class="advisor-cell">
            <div>
              <div class="advisor-name">${employeeName}${rankBadge}</div>
            </div>
          </div>
        </td>
        <td><span class="compact-pill">${jobTitle}</span></td>
        <td>${trxSid}</td>
        <td>${qtySid}</td>
        <td>
          <div class="value-sid-cell">
            <span class="value-sid-number">${valueSid}</span>
            <span class="status-badge ${valueStatus.className}">
              <i class="fa-solid ${valueStatus.icon}"></i>
              ${valueStatus.label}
            </span>
          </div>
        </td>
        <td>${bsSid}</td>
        <td>${contToStore}</td>
        <td class="admin-only${isAdmin ? '' : ' d-none'}">
          <div class="btn-group btn-group-sm">
            <button type="button" class="btn btn-outline-info view-advisor-btn" data-advisor-id="${item.id}" title="View Details">
              <i class="fa-solid fa-eye"></i>
            </button>
            <button type="button" class="btn btn-outline-secondary edit-advisor-btn" data-advisor-id="${item.id}">Edit</button>
            <button type="button" class="btn btn-outline-danger delete-advisor-btn" data-advisor-id="${item.id}">Delete</button>
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
    advisorTableBody.innerHTML = visibleAdvisors.map((advisor, index) => buildAdvisorRow(advisor, index + 1)).join('');
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

  function renderAchievementTable() {
    if (!achievementTableBody) return;
    const achievements = getAchievements();
    const visibleAchievements = achievements.slice(0, 10);
    achievementTableBody.innerHTML = visibleAchievements.map(item => buildAchievementRow(item)).join('');
  }

  function renderFullscreenTable() {
    if (!advisorTableFullscreen) return;
    const tbody = advisorTableFullscreen.querySelector('tbody');
    if (!tbody) return;
    const advisors = getSortedAdvisorsForDisplay();
    tbody.innerHTML = advisors.map((advisor, index) => buildAdvisorRow(advisor, index + 1)).join('');
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
    advisorModalTitle.textContent = mode === 'edit' ? 'Edit Advisor' : 'Tambah Advisor';
    if (advisorName) advisorName.value = advisor?.name || '';
    if (advisorPosition) advisorPosition.value = advisor?.position || '';
    if (advisorNip) advisorNip.value = advisor?.nip || '';
    if (advisorSalesId) advisorSalesId.value = advisor?.salesId || advisor?.id || '';
    if (advisorAchievement) advisorAchievement.value = advisor?.achievement != null ? advisor.achievement : '';
    if (advisorTargetBerjalan) advisorTargetBerjalan.value = advisor?.targetBerjalan != null ? advisor.targetBerjalan : '';
    if (advisorProtection) advisorProtection.value = advisor?.protectionSales != null ? advisor.protectionSales : '';
    if (advisorTps) advisorTps.value = advisor?.tps != null ? advisor.tps : '';
    if (advisorContToStore) advisorContToStore.value = advisor?.contToStore != null ? advisor.contToStore : '';
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
    if (detailAdvisorName) detailAdvisorName.textContent = advisor?.name || '-';
    if (detailAdvisorPosition) detailAdvisorPosition.textContent = advisor?.position || '-';
    if (detailEmployeeId) detailEmployeeId.textContent = advisor?.nip || '-';
    if (detailTrxSid) detailTrxSid.textContent = advisor?.salesId || advisor?.id || '-';
    if (detailQtySid) detailQtySid.textContent = formatValue(advisor?.achievement, '');
    if (detailValueSid) detailValueSid.textContent = formatValue(advisor?.protectionSales, '');
    if (detailBsSid) detailBsSid.textContent = formatValue(advisor?.tps || advisor?.transactions, '');
    if (detailContToStore) detailContToStore.textContent = advisor?.contToStore != null ? `${Number(advisor.contToStore).toLocaleString('id-ID', { maximumFractionDigits: 2 })}%` : '-';
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
      const [employeeId, employeeName, jobTitle, trxSid, qtySid, valueSid, bsSid, contToStore] = cells;
      const hasAnyValue = [employeeId, employeeName, jobTitle, trxSid, qtySid, valueSid, bsSid, contToStore].some(Boolean);
      if (!hasAnyValue) return;

      const parsedQtySid = parseNumericValue(qtySid);
      const parsedValueSid = parseNumericValue(valueSid);
      const parsedBsSid = parseNumericValue(bsSid);
      const parsedContToStore = parseNumericValue(contToStore);

      if (!employeeName || !jobTitle) return;

      parsed.push({
        id: trxSid || employeeId || `advisor-${Date.now()}-${index + 1}`,
        salesId: trxSid || employeeId || '',
        name: employeeName,
        position: jobTitle,
        nip: employeeId,
        achievement: parsedQtySid !== null ? parsedQtySid : null,
        protectionSales: parsedValueSid !== null ? parsedValueSid : null,
        tps: parsedBsSid !== null ? parsedBsSid : null,
        contToStore: parsedContToStore !== null ? parsedContToStore : null
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
    const columns = ['employeeId', 'employeeName', 'jobTitle', 'trxSid', 'qtySid', 'valueSid', 'bsSid', 'contToStore'];
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

  const monthTrigger = document.getElementById('monitoringMonthTrigger');
  const monthPopover = document.getElementById('monitoringMonthPopover');
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
  if (cancelAdvisorModalBtn) cancelAdvisorModalBtn.addEventListener('click', closeAdvisorModal);
  if (advisorModal) advisorModal.addEventListener('click', function(e) {
    if (e.target === advisorModal) closeAdvisorModal();
  });

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
      const name = advisorName?.value.trim() || '';
      const position = advisorPosition?.value.trim() || '';
      const nip = advisorNip?.value.trim() || '';
      const salesId = advisorSalesId?.value.trim() || '';
      const achievement = advisorAchievement?.value ? parseNumericValue(advisorAchievement.value) : null;
      const targetBerjalan = advisorTargetBerjalan?.value ? parseNumericValue(advisorTargetBerjalan.value) : null;
      const protectionSales = advisorProtection?.value ? parseNumericValue(advisorProtection.value) : null;
      const tps = advisorTps?.value ? parseNumericValue(advisorTps.value) : null;
      const contToStore = advisorContToStore?.value ? parseNumericValue(advisorContToStore.value) : null;
      const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
      const normalizedAchievement = achievement !== null && achievement > MAX_SAFE_INTEGER ? MAX_SAFE_INTEGER : achievement;
      const normalizedProtectionSales = protectionSales !== null && protectionSales > MAX_SAFE_INTEGER ? MAX_SAFE_INTEGER : protectionSales;
      const normalizedTps = tps !== null && tps > MAX_SAFE_INTEGER ? MAX_SAFE_INTEGER : tps;

      if (!name || !position) {
        alert('Nama dan jabatan harus diisi.');
        return;
      }

      const advisorData = {
        id: salesId || `advisor-${Date.now()}`,
        salesId,
        name,
        position,
        nip,
        achievement: normalizedAchievement,
        targetBerjalan,
        protectionSales: normalizedProtectionSales,
        tps: normalizedTps,
        contToStore
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
      return;
    }

    if (!isAdmin) return;

    const viewBtn = e.target.closest('.view-advisor-btn');
    if (viewBtn) {
      const advisorId = viewBtn.getAttribute('data-advisor-id');
      const advisor = getAdvisors().find(item => item.id === advisorId);
      if (advisor) openAdvisorDetailModal(advisor);
      return;
    }

    const editBtn = e.target.closest('.edit-advisor-btn');
    if (editBtn) {
      const advisorId = editBtn.getAttribute('data-advisor-id');
      const advisor = getAdvisors().find(item => item.id === advisorId);
      if (advisor) openAdvisorModal('edit', advisor);
      return;
    }

    const deleteBtn = e.target.closest('.delete-advisor-btn');
    if (deleteBtn) {
      const advisorId = deleteBtn.getAttribute('data-advisor-id');
      if (!confirm('Hapus advisor ini?')) return;
      const updated = getAdvisors().filter(item => item.id !== advisorId);
      persistAdvisors(updated);
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
