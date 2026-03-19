require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');

const { connectDB } = require('./config/database');
const { createSocketServer } = require('./config/socket');
const { registerSocketHandlers } = require('./socket/handlers');
const sessionRoutes = require('./routes/session');

const app = express();
const server = http.createServer(app);
const io = createSocketServer(server);

const allowedOrigins = (process.env.CLIENT_URL || '*')
  .split(',').map(u => u.trim()).filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  res.setHeader('bypass-tunnel-reminder', 'true');
  next();
});

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/session', sessionRoutes);
app.set('io', io);

registerSocketHandlers(io);

// DB ga ulanib keyin serverni ishga tushir
connectDB().then(() => {
  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => console.log(`[SERVER] Running on port ${PORT}`));
});