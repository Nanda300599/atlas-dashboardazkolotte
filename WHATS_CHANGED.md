# 📝 WHAT'S CHANGED - Dokumentasi Perubahan

## Ringkasan

Anda meminta agar **data tetap sama di semua device** saat login dari device berbeda.

**Solusi yang diimplementasikan:**
- Backend server (Node.js/Express) untuk pusat data
- JWT authentication (token-based, bukan localStorage)
- Automatic data synchronization
- Multi-device support

---

## 🆕 File Baru Yang Ditambahkan

### Backend (Server)
| File | Fungsi |
|------|--------|
| `server.js` | Backend server utama dengan API endpoints |
| `package.json` | Dependencies (express, cors, jsonwebtoken) |
| `start.sh` | Quick start script |

### Frontend (Client)
| File | Fungsi |
|------|--------|
| `assets/js/api-storage.js` | Storage proxy untuk sinkronisasi data |
| `assets/js/auth.js` | **UPDATED** - Ganti localStorage dengan JWT |
| `assets/data/users.json` | User database (di server) |

### Documentation
| File | Fungsi |
|------|--------|
| `SETUP.md` | Detailed setup guide |
| `TESTING.md` | Testing scenarios & verification |
| `QUICK_START.md` | 30-second quick start |
| `.gitignore` | Git ignore config |

---

## 🔄 File Yang Diupdate

### 1. **auth.js** - Authentication System

**Before (localStorage):**
```javascript
// Simpan user info lokal di setiap device
localStorage.setItem('azko_session', JSON.stringify(session));
localStorage.setItem('azko_users', JSON.stringify(users));
```

**After (JWT):**
```javascript
// Ambil user info dari server via JWT token
const token = getToken();  // JWT from server
const user = decodeToken(token);  // Extract user info
```

**Keuntungan:**
- ✅ Data terpusat di server
- ✅ Token bisa di-verify di backend
- ✅ Tidak ada duplikasi data di multiple devices
- ✅ Lebih aman dengan expiration

### 2. **dashboard.html & Semua Pages** - Script Order

**Before:**
```html
<script src="assets/js/auth.js"></script>
<script src="assets/js/dashboard.js"></script>
```

**After:**
```html
<script src="assets/js/auth.js"></script>
<script src="assets/js/api-storage.js"></script>  ← NEW
<script src="assets/js/dashboard.js"></script>
```

**Mengapa?**
- api-storage.js harus load SEBELUM dashboard.js
- Agar localStorage di-override dan proxy ke API

---

## 🏗️ Arsitektur Baru

### Before (Local-Only)
```
┌──────────────┐         ┌──────────────┐
│   Laptop     │         │    Phone     │
│ localStorage │         │ localStorage │
│  - User data │         │  - User data │
│  - KPI data  │         │  - KPI data  │
└──────────────┘         └──────────────┘
       ↑                         ↑
       └─ TERPISAH, TIDAK SINKRON ─┘
```

### After (Centralized Server)
```
┌──────────────┐                ┌──────────────┐
│   Laptop     │                │    Phone     │
│  Browser     │                │   Browser    │
│ - JWT token  │                │ - JWT token  │
│ - Cache data │ ←─────────────→│ - Cache data │
└──────┬───────┘                └──────┬───────┘
       │ PUT /api/dashboard            │ GET /api/auth/me
       │ GET /api/dashboard (30s sync) │ PUT /api/dashboard
       └────────────────┬──────────────┘
                        ↓
                ┌────────────────┐
                │   Backend      │
                │   server.js    │
                │ ┌────────────┐ │
                │ │ JWT Auth   │ │
                │ ├────────────┤ │
                │ │ Users DB   │ │
                │ ├────────────┤ │
                │ │ Dashboard  │ │
                │ │ Data       │ │
                │ ├────────────┤ │
                │ │ Monitoring │ │
                │ │ Data       │ │
                │ └────────────┘ │
                └────────────────┘
                
        SEMUA DATA TERPUSAT & TERKONTROL
```

---

## 🔌 API Endpoints (Baru)

