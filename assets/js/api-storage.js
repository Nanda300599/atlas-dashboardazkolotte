// API Storage Layer - Provides synchronized storage across devices
(function(){
  const API_BASE = window.location.origin;
  
  // Original localStorage references
  const originalStorage = window.localStorage;
  const storageCache = {};
  let isSyncingFromServer = false;

  // Helper: Get JWT token
  function getToken(){
    return sessionStorage.getItem('azko_auth_token') || localStorage.getItem('azko_auth_token');
  }

  // Helper: Make API call
  async function apiCall(endpoint, options = {}){
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      window.location.href = 'login.html';
      throw new Error('Unauthorized');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API Error');
    }

    return data;
  }

  // Sync dashboard data from server
  async function syncFromServer(){
    if (isSyncingFromServer) return;
    
    isSyncingFromServer = true;
    try {
      const dashboardData = await apiCall('/api/dashboard');
      
      if (dashboardData) {
        // Store the received data in cache
        storageCache['azko_dashboard_kpis'] = JSON.stringify(dashboardData.kpis || []);
        storageCache['azko_dashboard_secondary_kpis'] = JSON.stringify(dashboardData.secondaryKpis || []);
        storageCache['azko_dashboard_modules'] = JSON.stringify(dashboardData.modules || []);
        storageCache['azko_hero_eyebrow'] = dashboardData.heroEyebrow || '';
        storageCache['azko_hero_description'] = dashboardData.heroDescription || '';
        storageCache['azko_hero_text_scale'] = String(dashboardData.heroTextScale || '1');
        storageCache['azko_mading_content'] = dashboardData.mading || '';
        storageCache['azko_dashboard_shared_snapshot'] = JSON.stringify(dashboardData);
        
        // Update localStorage too for offline support
        Object.keys(storageCache).forEach(key => {
          originalStorage.setItem(key, storageCache[key]);
        });
        
        // Dispatch event that data has been synced
        window.dispatchEvent(new Event('azko:server-sync-complete'));
      }
    } catch (error) {
      console.warn('Server sync failed:', error);
      // Fall back to localStorage
    } finally {
      isSyncingFromServer = false;
    }
  }

  // Sync dashboard data to server
  async function syncToServer(key, value){
    // Only sync dashboard-related keys
    if (!key.includes('azko_dashboard') && !key.includes('azko_hero') && !key.includes('azko_mading')) {
      return;
    }

    try {
      const dashboardData = {};
      
      // Build update object based on which key changed
      if (key === 'azko_dashboard_kpis' || key.includes('azko_dashboard_kpis::')) {
        dashboardData.kpis = JSON.parse(value || '[]');
      } else if (key === 'azko_dashboard_secondary_kpis' || key.includes('azko_dashboard_secondary_kpis::')) {
        dashboardData.secondaryKpis = JSON.parse(value || '[]');
      } else if (key === 'azko_dashboard_modules' || key.includes('azko_dashboard_modules::')) {
        dashboardData.modules = JSON.parse(value || '[]');
      } else if (key === 'azko_hero_eyebrow' || key.includes('azko_hero_eyebrow::')) {
        dashboardData.heroEyebrow = value || '';
      } else if (key === 'azko_hero_description' || key.includes('azko_hero_description::')) {
        dashboardData.heroDescription = value || '';
      } else if (key === 'azko_hero_text_scale' || key.includes('azko_hero_text_scale::')) {
        dashboardData.heroTextScale = value || '1';
      } else if (key === 'azko_mading_content' || key.includes('azko_mading_content::')) {
        dashboardData.mading = value || '';
      }

      if (Object.keys(dashboardData).length > 0) {
        await apiCall('/api/dashboard', {
          method: 'PUT',
          body: JSON.stringify(dashboardData)
        });
      }
    } catch (error) {
      console.warn('Failed to sync to server:', error);
    }
  }

  // Create a proxy for localStorage that intercepts get/set/remove
  const storageProxy = {
    getItem(key){
      // First check cache, then original storage
      if (key in storageCache) {
        return storageCache[key];
      }
      const value = originalStorage.getItem(key);
      if (value !== null) {
        storageCache[key] = value;
      }
      return value;
    },
    
    setItem(key, value){
      storageCache[key] = value;
      originalStorage.setItem(key, value);
      
      // Only sync to server if:
      // 1. User is authenticated (AZKOAuth exists and user is logged in)
      // 2. It's a dashboard-related key
      if (window.AZKOAuth && 
          typeof window.AZKOAuth.isAuthenticated === 'function' && 
          window.AZKOAuth.isAuthenticated()) {
        syncToServer(key, value).catch(err => console.warn('Sync error:', err));
      }
    },
    
    removeItem(key){
      delete storageCache[key];
      originalStorage.removeItem(key);
    },
    
    clear(){
      storageCache = {};
      originalStorage.clear();
    },
    
    key(index){
      return originalStorage.key(index);
    },
    
    get length(){
      return originalStorage.length;
    }
  };

  // Override localStorage globally
  Object.defineProperty(window, 'localStorage', {
    value: storageProxy,
    writable: false
  });

  // Initial sync when dashboard loads
  if (window.AZKOAuth && window.AZKOAuth.isAuthenticated()) {
    syncFromServer().catch(err => console.warn('Initial sync failed:', err));
  }

  // Periodic sync (every 30 seconds)
  setInterval(() => {
    if (window.AZKOAuth && window.AZKOAuth.isAuthenticated()) {
      syncFromServer().catch(err => console.warn('Periodic sync failed:', err));
    }
  }, 30000);

  // Export for use in other scripts
  window.AZKOStorage = {
    syncFromServer,
    syncToServer,
    apiCall
  };

})();
