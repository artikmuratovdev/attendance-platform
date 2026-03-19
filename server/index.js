require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');

const { createSocketServer } = require('./config/socket');
const { registerSocketHandlers } = require('./socket/handlers');
const sessionRoutes = require('./routes/session');

const app = express();
const server = http.createServer(app);
const io = createSocketServer(server);

const allowedOrigins = (process.env.CLIENT_URL)
.split(',')
.map(u => u.trim())
.filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Postman yoki server-to-server uchun origin yo'q bo'lishi mumkin
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api', sessionRoutes);

// Socket — io ni handlerlarga uzatish
registerSocketHandlers(io);

// Student qo'shilganda hostga xabar berish (routes ichidan io kerak)
// io ni global qilish o'rniga req ga ulaymiz
app.set('io', io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`[SERVER] Running on port ${PORT}`));