### Authentication
```
POST   /api/auth/login           → Login & get JWT token
GET    /api/auth/me              → Get current user info
POST   /api/auth/logout          → Logout (optional)
```

### Dashboard Data
```
GET    /api/dashboard            → Get all dashboard data
PUT    /api/dashboard            → Update dashboard data
PUT    /api/dashboard/kpi/:id    → Update specific KPI
```

### User Management (Admin Only)
```
GET    /api/users                → Get all users
GET    /api/users/:username      → Get specific user
POST   /api/users                → Create new user
PUT    /api/users/:username      → Update user
DELETE /api/users/:username      → Delete user
POST   /api/users/:username/reset-password → Reset password
```

### Monitoring
```
GET    /api/monitoring           → Get monitoring data
PUT    /api/monitoring           → Update monitoring data
```

---

## 🔐 Security Changes

### Before (Insecure)
```javascript
// Passwords tersimpan di browser + localStorage
if (password === user.password) {
  localStorage.setItem('azko_session', JSON.stringify(user));
}
// ❌ Semua data bisa di-extract dari localStorage
// ❌ Tidak ada expiration
// ❌ Tidak bisa invalidate dari server
```

### After (More Secure)
```javascript
// Login generate JWT token di server
POST /api/auth/login → return token
// JWT token di-store di client
sessionStorage.setItem('azko_auth_token', token);
// Server verify token sebelum return data
Authorization: Bearer <JWT_TOKEN>
// ✅ Token bisa di-verify & di-invalidate
// ✅ Token auto-expire
// ✅ Server punya kontrol penuh
```

---

## 📊 Data Flow - Sync Diagram

### Scenario 1: Admin Edit KPI

```
┌─────────────────────────────────────────────────────────┐
│ LAPTOP (Admin)                                          │
├─────────────────────────────────────────────────────────┤
│ 1. Admin buka Settings page                             │
│ 2. Edit KPI "Sales" = 20M                               │
│ 3. Click Save → JavaScript event listener               │
│ 4. api-storage.js intercept: localStorage.setItem()     │
│ 5. Check: isAuthenticated() = true                      │
│ 6. Call: syncToServer('azko_dashboard_kpis', data)     │
│    ├─ Prepare: PUT /api/dashboard                       │
│    ├─ Attach: Authorization: Bearer JWT_TOKEN           │
│    └─ Send: JSON dengan KPI updates                     │
│ 7. Backend menerima, verify token, save ke file         │
└─────────────────────────────────────────────────────────┘
                         ↓ (Network Request)
┌─────────────────────────────────────────────────────────┐
│ BACKEND (server.js)                                     │
├─────────────────────────────────────────────────────────┤
│ 1. PUT /api/dashboard menerima request                  │
│ 2. Middleware authenticateToken verify JWT              │
│ 3. Check: user.role === 'admin' ✓                       │
│ 4. Parse body: { kpis: [...] }                          │
│ 5. Read current: readDashboardData()                    │
│ 6. Update: data.kpis = [...] new values                 │
│ 7. Save: saveDashboardData(data) → file                 │
│ 8. Response: { success, updatedAt: timestamp }          │
└─────────────────────────────────────────────────────────┘
                         ↓ (Auto Sync Every 30s)
┌─────────────────────────────────────────────────────────┐
│ PHONE (User)                                            │
├─────────────────────────────────────────────────────────┤
│ 1. Phone browser running: setInterval(30s)              │
│ 2. Call: syncFromServer()                               │
│    ├─ GET /api/dashboard                                │
│    ├─ Attach: Authorization: Bearer JWT_TOKEN           │
│    └─ Receive: { kpis, modules, ... }                   │
│ 3. Data received! "Sales KPI = 20M"                     │
│ 4. Update cache: storageCache['azko_dashboard_kpis']   │
│ 5. Update browser: localStorage.setItem()               │
│ 6. Trigger event: 'azko:server-sync-complete'           │
│ 7. Dashboard.js listen event → re-render UI             │
│ 8. User lihat KPI terbaru di Phone!                     │
└─────────────────────────────────────────────────────────┘
```

### Scenario 2: Offline & Online Again

