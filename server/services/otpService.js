const { totp } = require('otplib');
const QRCode = require('qrcode');

totp.options = { step: 30, digits: 6, window: 1 };

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function generateBase32Secret(len = 32) {
  let s = '';
  for (let i = 0; i < len; i++) s += BASE32[Math.floor(Math.random() * 32)];
  return s;
}

function generateOTP(secret) {
  return totp.generate(secret);
}

function verifyOTP(token, secret) {
  return totp.verify({ token: String(token).trim(), secret });
}

function getRemainingSeconds() {
  return 30 - (Math.round(Date.now() / 1000) % 30);
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

module.exports = { generateBase32Secret, generateOTP, verifyOTP, getRemainingSeconds, generateQR };