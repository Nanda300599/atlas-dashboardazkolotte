# 🚀 QUICK START GUIDE

## 30 Detik Setup

```bash
# 1. Install dependencies
npm install

# 2. Run server
npm start
```

✅ Server running di: http://localhost:3000

---

## 5 Menit Testing

### Device 1 (Laptop):
```
1. Buka http://localhost:3000
2. Login: admin@azkolotte.id / Bonus100%
3. Edit KPI atau data apa saja
4. Data otomatis tersimpan ke server
```

### Device 2 (Phone/Tablet):
```
1. Cari IP laptop: ifconfig | grep inet
2. Buka http://<IP_LAPTOP>:3000 (e.g. 192.168.1.100:3000)
3. Login: user@azkolotte.id / Satukomando
4. Data yang di-edit di Device 1 akan muncul di sini!
```

---

## 📁 File Structure

```
project/
├── server.js                 # ← Backend server (NODE.JS)
├── package.json              # ← Dependencies
├── start.sh                  # ← Quick start script
├── SETUP.md                  # ← Detailed setup guide
├── TESTING.md                # ← Testing scenarios
├── QUICK_START.md            # ← Ini file
├── assets/
│   ├── data/
│   │   ├── users.json        # ← User database (server)
│   │   ├── dashboard-data.json
│   │   └── monitoring-data.json
│   └── js/
│       ├── auth.js           # ← Auth with JWT (not localStorage)
│       ├── api-storage.js    # ← Storage proxy untuk sinkronisasi
│       ├── dashboard.js      # ← Tidak perlu edit
│       └── ...
└── *.html                    # ← HTML files (tidak perlu edit)
```

---

## 🔑 Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin@azkolotte.id | Bonus100% |
| User | user@azkolotte.id | Satukomando |

---

## 🛠️ Troubleshooting

**Port 3000 sudah terpakai?**
```bash
PORT=3001 npm start
```

**Node modules error?**
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

**Data tidak sinkron?**
1. Check server logs (terminal tempat npm start)
2. Check browser console (F12)
3. Pastikan kedua device di network yang sama
4. Cek IP laptop dengan: `ifconfig | grep inet`

**Tidak bisa connect dari phone?**
- Gunakan IP lokal, bukan localhost
- E.g: `192.168.1.100:3000` bukan `localhost:3000`

---

## 📊 How It Works

```
┌─────────────┐                    ┌──────────────┐
│   Laptop    │                    │    Phone     │
│   (Admin)   │                    │   (User)     │
└──────┬──────┘                    └──────┬───────┘
       │                                  │
       │ Edit KPI                         │ Login
       │ PUT /api/dashboard               │ GET /api/auth/login
       │ ─────────────────────────────→   │
       │                           ┌──────┴─────────┐
       │                           ↓                │
       │                    ┌──────────────┐        │
       │                    │  Backend     │        │
       │                    │  server.js   │        │
       │                    │              │        │
       │                    │ - Auth       │        │
       │                    │ - Data sync  │        │
       │                    │ - Verify     │        │
       │                    └──────┬───────┘        │
       │                           │                │
       │ ← ← ← Periodic sync ← ←  │                │
       │ GET /api/dashboard (30s) │ ← ← ← Sync  ←│
       │                           │                │
       ↓                           ↓                ↓
    Show new          Show auth token       Show latest
    data at          & user info            data from
    Dashboard                               server
```

---

## ✨ Key Features

✅ **Multi-Device Sync** - Data sinkron otomatis
✅ **JWT Auth** - Secure token-based login
✅ **Remember Device** - 7 hari auto-login
✅ **Offline Cache** - Works even without internet
✅ **Admin-Only Edit** - User hanya bisa lihat
✅ **Automatic Backup** - Data di server, tidak hilang

---

## 🎯 What Changed from Original

| Aspect | Before | After |
|--------|--------|-------|
| **Storage** | localStorage (device-only) | Backend server + JWT |
| **Sync** | Manual refresh | Auto sync every 30s |
| **Multi-device** | ❌ Not possible | ✅ Works perfectly |
| **Offline** | ❌ No data | ✅ Cached data |
| **Auth** | Hardcoded users | JWT tokens |
| **Security** | Low | Medium (add bcrypt for high) |

---

## 🔐 Security Notes

- ✅ JWT tokens expire di 7 hari
- ✅ All API endpoints require valid token
- ⚠️  Passwords stored plain-text (upgrade dengan bcrypt)
- ⚠️  No HTTPS (add SSL untuk production)
- ⚠️  No database encryption (use encrypted DB untuk sensitive data)

---

## 📈 Next Steps (Optional Improvements)

1. **WebSocket** - Real-time sync tanpa polling
2. **Database** - Use MongoDB/PostgreSQL instead JSON
3. **Encryption** - bcrypt passwords, SSL/HTTPS
4. **Audit Logs** - Track siapa edit apa & kapan
5. **Backup** - Auto backup ke cloud
6. **Mobile App** - React Native atau Flutter

---

## 💬 Questions?

Check files:
- `SETUP.md` - Detailed setup instructions
- `TESTING.md` - Testing guide & scenarios
- `server.js` - Backend code & comments
- `assets/js/auth.js` - Frontend auth logic
- `assets/js/api-storage.js` - Storage sync logic

**Debug:**
```bash
# Terminal 1 (run server)
npm start

# Terminal 2 (test API)
curl http://localhost:3000/api/auth/me

# Browser (F12 → Network tab)
Check all requests & responses
```

---

**Ready to go?** 🚀

```bash
npm start
```

Then access: http://localhost:3000

---

Version: 1.0.0
Updated: 2024
