const Session = require('../models/Session');

async function getSession(sessionId) {
  return await Session.findOne({ sessionId, active: true });
}

async function createSession(sessionId, data) {
  const session = new Session({ sessionId, ...data });
  await session.save();
  return session;
}

async function updateSession(sessionId, update) {
  return await Session.findOneAndUpdate(
    { sessionId },
    { $set: update },
    { new: true }
  );
}

async function addStudent(sessionId, student) {
  return await Session.findOneAndUpdate(
    { sessionId },
    { $push: { students: student } },
    { new: true }
  );
}

async function removeStudent(sessionId, studentId) {
  return await Session.findOneAndUpdate(
    { sessionId },
    { $pull: { students: { id: studentId } } },
    { new: true }
  );
}

async function setStudentOnline(sessionId, studentId, online) {
  return await Session.findOneAndUpdate(
    { sessionId, 'students.id': studentId },
    { $set: { 'students.$.online': online } },
    { new: true }
  );
}

async function deleteSession(sessionId) {
  return await Session.findOneAndUpdate(
    { sessionId },
    { $set: { active: false } }
  );
}

async function getAllSessions() {
  return await Session.find({ active: true });
}

module.exports = {
  getSession,
  createSession,
  updateSession,
  addStudent,
  removeStudent,
  setStudentOnline,
  deleteSession,
  getAllSessions,
};