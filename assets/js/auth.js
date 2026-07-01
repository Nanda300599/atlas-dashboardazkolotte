// Backend API Authentication with Cross-Device Synchronization
(function(){
  const API_BASE = window.location.origin;
  const TOKEN_KEY = 'azko_auth_token';
  const USER_KEY = 'azko_current_user';

  // Helper: Get stored token
  function getToken(){
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
  }

  // Helper: Save token
  function setToken(token, remember){
    if (remember) {
      localStorage.setItem(TOKEN_KEY, token);
      sessionStorage.removeItem(TOKEN_KEY);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  // Helper: Clear token
  function clearToken(){
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // Helper: Make API call with token
  async function apiCall(endpoint, options = {}){
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });

      if (response.status === 401) {
        clearToken();
        window.location.href = 'login.html';
        throw new Error('Unauthorized');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API Error');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Helper: Decode JWT token
  function decodeToken(token){
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const decoded = JSON.parse(atob(parts[1]));
      return decoded;
    } catch (e) {
      return null;
    }
  }

  // Helper: Check if token is expired
  function isTokenExpired(token){
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  }

  function getSession(){
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      return null;
    }
    const decoded = decodeToken(token);
    return decoded;
  }

  function setSession(user, remember){
    // Token is already set by loginHandler
    // This maintains compatibility
  }

  function clearSession(){
    clearToken();
  }

  function isAuthenticated(){
    const token = getToken();
    return !!(token && !isTokenExpired(token));
  }

  function getCurrentUser(){
    return getSession();
  }

  function isAdmin(){
    const user = getCurrentUser();
    return !!(user && user.role === 'admin');
  }

  function requireAuth(){
    if (!isAuthenticated()) {
      clearSession();
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  function requireAdmin(){
    if (!requireAuth()) return false;
    if (!isAdmin()) {
      window.location.href = 'dashboard.html';
      return false;
    }
    return true;
  }

  function loginHandler(e){
    e && e.preventDefault();
    const username = (document.getElementById('username') || {}).value?.trim();
    const password = (document.getElementById('password') || {}).value;
    const remember = (document.getElementById('remember') || {}).checked;
    const loader = document.getElementById('authLoading');

    if (!username || !password) {
      alert('Please enter username and password');
      return false;
    }

    if (loader) loader.classList.add('show');

    // Call backend API
    apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })
    .then(response => {
      if (response.token) {
        setToken(response.token, remember);
        window.setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 700);
      }
    })
    .catch(error => {
      window.setTimeout(() => {
        if (loader) loader.classList.remove('show');
        alert(error.message || 'Invalid credentials');
      }, 450);
    });
  }

  function logout(){
    clearSession();
    window.location.href = 'login.html';
  }

  function getUsers(){
    // This function now depends on API
    // For backward compatibility, we'll return empty array
    // Real user management should use API endpoints
    return Promise.resolve([]);
  }

  function saveUsers(users){
    // This function is deprecated - use API instead
    console.warn('saveUsers is deprecated. Use API endpoints instead.');
    return Promise.resolve(users);
  }

  function createUser(payload){
    return apiCall('/api/users', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  function updateUser(existingUsername, updates){
    return apiCall(`/api/users/${encodeURIComponent(existingUsername)}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  function resetPassword(username){
    return apiCall(`/api/users/${encodeURIComponent(username)}/reset-password`, {
      method: 'POST'
    });
  }

  function deleteUser(username){
    return apiCall(`/api/users/${encodeURIComponent(username)}`, {
      method: 'DELETE'
    });
  }

  window.AZKOAuth = {
    loginHandler,
    logout,
    isAuthenticated,
    requireAuth,
    requireAdmin,
    getUsers,
    saveUsers,
    getCurrentUser,
    isAdmin,
    createUser,
    updateUser,
    resetPassword,
    deleteUser
  };

  document.addEventListener('DOMContentLoaded', function(){
    const form = document.getElementById('loginForm');
    if (form) {
      form.addEventListener('submit', loginHandler);
    }

    const toggle = document.getElementById('togglePwd');
    if (toggle) {
      toggle.addEventListener('click', function(){
        const pwd = document.getElementById('password');
        if (pwd.type === 'password') {
          pwd.type = 'text';
          toggle.innerHTML = '<i class="fa fa-eye-slash"></i>';
        } else {
          pwd.type = 'password';
          toggle.innerHTML = '<i class="fa fa-eye"></i>';
        }
      });
    }
  });
})();
