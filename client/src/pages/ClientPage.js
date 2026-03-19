import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { API, SOCKET } from '../config';

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
    <div style={{ fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
      {children}
    </div>
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
          width: '100%', background: focused ? 'var(--surface3)' : 'var(--surface2)',
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

function QRScanner({ onScan, disabled }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const [active, setActive] = useState(false);
  const [err, setErr] = useState('');

  const start = async () => {
    setErr('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setActive(true);
      intervalRef.current = setInterval(() => {
        const v = videoRef.current; const c = canvasRef.current;
        if (!v || v.readyState < 2) return;
        c.width = v.videoWidth; c.height = v.videoHeight;
        c.getContext('2d').drawImage(v, 0, 0);
        if ('BarcodeDetector' in window) {
          new window.BarcodeDetector({ formats: ['qr_code'] }).detect(c).then(r => {
            if (r.length > 0) {
              try { onScan(JSON.parse(r[0].rawValue)); stop(); } catch {}
            }
          });
        }
      }, 500);
    } catch { setErr('Kamera ruxsati berilmadi.'); }
  };

  const stop = () => {
    videoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
    if (intervalRef.current) clearInterval(intervalRef.current);
    setActive(false);
  };

  useEffect(() => () => stop(), []);

  return (
    <div>
      {active && (
        <div style={{ position: 'relative', marginBottom: '1rem', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border2)' }}>
          <video ref={videoRef} style={{ width: '100%', maxHeight: 240, objectFit: 'cover', display: 'block' }} playsInline muted />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ width: 160, height: 160, position: 'relative' }}>
              {[{ top: 0, left: 0 }, { top: 0, right: 0 }, { bottom: 0, left: 0 }, { bottom: 0, right: 0 }].map((pos, i) => (
                <div key={i} style={{
                  position: 'absolute', width: 24, height: 24, ...pos,
                  borderTop: i < 2 ? '2px solid var(--accent)' : 'none',
                  borderBottom: i >= 2 ? '2px solid var(--accent)' : 'none',
                  borderLeft: i % 2 === 0 ? '2px solid var(--accent)' : 'none',
                  borderRight: i % 2 === 1 ? '2px solid var(--accent)' : 'none',
                  borderRadius: i === 0 ? '4px 0 0 0' : i === 1 ? '0 4px 0 0' : i === 2 ? '0 0 0 4px' : '0 0 4px 0',
                }} />
              ))}
              <div style={{
                position: 'absolute', left: 0, right: 0, height: 2,
                background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
                animation: 'scanLine 1.8s linear infinite',
              }} />
            </div>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {err && (
        <div style={{ color: 'var(--red)', fontSize: '0.85rem', marginBottom: '0.75rem', padding: '10px', background: 'var(--red-dim)', borderRadius: 8, border: '1px solid rgba(255,92,92,0.2)' }}>
          {err}
        </div>
      )}
      <button
        onClick={active ? stop : start}
        disabled={!active && disabled}
        style={{
          width: '100%', padding: '13px', borderRadius: '10px',
          background: active ? 'var(--surface3)' : 'linear-gradient(135deg, #3b74e8, #6d4afe)',
          color: '#fff', fontFamily: 'var(--font)', fontWeight: 600, fontSize: '0.95rem',
          cursor: (!active && disabled) ? 'not-allowed' : 'pointer',
          opacity: (!active && disabled) ? 0.5 : 1, transition: 'all 0.2s',
          border: active ? '1px solid var(--border2)' : 'none',
        }}
      >
        {active ? '⏹ Kamerani o\'chirish' : '📷 Kamerani yoqish'}
      </button>
      {!active && disabled && (
        <div style={{ marginTop: 8, fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'center' }}>
          Avval Session ID va ismni kiriting
        </div>
      )}
    </div>
  );
}

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

      <div style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.03em', color: '#fff', marginBottom: '0.5rem' }}>
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

export default function ClientPage() {
  const { sessionId: paramId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('otp');
  const [sessionId, setSessionId] = useState(paramId || '');
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const canScan = sessionId.trim().length > 0 && username.trim().length > 0;
  const canSubmit = sessionId.trim() && username.trim() && otp.length === 6;

  const attend = async ({ sid, code, uname }) => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/api/attend`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sid.trim().toUpperCase(), otp: code.trim(), username: uname.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Xatolik yuz berdi'); return; }
      setResult(data.student);
    } catch { setError('Server bilan ulanishda xatolik'); }
    finally { setLoading(false); }
  };

  const handleQRScan = (parsed) => {
    if (parsed.sessionId && parsed.otp) {
      attend({ sid: parsed.sessionId, code: parsed.otp, uname: username });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>

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

        <ThemeToggle />

        <Card className="anim-popin">
          {result ? (
            <SuccessScreen student={result} onReset={() => { setResult(null); setOtp(''); setError(''); }} />
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, background: 'rgba(35,209,139,0.1)',
                  border: '1px solid rgba(35,209,139,0.15)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '1.6rem', margin: '0 auto 1rem',
                }}>🎓</div>
                <div style={{ fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.03em', color: '#fff', marginBottom: 4 }}>
                  Yoqlamaga kirish
                </div>
                <div style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>
                  OTP yoki QR kod orqali tasdiqlang
                </div>
              </div>

              <Input
                label="Session ID"
                value={sessionId}
                onChange={e => setSessionId(e.target.value.toUpperCase())}
                placeholder="Masalan: AB12CD34"
                mono
              />
              <Input
                label="To'liq ismingiz"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Masalan: Aliyev Jasur"
              />

              <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: 10, padding: 4, marginBottom: '1.25rem', gap: 4 }}>
                {[{ key: 'otp', icon: '🔢', label: 'OTP Parol' }, { key: 'qr', icon: '📷', label: 'QR Scan' }].map(t => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    style={{
                      flex: 1, padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: tab === t.key ? 'var(--surface3)' : 'transparent',
                      color: tab === t.key ? '#fff' : 'var(--text2)',
                      fontFamily: 'var(--font)', fontWeight: 600, fontSize: '0.85rem',
                      border: tab === t.key ? '1px solid var(--border2)' : '1px solid transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {error && (
                <div style={{
                  background: 'var(--red-dim)', border: '1px solid rgba(255,92,92,0.2)',
                  borderRadius: 8, padding: '10px 14px', color: '#fca5a5',
                  fontSize: '0.85rem', marginBottom: '1rem',
                }}>
                  ⚠️ {error}
                </div>
              )}

              {tab === 'otp' && (
                <>
                  <Input
                    label="6 xonali OTP parol"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="● ● ● ● ● ●"
                    mono large
                    inputMode="numeric"
                    onKeyDown={e => e.key === 'Enter' && canSubmit && !loading && attend({ sid: sessionId, code: otp, uname: username })}
                  />
                  <button
                    disabled={!canSubmit || loading}
                    onClick={() => attend({ sid: sessionId, code: otp, uname: username })}
                    style={{
                      width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
                      background: canSubmit && !loading ? 'linear-gradient(135deg, #1cb97c, #0d9488)' : 'var(--surface2)',
                      color: '#fff', fontFamily: 'var(--font)', fontWeight: 700, fontSize: '0.95rem',
                      cursor: canSubmit && !loading ? 'pointer' : 'not-allowed',
                      opacity: canSubmit && !loading ? 1 : 0.5, transition: 'all 0.2s',
                      boxShadow: canSubmit && !loading ? '0 4px 16px rgba(35,209,139,0.25)' : 'none',
                    }}
                  >
                    {loading ? '⏳ Tekshirilmoqda...' : '✓ Yoqlamani tasdiqlash'}
                  </button>
                </>
              )}

              {tab === 'qr' && (
                <QRScanner onScan={handleQRScan} disabled={!canScan} />
              )}

              <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--text3)' }}>
                OTP har 30 soniyada yangilanadi · Tez kiriting!
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}