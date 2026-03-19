# YoqlamaQR — Real-time Attendance System

OTP + QR kod asosida real-time yoqlama tizimi.  
Stack: **Express.js · Socket.io · React · otplib · QRCode**

---

## 📁 Loyiha strukturasi

```
attendance/
├── server/
│   ├── index.js          # Express + Socket.io server
│   ├── package.json
│   └── Dockerfile
├── client/
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── index.css
│   │   └── pages/
│   │       ├── Landing.js   # Role tanlash
│   │       ├── HostPage.js  # O'qituvchi paneli
│   │       └── ClientPage.js # Talaba yoqlama
│   ├── public/index.html
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

---

## 🚀 Ishga tushirish (dev mode)

### 1. Server
```bash
cd server
npm install
npm run dev     # nodemon bilan
# yoki
npm start
```
Server: http://localhost:4000

### 2. Client
```bash
cd client
npm install
npm start
```
Client: http://localhost:3000

---

## 🐳 Docker bilan ishga tushirish

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000

---

## 🔌 API Endpoints

| Method | URL | Tavsif |
|--------|-----|--------|
| POST | `/api/session/create` | Yangi session yaratish |
| GET | `/api/session/:id` | Session ma'lumoti |
| POST | `/api/attend` | Yoqlama tasdiqlash |
| GET | `/api/session/:id/students` | Talabalar ro'yxati |

### Session yaratish
```json
POST /api/session/create
{
  "name": "Karimov Jasur",
  "subject": "Matematika"
}
```

### Yoqlama tasdiqlash
```json
POST /api/attend
{
  "sessionId": "AB12CD34",
  "otp": "123456",
  "username": "Aliyev Jasur"
}
```

---

## 🔁 Socket.io Events

| Event | Direction | Tavsif |
|-------|-----------|--------|
| `host:join` | client → server | Host sessionga ulashadi |
| `client:join` | client → server | Talaba room'ga ulashadi |
| `otp:update` | server → host | Yangi OTP + QR yuboriladi |
| `student:joined` | server → host | Yangi talaba qo'shilganda |

---

## ⚙️ Qanday ishlaydi

1. **Host** dars yaratadi → `sessionId` va `secret` generatsiya qilinadi
2. TOTP (Time-based OTP) har **30 soniyada** avtomatik yangilanadi
3. Host ekranida OTP, QR kod va countdown ko'rsatiladi
4. **Talaba** sessionId + username + OTP kiriting yoki QR scan qiling
5. Server TOTP tekshiradi → muvaffaqiyatli bo'lsa student lobby'ga qo'shiladi
6. Host real-time da Socket.io orqali yangi talabalarni ko'radi

---

## 🛡️ Xavfsizlik

- OTP TOTP standartida (RFC 6238) — server-side tekshiriladi
- Duplicate check: bir talaba bir marta qayd etiladi
- QR kod har OTP yangilanishida yangilanadi (eski QR ishlamaydi)
- Rate limiting qo'shish uchun `express-rate-limit` package'ini ishlating

---

## 📦 Dependencies

**Server:** express, socket.io, otplib, qrcode, uuid, cors  
**Client:** react, react-router-dom, socket.io-client, @zxing/library
