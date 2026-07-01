# 🧪 Testing Guide - Cross-Device Synchronization

Panduan lengkap untuk test fitur sinkronisasi data antar device.

## 📋 Prerequisites

1. ✅ Node.js installed & `npm install` sudah dijalankan
2. ✅ Server running (`npm start` atau `bash start.sh`)
3. ✅ Akses ke minimal 2 device:
   - Laptop (untuk run server & admin)
   - Phone/tablet (untuk test user access)

## 🎯 Scenario 1: Login dari Device Berbeda

### Setup:
- Temukan IP lokal laptop Anda:
  ```bash
  # macOS / Linux
  ifconfig | grep "inet " | grep -v 127.0.0.1
  
  # Windows
  ipconfig
  ```
  Catat IP-nya, misalnya: `192.168.1.100`

### Test:

**Device 1 - Laptop (Admin):**
1. Buka http://localhost:3000
2. Login dengan: `admin@azkolotte.id` / `Bonus100%`
3. Pastikan login berhasil

**Device 2 - Phone (User):**
1. Buka browser mobile
2. Go to: `http://192.168.1.100:3000` (ganti dengan IP laptop)
3. Login dengan: `user@azkolotte.id` / `Satukomando`
4. Catat data KPI yang ditampilkan

✅ **Expected Result:**
- Kedua device berhasil login
- Masing-masing melihat dashboard mereka

---

## 🎯 Scenario 2: Admin Edit Data → User Lihat (Sync)

### Test:

**Laptop (Admin):**
1. Masuk ke Settings page (`/settings.html`)
2. Cari bagian "KPI Management" atau "Dashboard Settings"
3. **Edit salah satu KPI:**
   - Ubah nilai "Sales Total" menjadi: `15.5M`
   - Ubah trend menjadi: `+12.5%`
4. Klik **Save** atau **Update**
5. Lihat di console (F12 → Network) bahwa ada request PUT ke `/api/dashboard`

**Phone (User) - Simultan/Bersamaan:**
1. Buka Dashboard page
2. **Jangan refresh** - cukup wait 30-60 detik
3. Atau tekan F5 untuk refresh manual

✅ **Expected Result:**
- Phone menampilkan data yang sama dengan laptop
- KPI yang di-edit di laptop muncul di phone
- Tidak perlu logout/login lagi

---

## 🎯 Scenario 3: Multiple Users Edit (Conflict Resolution)

### Test:

**Setup:**
- 2 Admin di laptop berbeda (atau simulate dengan 2 browser)
- 1 User di phone

**Test:**
1. **Laptop A (Admin 1)**: Edit KPI Sales = `20M`
2. **Laptop B (Admin 2)**: Edit KPI Traffic = `100K` (simul)
3. **Phone (User)**: Refresh & lihat data terbaru

✅ **Expected Result:**
- Data terakhir yang di-update akan tersimpan
- Semua device menampilkan data yang sama

---

## 🎯 Scenario 4: Offline → Online (Sync)

### Test:

**Phone (User):**
1. Login & view dashboard
2. **Putus internet** (turn off WiFi)
3. **Laptop (Admin)**: Edit beberapa KPI
4. **Phone**: Masih bisa lihat data yang sebelumnya (dari cache)
5. **Hubungkan internet kembali**
6. Tunggu 30 detik atau refresh browser

✅ **Expected Result:**
- Offline: data dari cache tetap ditampilkan
- Online: data sync dari server secara otomatis
- Tidak ada error message yang mengganggu

---

## 🎯 Scenario 5: "Remember Device" Feature

### Test:

**Laptop:**
1. Login dengan admin account
2. **Centang** "Remember this device"
3. Buka dev tools → Application → LocalStorage
4. Verify ada key `azko_auth_token` dengan JWT value

**Setelah close & buka browser lagi:**
1. Close browser sepenuhnya
2. Buka kembali → http://localhost:3000
3. Harus langsung masuk ke dashboard tanpa login

✅ **Expected Result:**
- Token tersimpan di localStorage (7 hari)
- Tidak perlu login ulang dalam 7 hari

---

## 🐛 Debug & Troubleshooting

### Check Network Requests:
```
Phone browser:
1. F12 → Network tab
2. Refresh page
3. Lihat requests ke /api/dashboard, /api/auth/me, etc.
4. Check response status (200 = OK, 401 = Unauthorized)
```

### Check Console Errors:
```
Phone browser:
1. F12 → Console tab
2. Lihat apakah ada error messages
3. Common errors:
   - CORS error: Check server CORS config
   - Network error: Check internet connection
   - 401 Unauthorized: Token sudah expired
```

### Check Server Logs:
```bash
Terminal (where server running):
- Lihat semua API requests yang masuk
- Contoh: "POST /api/auth/login - admin@azkolotte.id"
- Jika ada error, akan ditampilkan di sini
```

### Test API Directly:
```bash
# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@azkolotte.id","password":"Bonus100%"}'

# Will return JWT token
# Copy token dan gunakan untuk test endpoint lain:

curl -X GET http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer <TOKEN_HERE>"
```

---

## ✅ Checklist - Semua Test Passed?

- [ ] Login dari device berbeda berhasil
- [ ] Admin edit data → User lihat sync
- [ ] Multiple edit tidak conflict
- [ ] Offline mode works (cached data)
- [ ] Remember device works (7 hari)
- [ ] Network tab shows correct API calls
- [ ] No error di console
- [ ] Server logs tidak ada error

---

## 🎓 What's Happening Behind The Scenes?

1. **Login** → Backend generate JWT token (7 hari expire)
2. **Token storage** → Client simpan di localStorage/sessionStorage
3. **Each request** → Client attach token di header
4. **Server verify** → JWT decode & validate token
5. **Data fetch** → Server return data dari JSON file
6. **Data edit** → Client send update → Server save → Broadcast ke semua device
7. **Periodic sync** → Every 30 sec, client pull latest data dari server
8. **Offline** → Client gunakan cached data dari previous fetch

---

## 📈 Performance Notes

- **Sync interval**: 30 detik (tunable di `api-storage.js`)
- **JWT expiry**: 7 hari jika "Remember device" (tunable di `server.js`)
- **Max concurrent**: Limited by server resources
- **Data size**: Currently JSON files (OK for <100 KPI items)

### Untuk Optimize:
1. Gunakan WebSocket untuk real-time (ganti polling)
2. Implement database (MongoDB/PostgreSQL)
3. Add pagination untuk large datasets
4. Compress data dengan gzip

---

**Good luck testing!** 🚀

Jika ada issue, check console + server logs untuk clues.
