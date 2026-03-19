const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { totp } = require('otplib');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
}));

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
  },
});
app.use(express.json());

// In-memory store
const sessions = {}; // sessionId -> { secret, hostSocketId, students: [], name, subject }

// OTP config: 30 second step
totp.options = { step: 30, digits: 6 , window:1};

function generateOTP(secret) {
  return totp.generate(secret);
}

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function generateBase32Secret(len = 32) {
  let s = '';
  for (let i = 0; i < len; i++) s += BASE32[Math.floor(Math.random() * 32)];
  return s;
}

function getRemainingSeconds() {
  const epoch = Math.round(Date.now() / 1000);
  const step = 30;
  return step - (epoch % step);
}

async function generateQR(sessionId, otp) {
  const data = JSON.stringify({ sessionId, otp });
  return await QRCode.toDataURL(data, {
    errorCorrectionLevel: 'M',
    width: 300,
    margin: 2,
    color: { dark: '#0f172a', light: '#ffffff' },
  });
}

// REST: Create session
app.post('/api/session/create', async (req, res) => {
  const { name, subject } = req.body;
  const sessionId = uuidv4().slice(0, 8).toUpperCase();
  const secret = generateBase32Secret(32);

  const otp = generateOTP(secret);
  const qrData = await generateQR(sessionId, otp);

  sessions[sessionId] = {
    secret,
    hostSocketId: null,
    students: [],
    name: name || 'Host',
    subject: subject || 'Dars',
    otp,
    qrData,
    createdAt: Date.now(),
  };

  res.json({ sessionId, otp, qrData, remaining: getRemainingSeconds() });
});

// REST: Get session info (for client)
app.get('/api/session/:sessionId', (req, res) => {
  const session = sessions[req.params.sessionId];
  if (!session) return res.status(404).json({ error: 'Session topilmadi' });
  res.json({
    sessionId: req.params.sessionId,
    subject: session.subject,
    name: session.name,
    studentCount: session.students.length,
  });
});

// REST: Verify OTP or QR code attendance
app.post('/api/attend', async (req, res) => {
  const { sessionId, otp, username } = req.body;

  if (!sessionId || !otp || !username) {
    return res.status(400).json({ error: "sessionId, otp va username kerak" });
  }

  const session = sessions[sessionId];
  if (!session) return res.status(404).json({ error: 'Session topilmadi' });

  const isValid = totp.verify({ token: otp, secret: session.secret });
  if (!isValid) return res.status(401).json({ error: 'OTP noto\'g\'ri yoki muddati o\'tgan' });

  // Check duplicate
  const exists = session.students.find(s => s.username === username);
  if (exists) return res.status(409).json({ error: 'Siz allaqachon qayd etilgansiz', student: exists });

  const student = {
    id: uuidv4(),
    username,
    joinedAt: new Date().toISOString(),
    avatar: username.charAt(0).toUpperCase(),
  };

  session.students.push(student);

  // Notify host in real time
  if (session.hostSocketId) {
    io.to(session.hostSocketId).emit('student:joined', student);
  }

  res.json({ success: true, student });
});

// REST: Get students list
app.get('/api/session/:sessionId/students', (req, res) => {
  const session = sessions[req.params.sessionId];
  if (!session) return res.status(404).json({ error: 'Session topilmadi' });
  res.json({ students: session.students });
});

// Socket.io
io.on('connection', (socket) => {
  console.log('Connected:', socket.id);

  // Host joins their session room
  socket.on('host:join', ({ sessionId }) => {
    const session = sessions[sessionId];
    if (!session) return;
    session.hostSocketId = socket.id;
    socket.join(`host:${sessionId}`);
    console.log(`Host joined session ${sessionId}`);

    // Start OTP rotation broadcaster for this session
    startOTPBroadcast(sessionId, socket);
  });

  // Client joins session room (for lobby updates)
  socket.on('client:join', ({ sessionId }) => {
    socket.join(`session:${sessionId}`);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected:', socket.id);
  });
});

// OTP Broadcaster per session
const broadcasters = {};

async function startOTPBroadcast(sessionId, hostSocket) {
  if (broadcasters[sessionId]) {
    clearInterval(broadcasters[sessionId]);
  }

  async function broadcast() {
    const session = sessions[sessionId];
    if (!session) return;

    const otp = generateOTP(session.secret);
    const qrData = await generateQR(sessionId, otp);
    session.otp = otp;
    session.qrData = qrData;

    hostSocket.emit('otp:update', {
      otp,
      qrData,
      remaining: getRemainingSeconds(),
    });
  }

  // Initial broadcast
  await broadcast();

  // Sync with 30s cycle
  const remaining = getRemainingSeconds();
  setTimeout(async () => {
    await broadcast();
    broadcasters[sessionId] = setInterval(broadcast, 30000);
  }, remaining * 1000);
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
