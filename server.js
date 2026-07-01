const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'azko-lotte-mall-secret-key-2024';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Data file paths
const USERS_FILE = path.join(__dirname, 'assets/data/users.json');
const DASHBOARD_DATA_FILE = path.join(__dirname, 'assets/data/dashboard-data.json');
const MONITORING_DATA_FILE = path.join(__dirname, 'assets/data/monitoring-data.json');
const SHARED_STATE_FILE = path.join(__dirname, 'assets/data/shared-state.json');

// Default users
const DEFAULT_USERS = [
  { id: 1, username: 'admin@azkolotte.id', password: 'Bonus100%', name: 'Administrator', role: 'admin', status: 'active', createdAt: new Date().toISOString() },
  { id: 2, username: 'user@azkolotte.id', password: 'Satukomando', name: 'Store User', role: 'user', status: 'active', createdAt: new Date().toISOString() }
];

// Initialize data files if not exist
function initializeDataFiles() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(DEFAULT_USERS, null, 2));
  }
  if (!fs.existsSync(DASHBOARD_DATA_FILE)) {
    fs.writeFileSync(DASHBOARD_DATA_FILE, JSON.stringify({ kpis: [], modules: [] }, null, 2));
  }
  if (!fs.existsSync(MONITORING_DATA_FILE)) {
    fs.writeFileSync(MONITORING_DATA_FILE, JSON.stringify({ data: [] }, null, 2));
  }
  if (!fs.existsSync(SHARED_STATE_FILE)) {
    fs.writeFileSync(SHARED_STATE_FILE, JSON.stringify({ selectedMonth: null, dashboard: {}, monitoring: {}, customerService: {}, updatedAt: null }, null, 2));
  }
}

function readSharedState() {
  try {
    return JSON.parse(fs.readFileSync(SHARED_STATE_FILE, 'utf8'));
  } catch (e) {
    return { selectedMonth: null, dashboard: {}, monitoring: {}, customerService: {}, updatedAt: null };
  }
}

function saveSharedState(state) {
  fs.writeFileSync(SHARED_STATE_FILE, JSON.stringify(state, null, 2));
}

// Helper functions
function readUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch (e) {
    return DEFAULT_USERS;
  }
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function readDashboardData() {
  try {
    return JSON.parse(fs.readFileSync(DASHBOARD_DATA_FILE, 'utf8'));
  } catch (e) {
    return { kpis: [], modules: [] };
  }
}

function saveDashboardData(data) {
  fs.writeFileSync(DASHBOARD_DATA_FILE, JSON.stringify(data, null, 2));
}

function readMonitoringData() {
  try {
    return JSON.parse(fs.readFileSync(MONITORING_DATA_FILE, 'utf8'));
  } catch (e) {
    return { data: [] };
  }
}

function saveMonitoringData(data) {
  fs.writeFileSync(MONITORING_DATA_FILE, JSON.stringify(data, null, 2));
}

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

// Middleware: Check JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
}

// ===== AUTH ENDPOINTS =====

// Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const users = readUsers();
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: { id: user.id, username: user.username, name: user.name, role: user.role }
  });
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Logout (optional - mainly for frontend)
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// ===== SHARED STATE ENDPOINTS =====
app.get('/api/shared-state', authenticateToken, (req, res) => {
  res.json(readSharedState());
});

app.put('/api/shared-state', authenticateToken, (req, res) => {
  const current = readSharedState();
  const incoming = req.body || {};
  const updated = {
    ...current,
    ...incoming,
    updatedAt: new Date().toISOString(),
    updatedBy: req.user?.username || 'unknown'
  };

  if (incoming.dashboard) {
    updated.dashboard = { ...(current.dashboard || {}), ...(incoming.dashboard || {}) };
  }
  if (incoming.monitoring) {
    updated.monitoring = { ...(current.monitoring || {}), ...(incoming.monitoring || {}) };
  }
  if (incoming.customerService) {
    updated.customerService = { ...(current.customerService || {}), ...(incoming.customerService || {}) };
  }

  saveSharedState(updated);
  res.json(updated);
});

// ===== DASHBOARD ENDPOINTS =====

// Get all dashboard data
app.get('/api/dashboard', authenticateToken, (req, res) => {
  const data = readDashboardData();
  res.json(data);
});

