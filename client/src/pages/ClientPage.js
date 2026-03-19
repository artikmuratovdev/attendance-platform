import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { initConfig, getConfig } from '../config';
import ThemeToggle from '../components/ThemeToggle';

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-xl)', padding: '2rem', ...style,
    }}>{children}</div>
  );
}

function Label({ children }) {
  return (
    <div style={{
      fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--text3)',
      letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.6rem',
    }}>{children}</div>
  );
}

function Input({ label, value, onChange, placeholder, mono = false, large = false, maxLength, inputMode, onKeyDown }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      {label && <Label>{label}</Label>}
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        onKeyDown={onKeyDown}
        style={{
          width: '100%',
          background: focused ? 'var(--surface3)' : 'var(--surface2)',
          border: `1px solid ${focused ? 'rgba(79,142,255,0.4)' : 'var(--border)'}`,
          borderRadius: 'var(--r-sm)', outline: 'none', color: 'var(--text)',
          fontFamily: mono ? 'var(--mono)' : 'var(--font)',
          fontSize: large ? '1.7rem' : '0.95rem',
          padding: large ? '14px 18px' : '12px 16px',
          textAlign: large ? 'center' : 'left',
          letterSpacing: large ? '0.25em' : 'normal',
          transition: 'all 0.2s',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

/* ── QR Scanner ── */
function QRScanner({ onScan }) {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const [active, setActive] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const stop = () => {
    try {
      if (controlsRef.current) { controlsRef.current.stop(); controlsRef.current = null; }
    } catch {}
    try {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
    } catch {}
    setActive(false);
    setLoading(false);
  };

  const start = async () => {
    if (loading) return;
    setErr('');
    setLoading(true);
    try {
      const { BrowserQRCodeReader } = await import('@zxing/browser');
      const codeReader = new BrowserQRCodeReader();
      const devices = await BrowserQRCodeReader.listVideoInputDevices();

      if (!devices || devices.length === 0) {
        setErr('Kamera topilmadi.');
        setLoading(false);
        return;
      }

      const device =
        devices.find(d =>
          d.label.toLowerCase().includes('back') ||
          d.label.toLowerCase().includes('rear') ||
          d.label.toLowerCase().includes('environment')
        ) || devices[devices.length - 1];

      setActive(true);
      setLoading(false);

      controlsRef.current = await codeReader.decodeFromVideoDevice(
        device.deviceId,
        videoRef.current,
        (result) => {
          if (!result) return;
          try {
            const parsed = JSON.parse(result.getText());
            if (parsed.sessionId && parsed.otp) {
              onScan(parsed);
              stop();
            }
          } catch {}
        }
      );
    } catch (e) {
      setErr('Kamera xatoligi: ' + (e.message || e));
      setActive(false);
      setLoading(false);
    }
  };

  useEffect(() => () => stop(), []);

  return (
    <div>
      {/* Video — har doim DOMda */}
      <div style={{
        position: 'relative', marginBottom: '1rem', borderRadius: 12,
        overflow: 'hidden', border: '1px solid var(--border2)',
        display: active ? 'block' : 'none',
      }}>
        <video
          ref={videoRef}
          style={{ width: '100%', maxHeight: 280, objectFit: 'cover', display: 'block' }}
          playsInline muted autoPlay
        />
        {/* Scan frame */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
        }}>
          <div style={{ width: 180, height: 180, position: 'relative' }}>
            {[
              { top: 0, left: 0, borderTop: '3px solid var(--accent)', borderLeft: '3px solid var(--accent)', borderRadius: '4px 0 0 0' },
              { top: 0, right: 0, borderTop: '3px solid var(--accent)', borderRight: '3px solid var(--accent)', borderRadius: '0 4px 0 0' },
              { bottom: 0, left: 0, borderBottom: '3px solid var(--accent)', borderLeft: '3px solid var(--accent)', borderRadius: '0 0 0 4px' },
              { bottom: 0, right: 0, borderBottom: '3px solid var(--accent)', borderRight: '3px solid var(--accent)', borderRadius: '0 0 4px 0' },
            ].map((s, i) => (
              <div key={i} style={{ position: 'absolute', width: 28, height: 28, ...s }} />
            ))}
            <div style={{
              position: 'absolute', left: 0, right: 0, height: 2,
              background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
              animation: 'scanLine 1.8s linear infinite',
            }} />
          </div>
        </div>
      </div>

      {err && (
        <div style={{
          color: 'var(--red)', fontSize: '0.85rem', marginBottom: '0.75rem',
          padding: '10px', background: 'var(--red-dim)', borderRadius: 8,
          border: '1px solid rgba(255,92,92,0.2)',
        }}>⚠️ {err}</div>
      )}

      <button
        onClick={active ? stop : start}
        style={{
          width: '100%', padding: '13px', borderRadius: '10px',
          background: active
            ? 'var(--surface3)'
            : loading
              ? 'rgba(79,142,255,0.3)'
              : 'linear-gradient(135deg, #3b74e8, #6d4afe)',
          color: 'var(--text)', fontFamily: 'var(--font)', fontWeight: 600,
          fontSize: '0.95rem', cursor: loading ? 'wait' : 'pointer',
          transition: 'all 0.2s',
          border: active ? '1px solid var(--border2)' : 'none',
          opacity: 1,
        }}
      >
        {loading ? '⏳ Kamera yoqilmoqda...' : active ? '⏹ Kamerani o\'chirish' : '📷 Kamerani yoqish'}
      </button>
    </div>
  );
}

/* ── Success Screen ── */
function SuccessScreen({ student, onReset }) {
  return (
    <div className="anim-popin" style={{ textAlign: 'center' }}>
      <div style={{
        width: 90, height: 90, borderRadius: '50%',
        background: 'var(--green-dim)', border: '2px solid rgba(35,209,139,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '2.5rem', margin: '0 auto 1.5rem',
        boxShadow: '0 0 40px rgba(35,209,139,0.2)',
      }}>✅</div>

      <div style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: '0.5rem' }}>
        Yoqlama tasdiqlandi!
      </div>
      <div style={{ color: 'var(--text2)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--green)' }}>{student?.username}</strong> muvaffaqiyatli qayd etildi
      </div>

      <div style={{
        background: 'var(--surface2)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-sm)', padding: '10px 16px', marginBottom: '1.5rem',
        fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text3)',
      }}>
        {new Date(student?.joinedAt).toLocaleString('uz-UZ')}
      </div>

      <button
        onClick={onReset}
        style={{
          width: '100%', padding: '13px', borderRadius: '10px',
          background: 'var(--surface2)', color: 'var(--text)', fontFamily: 'var(--font)',
          fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer',
          border: '1px solid var(--border2)', transition: 'all 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface3)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--surface2)'}
      >
        Yana kiritish
      </button>
    </div>
  );
}