```
┌──────────────────┐
│ PHONE OFFLINE    │
├──────────────────┤
│ 1. Putus internet │
│ 2. syncToServer()  │ → Fail (network error)
│    └─ Log error: "Sync error"
│ 3. BUT: Data stay  │ → Use from cache
│    in localStorage │
│ 4. User lihat OK   │ → Cached data from
│    data yang lama  │    last successful sync
└──────────────────┘
       ↓ (Internet connect kembali)
┌──────────────────┐
│ PHONE ONLINE     │
├──────────────────┤
│ 1. setInterval    │
│    triggered (30s)│
│ 2. syncFromServer()│
│    └─ GET /api/   │ → SUCCESS
│       dashboard   │
│ 3. Server return  │ → Latest data
│    terbaru data   │
│ 4. Update cache   │ → localStorage
│ 5. Update UI      │ → New KPI values
│ 6. User lihat OK! │ → Data sinkron
└──────────────────┘
```

---

## ⚙️ Configuration

### Default Settings

| Setting | Value | Location |
|---------|-------|----------|
| **Server Port** | 3000 | server.js |
| **JWT Secret** | azko-lotte-mall-secret-key-2024 | server.js |
| **JWT Expiry** | 7 days | server.js |
| **Sync Interval** | 30 seconds | api-storage.js |
| **Database** | JSON files | assets/data/ |

### How to Change

**Ubah port:**
```bash
PORT=3001 npm start
```

**Ubah sync interval** (di api-storage.js):
```javascript
setInterval(() => {
  syncFromServer();
}, 30000);  // ← Change to 15000 for 15 seconds
```

**Ubah JWT expiry** (di server.js):
```javascript
{ expiresIn: '7d' }  // ← Change to '30d' for 30 days
```

---

## ✅ Testing Checklist

- [ ] npm install berhasil
- [ ] npm start server jalan
- [ ] Login dengan admin account berhasil
- [ ] Login dengan phone/device lain berhasil
- [ ] Edit KPI di satu device → muncul di device lain
- [ ] Data persist setelah logout/login
- [ ] Token tidak expired dalam session
- [ ] Offline mode works (cached data)

---

## 🚀 Next Steps

1. **Try it now:**
   ```bash
   npm install
   npm start
   ```

2. **Test cross-device:**
   - Buka di laptop: http://localhost:3000
   - Buka di phone: http://<LAPTOP_IP>:3000
   - Login dengan akun berbeda
   - Edit data → lihat sinkron!

3. **Production improvements:**
   - [ ] Add SSL/HTTPS
   - [ ] Use bcrypt for passwords
   - [ ] Implement WebSocket untuk real-time
   - [ ] Use proper database (MongoDB/PostgreSQL)
   - [ ] Add audit logging
   - [ ] Setup backup routine

---

## 🎓 Understanding the Code

### Key Functions in auth.js
```javascript
getToken()           // Get JWT from storage
setToken()           // Save JWT to storage
decodeToken()        // Decode JWT without verification
isAuthenticated()    // Check if token valid & not expired
loginHandler()       // Handle login form → call API
```

### Key Functions in api-storage.js
```javascript
apiCall()            // Make HTTP request with JWT
syncToServer()       // Upload data changes
syncFromServer()     // Download latest data
storageProxy         // Override localStorage globally
```

### Key Endpoints in server.js
```javascript
POST /api/auth/login        // Authenticate & return JWT
GET  /api/dashboard         // Return dashboard data
PUT  /api/dashboard         // Save dashboard data
GET  /api/users             // Admin only: list users
```

---

## 💡 How It Actually Works

1. **User login** → Send credentials to server
2. **Server verify** → Create JWT token
3. **Browser store** → Save token di sessionStorage
4. **Each request** → Include token di Authorization header
5. **Server verify** → Decode & validate token
6. **Return data** → Send user data atau dashboard data
7. **30s sync** → Client auto-fetch latest data
8. **Update UI** → Show newest data from server

**Result:** Semua device punya data yang sama! 🎉

---

**Version: 1.0.0**
**Date: 2024**
**Status: ✅ Ready for Testing**
