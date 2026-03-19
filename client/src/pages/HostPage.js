import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { initConfig, getConfig } from '../config';
import ThemeToggle from '../components/ThemeToggle';

const TABS = ['📷 QR + OTP', '👥 Lobbi'];

function Tag({ children, color = 'var(--accent)', dim = 'var(--accent-dim)' }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: '10px', fontFamily: 'var(--mono)', letterSpacing: '0.12em',
      color, background: dim,
      border: `1px solid ${color === 'var(--accent)' ? 'rgba(79,142,255,0.15)' : 'rgba(35,209,139,0.15)'}`,
      borderRadius: '6px', padding: '3px 9px',
    }}>{children}</span>
  );
}

function Card({ children, style = {}, glow = false }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${glow ? 'rgba(79,142,255,0.25)' : 'var(--border)'}`,
      borderRadius: 'var(--r-lg)', padding: '1.5rem',
      boxShadow: glow ? '0 0 40px rgba(79,142,255,0.08)' : 'none',
      ...style,
    }}>{children}</div>
  );
}

function Label({ children }) {
  return (
    <div style={{
      fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--text3)',
      letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem',
    }}>{children}</div>
  );
}

/* ── Setup ── */
function SetupForm({ onCreate }) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !subject.trim() || loading) return;
    setLoading(true);
    await onCreate(name, subject);
    setLoading(false);
  };

  const inp = {
    width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 'var(--r-sm)', padding: '13px 16px', color: 'var(--text)',
    fontFamily: 'var(--font)', fontSize: '0.95rem', outline: 'none',
    marginBottom: '1rem', transition: 'border-color 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative' }}>
      <div style={{ position: 'fixed', top: '1.25rem', right: '1.25rem', zIndex: 100 }}>
        <ThemeToggle />
      </div>
      <div className="anim-popin" style={{
        width: '100%', maxWidth: '420px', background: 'var(--surface)',
        border: '1px solid var(--border)', borderRadius: 'var(--r-xl)',
        padding: '2.5rem', boxShadow: 'var(--shadow)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, background: 'var(--accent-dim)',
            border: '1px solid rgba(79,142,255,0.15)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', margin: '0 auto 1rem',
          }}>🖥️</div>
          <div style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: '0.4rem' }}>
            Yangi dars
          </div>
          <div style={{ color: 'var(--text2)', fontSize: '0.88rem' }}>Ma'lumotlarni kiriting</div>
        </div>

        <Label>O'qituvchi ismi</Label>
        <input style={inp} placeholder="Karimov Jasur" value={name}
          onChange={e => setName(e.target.value)}
          onFocus={e => e.target.style.borderColor = 'rgba(79,142,255,0.4)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
          onKeyDown={e => e.key === 'Enter' && handleCreate()} />

        <Label>Fan nomi</Label>
        <input style={inp} placeholder="Matematika" value={subject}
          onChange={e => setSubject(e.target.value)}
          onFocus={e => e.target.style.borderColor = 'rgba(79,142,255,0.4)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
          onKeyDown={e => e.key === 'Enter' && handleCreate()} />

        <button onClick={handleCreate} disabled={loading || !name.trim() || !subject.trim()} style={{
          width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
          background: 'linear-gradient(135deg, #3b74e8, #6d4afe)', color: '#fff',
          fontFamily: 'var(--font)', fontWeight: 700, fontSize: '1rem',
          cursor: loading || !name.trim() || !subject.trim() ? 'not-allowed' : 'pointer',
          opacity: loading || !name.trim() || !subject.trim() ? 0.5 : 1,
          boxShadow: '0 4px 20px rgba(79,142,255,0.3)',
        }}>
          {loading ? '⏳ Yaratilmoqda...' : '🚀 Darsni boshlash'}
        </button>
      </div>
    </div>
  );
}

/* ── QR + OTP tab ── */
function QROTPTab({ qrData, otp, remaining }) {
  const warn = remaining <= 8;
  const pct = (remaining / 30) * 100;
  const digits = otp ? otp.split('') : ['–','–','–','–','–','–'];
  const [copied, setCopied] = useState(false);

  const copyOtp = () => {
    navigator.clipboard.writeText(otp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card glow style={{ textAlign: 'center' }}>
      {/* QR Code — katta */}
      <Label>QR KOD — scan qiling</Label>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <div style={{
          padding: 16, borderRadius: 20, background: '#fff',
          boxShadow: warn
            ? '0 0 0 4px rgba(255,92,92,0.3), 0 20px 60px rgba(0,0,0,0.2)'
            : '0 0 0 4px rgba(79,142,255,0.18), 0 20px 60px rgba(0,0,0,0.15)',
          transition: 'box-shadow 0.4s',
          position: 'relative', overflow: 'hidden',
        }}>
          {qrData ? (
            <img
              src={qrData}
              alt="QR Code"
              style={{
                width: 'clamp(240px, 60vw, 340px)',
                height: 'clamp(240px, 60vw, 340px)',
                display: 'block', borderRadius: 10,
              }}
            />
          ) : (
            <div style={{
              width: 'clamp(240px, 60vw, 340px)', height: 'clamp(240px, 60vw, 340px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#f8faff', borderRadius: 10,
              color: '#aaa', fontSize: '0.85rem', fontFamily: 'var(--mono)',
            }}>Yuklanmoqda...</div>
          )}
          {/* Scan line */}
          <div style={{
            position: 'absolute', left: 16, right: 16, height: 2,
            background: 'linear-gradient(90deg, transparent, rgba(79,142,255,0.8), transparent)',
            animation: 'scanLine 2s linear infinite', pointerEvents: 'none',
          }} />
        </div>
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 0 1.25rem' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--text3)' }}>YOKI OTP</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      {/* OTP digits */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '1rem' }}>
        {digits.map((d, i) => (
          <div key={`${otp}-${i}`} style={{
            width: 'clamp(42px, 11vw, 58px)', height: 'clamp(54px, 14vw, 70px)',
            borderRadius: 12, background: 'var(--surface2)',
            border: `1px solid ${warn ? 'rgba(255,92,92,0.35)' : 'var(--border2)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--mono)', fontWeight: 500,
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            color: warn ? 'var(--red)' : 'var(--accent)',
            animation: 'digitFlip 0.3s cubic-bezier(.22,1,.36,1)',
            animationDelay: `${i * 0.04}s`, animationFillMode: 'both',
            transition: 'border-color 0.3s, color 0.3s',
            userSelect: 'none',
          }}>{d}</div>
        ))}
      </div>

      {/* Copy OTP button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <button onClick={copyOtp} style={{
          background: 'var(--surface2)', border: '1px solid var(--border2)',
          borderRadius: 8, padding: '8px 18px', cursor: 'pointer',
          fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.06em',
          color: copied ? 'var(--green)' : 'var(--text3)', transition: 'all 0.2s',
        }}>
          {copied ? '✓ Nusxalandi' : '📋 OTP nusxalash'}
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: 'var(--surface3)', borderRadius: 2, overflow: 'hidden', marginBottom: '0.5rem' }}>
        <div style={{
          height: '100%', borderRadius: 2,
          background: warn ? 'var(--red)' : 'var(--accent)',
          width: `${pct}%`, transition: 'width 1s linear, background 0.4s',
          boxShadow: warn ? '0 0 8px var(--red)' : '0 0 8px var(--accent)',
        }} />
      </div>
      <div style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: warn ? 'var(--red)' : 'var(--text3)' }}>
        {remaining}s da yangilanadi
      </div>
    </Card>
  );
}

/* ── Lobbi tab ── */
function LobbiTab({ students }) {
  const hue = (name) => (name.charCodeAt(0) * 53 + (name.charCodeAt(1) || 0) * 17) % 360;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Card style={{ textAlign: 'center', padding: '1.25rem' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1, marginBottom: 4 }}>
            {students.length}
          </div>
          <div style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: '0.08em' }}>
            QAYD ETILGAN
          </div>
        </Card>
        <Card style={{ textAlign: 'center', padding: '1.25rem' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--green)', lineHeight: 1, marginBottom: 4 }}>
            {students.filter(s => s.online !== false).length}
          </div>
          <div style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: '0.08em' }}>
            ONLINE
          </div>
        </Card>
      </div>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <Label>TALABALAR RO'YXATI</Label>
          {students.length > 0 && (
            <span style={{
              fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--green)',
              background: 'var(--green-dim)', border: '1px solid rgba(35,209,139,0.15)',
              borderRadius: '6px', padding: '2px 8px',
            }}>{students.length} ta</span>
          )}
        </div>

        {students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.4 }}>👁️</div>
            <div style={{ fontSize: '13px', fontFamily: 'var(--mono)', color: 'var(--text3)' }}>
              Talabalar kutilmoqda...
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '460px', overflowY: 'auto', paddingRight: 2 }}>
            {students.map((s, i) => {
              const h = hue(s.username);
              return (
                <div key={s.id} className="anim-slidein" style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 'var(--r-sm)', padding: '11px 14px',
                  animationDelay: `${Math.min(i * 0.04, 0.3)}s`,
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: `linear-gradient(135deg, hsl(${h},60%,38%), hsl(${(h+60)%360},60%,52%))`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '1rem', color: '#fff',
                    boxShadow: `0 0 12px hsla(${h},60%,50%,0.22)`,
                  }}>{s.avatar}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.username}
                    </div>
                    <div style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--text3)', marginTop: 2 }}>
                      {new Date(s.joinedAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: s.online !== false ? 'var(--green)' : 'var(--text3)',
                    boxShadow: s.online !== false ? '0 0 8px var(--green)' : 'none',
                  }} />
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ── Main ── */
export default function HostPage() {
  const [step, setStep] = useState('setup');
  const [session, setSession] = useState(null);
  const [otp, setOtp] = useState('');
  const [qrData, setQrData] = useState('');
  const [remaining, setRemaining] = useState(30);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const socketRef = useRef(null);
  const timerRef = useRef(null);

  const startTick = useCallback((init) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRemaining(init);
    timerRef.current = setInterval(() => setRemaining(p => p <= 1 ? 30 : p - 1), 1000);
  }, []);

  const handleCreate = async (name, subject) => {
    await initConfig();
    const { API, SOCKET } = getConfig();

    const res = await fetch(`${API}/api/create`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, subject }),
    });
    const data = await res.json();
    setSession(data); setOtp(data.otp); setQrData(data.qrData);
    startTick(data.remaining); setStep('active');

    const socket = io(SOCKET);
    socketRef.current = socket;
    socket.emit('host:join', { sessionId: data.sessionId });
    socket.on('otp:update', ({ otp: o, qrData: q, remaining: r }) => {
      setOtp(o); setQrData(q); startTick(r);
    });
    socket.on('student:joined', s => setStudents(prev => [s, ...prev]));
    socket.on('student:left', ({ studentId }) => setStudents(prev => prev.filter(s => s.id !== studentId)));
    socket.on('students:sync', ({ students: ss }) => setStudents(ss));
  };

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (socketRef.current) socketRef.current.disconnect();
  }, []);

  if (step === 'setup') return <SetupForm onCreate={handleCreate} />;

  return (
    <div style={{ minHeight: '100vh', padding: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.03em', color: 'var(--text)' }}>
            YoqlamaQR
          </div>
          <Tag color="var(--green)" dim="var(--green-dim)">
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'ping 1.4s infinite' }} />
            JONLI
          </Tag>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Tag>{session?.subject}</Tag>
          <Tag color="var(--text2)" dim="var(--surface2)">{students.length} talaba</Tag>
          <ThemeToggle />
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', background: 'var(--surface2)', borderRadius: 12,
        padding: 4, marginBottom: '1.5rem', gap: 4, border: '1px solid var(--border)',
      }}>
        {TABS.map((tab, i) => (
          <button key={i} onClick={() => setActiveTab(i)} style={{
            flex: 1, padding: '11px 8px', borderRadius: 9, border: 'none', cursor: 'pointer',
            background: activeTab === i ? 'var(--surface3)' : 'transparent',
            color: activeTab === i ? 'var(--text)' : 'var(--text2)',
            fontFamily: 'var(--font)', fontWeight: activeTab === i ? 700 : 500,
            fontSize: 'clamp(0.8rem, 2.5vw, 0.92rem)',
            border: activeTab === i ? '1px solid var(--border2)' : '1px solid transparent',
            transition: 'all 0.2s', whiteSpace: 'nowrap',
            boxShadow: activeTab === i ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
          }}>
            {tab}
            {i === 1 && students.length > 0 && (
              <span style={{
                marginLeft: 6, background: 'var(--green)', color: '#fff',
                borderRadius: '100px', padding: '1px 7px',
                fontSize: '10px', fontFamily: 'var(--mono)',
              }}>{students.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="anim-fadeup" key={activeTab}>
        {activeTab === 0 && <QROTPTab qrData={qrData} otp={otp} remaining={remaining} />}
        {activeTab === 1 && <LobbiTab students={students} />}
      </div>
    </div>
  );
}