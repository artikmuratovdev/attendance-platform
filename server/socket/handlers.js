const {
  getSession,
  updateSession,
  removeStudent,
  setStudentOnline,
} = require('../services/sessionStore');
const {
  generateOTP,
  generateQR,
  getRemainingSeconds,
} = require('../services/otpService');

const broadcasters = {};

async function startOTPBroadcast(sessionId, hostSocket) {
  if (broadcasters[sessionId]) clearTimeout(broadcasters[sessionId]);

  async function broadcast() {
    const session = await getSession(sessionId);
    if (!session) return;

    const otp = generateOTP(session.secret);
    const qrData = await generateQR(sessionId, otp);

    await updateSession(sessionId, { otp, qrData });

    console.log(`[OTP] Session ${sessionId}: ${otp}`);
    hostSocket.emit('otp:update', {
      otp,
      qrData,
      remaining: getRemainingSeconds(),
    });

    broadcasters[sessionId] = setTimeout(broadcast, getRemainingSeconds() * 1000);
  }

  await broadcast();
}

function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('[SOCKET] Connected:', socket.id);

    socket.on('host:join', async ({ sessionId }) => {
      const session = await getSession(sessionId);
      if (!session) return;

      await updateSession(sessionId, { hostSocketId: socket.id });
      socket.join(`host:${sessionId}`);
      socket.data.sessionId = sessionId;
      socket.data.role = 'host';

      console.log(`[SOCKET] Host joined: ${sessionId}`);

      // Reload bo'lganda mavjud studentlarni qaytarish
      const fresh = await getSession(sessionId);
      socket.emit('students:sync', { students: fresh.students });

      startOTPBroadcast(sessionId, socket);
    });

    socket.on('client:join', async ({ sessionId, studentId }) => {
      const session = await getSession(sessionId);
      if (!session) return;

      socket.join(`session:${sessionId}`);
      socket.data.sessionId = sessionId;
      socket.data.studentId = studentId;
      socket.data.role = 'client';

      await setStudentOnline(sessionId, studentId, true);

      if (session.hostSocketId) {
        io.to(session.hostSocketId).emit('student:online', { studentId, online: true });
      }
    });

    socket.on('disconnect', async () => {
      const { sessionId, studentId, role } = socket.data || {};
      if (!sessionId) return;

      if (role === 'client' && studentId) {
        await removeStudent(sessionId, studentId);

        const session = await getSession(sessionId);
        if (session && session.hostSocketId) {
          io.to(session.hostSocketId).emit('student:left', { studentId });
        }
        console.log(`[SOCKET] Student left: ${studentId}`);
      }
    });
  });
}

module.exports = { registerSocketHandlers };