/* ── Main ── */
export default function ClientPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('qr'); // default QR
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const attend = async ({ sid, code, uname }) => {
    const cleanSid = (sid || '').toString().trim().toUpperCase();
    const cleanCode = (code || '').toString().trim();
    const cleanUname = (uname || '').toString().trim();

    if (!cleanSid) { setError('Session ID topilmadi'); return; }
    if (!cleanCode) { setError('OTP kiritilmagan'); return; }
    if (!cleanUname) { setError('Ism kiritilmagan'); return; }

    setLoading(true);
    setError('');

    try {
      await initConfig();
      const { API, SOCKET } = getConfig();

      const res = await fetch(`${API}/api/session/attend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: cleanSid,
          otp: cleanCode,
          username: cleanUname,
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Xatolik yuz berdi'); return; }

      setResult(data.student);

      // Socket orqali ulan — chiqib ketsa lobbydan o'chiriladi
      const socket = io(SOCKET);
      socket.emit('client:join', {
        sessionId: cleanSid,
        studentId: data.student.id,
      });
      window.addEventListener('beforeunload', () => socket.disconnect());

    } catch (e) {
      setError('Server bilan ulanishda xatolik: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = (parsed) => {
    if (!parsed.sessionId || !parsed.otp) {
      setError('QR kod noto\'g\'ri format');
      return;
    }
    if (!username.trim()) {
      setError('Avval ismingizni kiriting');
      return;
    }
    attend({ sid: parsed.sessionId, code: parsed.otp, uname: username });
  };

  const handleOTPSubmit = () => {
    if (!otp.trim()) { setError('OTP kiriting'); return; }
    // OTP tab da session ID ham kerak
    if (!sessionIdForOTP.trim()) { setError('Session ID kiriting'); return; }
    attend({ sid: sessionIdForOTP, code: otp, uname: username });
  };

  // OTP tab uchun alohida sessionId (faqat OTP tabda ko'rinadi)
  const [sessionIdForOTP, setSessionIdForOTP] = useState('');
  const canOTPSubmit = sessionIdForOTP.trim() && username.trim() && otp.length === 6;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>

      {/* Theme toggle */}
      <div style={{ position: 'fixed', top: '1.25rem', right: '1.25rem', zIndex: 100 }}>
        <ThemeToggle />
      </div>

      <div style={{ width: '100%', maxWidth: '440px' }}>

        {/* Back */}
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer',
            fontFamily: 'var(--mono)', fontSize: '12px', marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', gap: 6, padding: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
        >
          ← Bosh sahifa
        </button>

        <Card className="anim-popin">
          {result ? (
            <SuccessScreen
              student={result}
              onReset={() => { setResult(null); setOtp(''); setError(''); }}
            />
          ) : (
            <>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: 'rgba(35,209,139,0.1)',
                  border: '1px solid rgba(35,209,139,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.6rem', margin: '0 auto 1rem',
                }}>🎓</div>
                <div style={{ fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>
                  Yoqlamaga kirish
                </div>
                <div style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>
                  OTP yoki QR kod orqali tasdiqlang
                </div>
              </div>

              {/* Username — har doim ko'rinadi */}
              <Input
                label="To'liq ismingiz"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Masalan: Aliyev Jasur"
              />

              {/* Tabs */}
              <div style={{
                display: 'flex', background: 'var(--surface2)',
                borderRadius: 10, padding: 4, marginBottom: '1.25rem', gap: 4,
              }}>
                {[
                  { key: 'qr', icon: '📷', label: 'QR Scan' },
                  { key: 'otp', icon: '🔢', label: 'OTP Parol' },
                ].map(t => (
                  <button
                    key={t.key}
                    onClick={() => { setTab(t.key); setError(''); }}
                    style={{
                      flex: 1, padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: tab === t.key ? 'var(--surface3)' : 'transparent',
                      color: tab === t.key ? 'var(--text)' : 'var(--text2)',
                      fontFamily: 'var(--font)', fontWeight: 600, fontSize: '0.85rem',
                      border: tab === t.key ? '1px solid var(--border2)' : '1px solid transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  background: 'var(--red-dim)', border: '1px solid rgba(255,92,92,0.2)',
                  borderRadius: 8, padding: '10px 14px', color: 'var(--red)',
                  fontSize: '0.85rem', marginBottom: '1rem',
                }}>
                  ⚠️ {error}
                </div>
              )}

              {/* QR tab */}
              {tab === 'qr' && (
                <>
                  {!username.trim() && (
                    <div style={{
                      background: 'var(--amber-dim)', border: '1px solid rgba(245,166,35,0.25)',
                      borderRadius: 8, padding: '10px 14px', color: 'var(--amber)',
                      fontSize: '0.85rem', marginBottom: '1rem',
                    }}>
                      ⚠️ Kamerani yoqishdan oldin ismingizni kiriting
                    </div>
                  )}
                  <QRScanner onScan={handleQRScan} />
                  {loading && (
                    <div style={{
                      textAlign: 'center', color: 'var(--accent)',
                      fontFamily: 'var(--mono)', fontSize: '0.85rem', marginTop: '1rem',
                    }}>
                      ⏳ Tekshirilmoqda...
                    </div>
                  )}
                </>
              )}

              {/* OTP tab */}
              {tab === 'otp' && (
                <>
                  <Input
                    label="Session ID"
                    value={sessionIdForOTP}
                    onChange={e => setSessionIdForOTP(e.target.value.replace(/\D/g, '').slice(0, 7))}
                    placeholder="1234567"
                    mono
                  />
                  <Input
                    label="6 xonali OTP parol"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="● ● ● ● ● ●"
                    mono large
                    inputMode="numeric"
                    onKeyDown={e => e.key === 'Enter' && canOTPSubmit && !loading && handleOTPSubmit()}
                  />
                  <button
                    disabled={!canOTPSubmit || loading}
                    onClick={handleOTPSubmit}
                    style={{
                      width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
                      background: canOTPSubmit && !loading
                        ? 'linear-gradient(135deg, #1cb97c, #0d9488)'
                        : 'var(--surface2)',
                      color: canOTPSubmit && !loading ? '#fff' : 'var(--text2)',
                      fontFamily: 'var(--font)', fontWeight: 700, fontSize: '0.95rem',
                      cursor: canOTPSubmit && !loading ? 'pointer' : 'not-allowed',
                      opacity: canOTPSubmit && !loading ? 1 : 0.6,
                      transition: 'all 0.2s',
                      boxShadow: canOTPSubmit && !loading ? '0 4px 16px rgba(35,209,139,0.25)' : 'none',
                    }}
                  >
                    {loading ? '⏳ Tekshirilmoqda...' : '✓ Yoqlamani tasdiqlash'}
                  </button>
                </>
              )}

              <div style={{
                textAlign: 'center', marginTop: '1rem',
                fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--text3)',
              }}>
                OTP har 30 soniyada yangilanadi · Tez kiriting!
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}