// Update dashboard data
app.put('/api/dashboard', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const data = readDashboardData();
  const updated = { ...data, ...req.body, updatedAt: new Date().toISOString(), updatedBy: req.user.username };
  saveDashboardData(updated);

  res.json(updated);
});

// Update KPI
app.put('/api/dashboard/kpi/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const data = readDashboardData();
  const kpiIndex = data.kpis?.findIndex(k => k.label === req.params.id) ?? -1;

  if (kpiIndex === -1) {
    return res.status(404).json({ error: 'KPI not found' });
  }

  data.kpis[kpiIndex] = { ...data.kpis[kpiIndex], ...req.body };
  saveDashboardData(data);

  res.json(data.kpis[kpiIndex]);
});

// ===== USER MANAGEMENT ENDPOINTS =====

// Get all users (admin only)
app.get('/api/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const users = readUsers();
  // Don't send passwords to frontend
  const safeUsers = users.map(u => ({
    id: u.id,
    username: u.username,
    name: u.name,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt
  }));

  res.json({ users: safeUsers });
});

// Get specific user
app.get('/api/users/:username', authenticateToken, (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.username === req.params.username);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Users can only view their own info, admin can view all
  if (req.user.role !== 'admin' && req.user.username !== req.params.username) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const safeUser = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt
  };

  res.json({ user: safeUser });
});

// Create new user
app.post('/api/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { username, password, name, role } = req.body;

  if (!username || !password || !name) {
    return res.status(400).json({ error: 'Username, password, and name are required' });
  }

  const users = readUsers();

  if (users.some(u => u.username === username)) {
    return res.status(409).json({ error: 'Username already exists' });
  }

  const newUser = {
    id: Math.max(...users.map(u => u.id || 0), 0) + 1,
    username,
    password,
    name,
    role: role === 'admin' ? 'admin' : 'user',
    status: 'active',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  res.status(201).json({
    message: 'User created successfully',
    user: {
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      role: newUser.role,
      status: newUser.status
    }
  });
});

// Update user
app.put('/api/users/:username', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const users = readUsers();
  const userIndex = users.findIndex(u => u.username === req.params.username);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { name, role, status, password } = req.body;
  const user = users[userIndex];

  if (name) user.name = name;
  if (role) user.role = role === 'admin' ? 'admin' : 'user';
  if (status) user.status = status;
  if (password) user.password = password;

  saveUsers(users);

  res.json({
    message: 'User updated successfully',
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      status: user.status
    }
  });
});

// Delete user
app.delete('/api/users/:username', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  if (req.params.username === 'admin@azkolotte.id') {
    return res.status(400).json({ error: 'Cannot delete default admin user' });
  }

  const users = readUsers();
  const newUsers = users.filter(u => u.username !== req.params.username);

  if (newUsers.length === users.length) {
    return res.status(404).json({ error: 'User not found' });
  }

  saveUsers(newUsers);

  res.json({ message: 'User deleted successfully' });
});

// Reset password
app.post('/api/users/:username/reset-password', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const users = readUsers();
  const userIndex = users.findIndex(u => u.username === req.params.username);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const newPassword = `AZKO-${Math.random().toString(36).slice(2, 10)}!`;
  users[userIndex].password = newPassword;

  saveUsers(users);

  res.json({
    message: 'Password reset successfully',
    newPassword: newPassword
  });
});

// Get monitoring data
app.get('/api/monitoring', authenticateToken, (req, res) => {
  const data = readMonitoringData();
  res.json(data);
});

// Update monitoring data
app.put('/api/monitoring', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const data = readMonitoringData();
  const updated = { ...data, ...req.body, updatedAt: new Date().toISOString() };
  saveMonitoringData(updated);

  res.json(updated);
});

// ===== SETTINGS ENDPOINTS =====

// Get user settings
app.get('/api/settings', authenticateToken, (req, res) => {
  // Return settings specific to user
  res.json({ userRole: req.user.role, username: req.user.username });
});

// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize and start server
initializeDataFiles();

app.listen(PORT, () => {
  console.log(`🚀 AZKO LOTTE MALL Dashboard Server running on http://localhost:${PORT}`);
  console.log(`📚 Default Users:`);
  console.log(`  - Admin: admin@azkolotte.id / Bonus100%`);
  console.log(`  - User: user@azkolotte.id / Satukomando`);
});
