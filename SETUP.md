# AZKO LOTTE MALL Dashboard - Cross-Device Sync Setup

## 📋 Persyaratan
- Node.js 14+ (https://nodejs.org/)
- npm atau yarn

## 🚀 Panduan Setup & Instalasi

### 1. Install Dependencies
```bash
npm install
```

Ini akan install:
- **express** - Backend server framework
- **cors** - Cross-Origin Resource Sharing
- **jsonwebtoken** - JWT authentication

### 2. Jalankan Server
```bash
npm start
```

Server akan berjalan di: **http://localhost:3000**

Anda akan melihat output:
```
🚀 AZKO LOTTE MALL Dashboard Server running on http://localhost:3000
📚 Default Users:
  - Admin: admin@azkolotte.id / Bonus100%
  - User: user@azkolotte.id / Satukomando
```

### 3. Akses Dashboard
Buka browser dan go to: **http://localhost:3000**

Kemudian login dengan salah satu akun di atas.

## ✅ Fitur Cross-Device Sync

Sekarang semua device yang login akan **OTOMATIS SINKRON**:

1. ✅ Data KPI (Sales, Achievement, Traffic, dll)
2. ✅ Secondary KPIs (Proteksi, VOC, dll)
3. ✅ Hero content (Eyebrow, Description)
4. ✅ Today's News (Mading)
5. ✅ User sessions & authentication

### Cara Kerja:
- **Laptop Admin**: Edit KPI → Otomatis simpan ke server
- **Phone User**: Login → Langsung dapat data terbaru dari server
- **Semua Device**: Data selalu sama (realtime sync setiap 30 detik)

## 🔑 File Penting

### Backend
- `server.js` - Backend server utama dengan API endpoints

### Frontend
- `assets/js/auth.js` - Authentication dengan JWT tokens (bukan localStorage)
- `assets/js/api-storage.js` - Storage proxy yang sinkron ke server
- `assets/data/users.json` - Database users

### API Endpoints

#### Authentication
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

#### Dashboard
- `GET /api/dashboard` - Get all dashboard data
- `PUT /api/dashboard` - Update dashboard data
- `PUT /api/dashboard/kpi/:id` - Update specific KPI

#### Monitoring
- `GET /api/monitoring` - Get monitoring data
- `PUT /api/monitoring` - Update monitoring data

## 🔒 Security Notes

### JWT Tokens
- Token disimpan di `sessionStorage` (sesi saat ini) atau `localStorage` (Remember device)
- Token auto-expire dalam 7 hari jika "Remember device" dipilih
- Semua API requests memerlukan valid JWT token

### Password
- Passwords di-hash di database (direkomendasikan upgrade ke bcrypt)
- Default credentials hanya untuk demo

## 🐛 Troubleshooting

### Server tidak jalan?
```bash
# Cek apakah port 3000 sudah terpakai
lsof -i :3000

# Jika terpakai, gunakan port lain:
PORT=3001 npm start
```

### Data tidak sinkron?
- Pastikan kedua device terhubung ke internet
- Cek console browser (F12) untuk error
- Cek terminal server untuk error logs

### Login error?
- Pastikan credentials benar (lihat output saat server start)
- Cek apakah token sudah expired
- Clear localStorage dan coba login lagi

## 📱 Testing Multi-Device

Untuk test dengan 2 device:

**Laptop (Admin):**
```bash
npm start
# Buka http://localhost:3000
# Login dengan admin@azkolotte.id
```

**Phone (User):**
```
Buka browser mobile
Go to: http://<LAPTOP_IP>:3000
Login dengan user@azkolotte.id

<LAPTOP_IP> adalah IP lokal laptop, e.g. 192.168.1.100
```

Sekarang edit di laptop → data akan sync ke phone instantly!

## 🎯 Next Steps

1. **Upgrade Database**: Ganti file JSON dengan MongoDB/PostgreSQL
2. **Add WebSocket**: Real-time sync tanpa polling (ganti 30s interval)
3. **Encrypt Passwords**: Gunakan bcrypt untuk password hashing
4. **Add Audit Logs**: Track siapa edit apa dan kapan
5. **Backup**: Setup backup routine untuk data

## 📞 Support

Jika ada pertanyaan atau issue, silakan check server logs:
```bash
# Terminal server akan menunjukkan semua requests dan errors
```

---
**Version**: 1.0.0
**Last Updated**: 2024
