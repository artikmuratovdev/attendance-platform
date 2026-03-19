const sessions = {};

function getSession(sessionId) {
  return sessions[sessionId];
}

function createSession(sessionId, data) {
  sessions[sessionId] = data;
  return sessions[sessionId];
}

function deleteSession(sessionId) {
  delete sessions[sessionId];
}

function getAllSessions() {
  return sessions;
}

module.exports = { getSession, createSession, deleteSession, getAllSessions };