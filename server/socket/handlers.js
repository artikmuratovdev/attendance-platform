const { getSession } = require('../services/sessionStore');
const { generateOTP, generateQR, getRemainingSeconds } = require('../services/otpService');

const broadcasters = {};

async function startOTPBroadcast(sessionId, hostSocket) {
  if (broadcasters[sessionId]) clearTimeout(broadcasters[sessionId]);

  async function broadcast() {
    const session = getSession(sessionId);
    if (!session) return;

    const otp = generateOTP(session.secret);
    const qrData = await generateQR(sessionId, otp);
    session.otp = otp;
    session.qrData = qrData;

    console.log(`[OTP] Session ${sessionId} updated: ${otp}`);
    hostSocket.emit('otp:update', { otp, qrData, remaining: getRemainingSeconds() });

    broadcasters[sessionId] = setTimeout(broadcast, getRemainingSeconds() * 1000);
  }

  await broadcast();
}

function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('[SOCKET] Connected:', socket.id);

    socket.on('host:join', ({ sessionId }) => {
      const session = getSession(sessionId);
      if (!session) return;
      session.hostSocketId = socket.id;
      socket.join(`host:${sessionId}`);
      console.log(`[SOCKET] Host joined: ${sessionId}`);
      startOTPBroadcast(sessionId, socket);
    });

    socket.on('client:join', ({ sessionId, studentId }) => {
      const session = getSession(sessionId);
      if (!session) return;
      socket.join(`session:${sessionId}`);
      socket.data.sessionId = sessionId;
      socket.data.studentId = studentId;

      // Hostga xabar — student online
      if (session.hostSocketId) {
        io.to(session.hostSocketId).emit('student:online', { studentId });
      }
    });

    socket.on('disconnect', () => {
      const { sessionId, studentId } = socket.data || {};
      if (!sessionId || !studentId) return;

      const session = getSession(sessionId);
      if (!session) return;

      session.students = session.students.filter(s => s.id !== studentId);

      if (session.hostSocketId) {
        io.to(session.hostSocketId).emit('student:left', { studentId });
      }

      console.log(`[SOCKET] Student left: ${studentId} from ${sessionId}`);
    });
  });
}

module.exports = { registerSocketHandlers };