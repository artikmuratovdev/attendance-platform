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

const allowedOrigins = (process.env.CLIENT_URL)
  .split(',').map(u => u.trim()).filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
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

app.use(cors(corsOptions));
app.options('*',cors(corsOptions));
app.use(express.json());

app.get('/api/health', (_, res) => res.json({ ok: true }));
app.use('/api', sessionRoutes);
app.set('io', io);

registerSocketHandlers(io);

// DB ga ulanib keyin serverni ishga tushir
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`[SERVER] Running on port ${PORT}`));
});