const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const {
  generateBase32Secret,
  generateOTP,
  verifyOTP,
  getRemainingSeconds,
  generateQR,
} = require("../services/otpService");
const { getSession, createSession } = require("../services/sessionStore");

// POST /api/session/create
router.post("/create", async (req, res) => {
  const { name, subject } = req.body;
  const sessionId = uuidv4().slice(0, 8).toUpperCase();
  const secret = generateBase32Secret(32);
  const otp = generateOTP(secret);
  const qrData = await generateQR(sessionId, otp);

  createSession(sessionId, {
    secret,
    hostSocketId: null,
    students: [],
    name: name || "Host",
    subject: subject || "Dars",
    otp,
    qrData,
    createdAt: Date.now(),
  });

  console.log(`[SESSION] Created: ${sessionId}`);
  res.json({ sessionId, otp, qrData, remaining: getRemainingSeconds() });
});

// GET /api/session/:sessionId
router.get("/:sessionId", (req, res) => {
  const session = getSession(req.params.sessionId);
  if (!session) return res.status(404).json({ error: "Session topilmadi" });
  res.json({
    sessionId: req.params.sessionId,
    subject: session.subject,
    name: session.name,
    studentCount: session.students.length,
  });
});

// GET /api/session/:sessionId/students
router.get("/:sessionId/students", (req, res) => {
  const session = getSession(req.params.sessionId);
  if (!session) return res.status(404).json({ error: "Session topilmadi" });
  res.json({ students: session.students });
});

// POST /api/attend
router.post("/attend", async (req, res) => {
  const { sessionId, otp, username } = req.body;

  if (!sessionId || !otp || !username) {
    return res.status(400).json({ error: "sessionId, otp va username kerak" });
  }

  const sid = sessionId.trim().toUpperCase();
  const session = getSession(sid);
  if (!session) return res.status(404).json({ error: "Session topilmadi" });

  const isValid = verifyOTP(otp, session.secret);
  const expected = generateOTP(session.secret);
  console.log(
    `[ATTEND] sid=${sid} token=${otp} expected=${expected} valid=${isValid}`,
  );

  if (!isValid) {
    return res.status(401).json({ error: "OTP noto'g'ri yoki muddati o'tgan" });
  }

  const exists = session.students.find((s) => s.username === username);
  if (exists)
    return res
      .status(409)
      .json({ error: "Siz allaqachon qayd etilgansiz", student: exists });

  const student = {
    id: uuidv4(),
    username,
    joinedAt: new Date().toISOString(),
    avatar: username.charAt(0).toUpperCase(),
  };

  session.students.push(student);
  const io = req.app.get("io");
  if (io && session.hostSocketId) {
    io.to(session.hostSocketId).emit("student:joined", student);
  }

  res.json({ success: true, student });
});

module.exports = router;
