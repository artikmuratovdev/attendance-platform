const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  id: String,
  username: String,
  joinedAt: String,
  avatar: String,
  online: { type: Boolean, default: true },
});

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  secret: { type: String, required: true },
  name: String,
  subject: String,
  hostSocketId: { type: String, default: null },
  students: [studentSchema],
  otp: String,
  createdAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
});

module.exports = mongoose.model('Session', sessionSchema);