const API = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:5000`;
const SOCKET = API;

export { API, SOCKET };