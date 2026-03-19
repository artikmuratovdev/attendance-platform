import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import ThemeToggle from "../components/ThemeToggle";
import { API, SOCKET } from '../config';

function Tag({ children, color = "var(--accent)", dim = "var(--accent-dim)" }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: "10px",
        fontFamily: "var(--mono)",
        letterSpacing: "0.12em",
        color,
        background: dim,
        border: `1px solid ${color === "var(--accent)" ? "rgba(79,142,255,0.15)" : "rgba(35,209,139,0.15)"}`,
        borderRadius: "6px",
        padding: "3px 9px",
      }}
    >
      {children}
    </span>
  );
}

function Card({ children, style = {}, glow = false }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: `1px solid ${glow ? "rgba(79,142,255,0.2)" : "var(--border)"}`,
        borderRadius: "var(--r-lg)",
        padding: "1.5rem",
        transition: "border-color 0.3s",
        boxShadow: glow ? "0 0 40px rgba(79,142,255,0.06)" : "none",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Label({ children }) {
  return (
    <div
      style={{
        fontSize: "10px",
        fontFamily: "var(--mono)",
        color: "var(--text3)",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        marginBottom: "0.75rem",
      }}
    >
      {children}
    </div>
  );
}

function SetupForm({ onCreate }) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !subject.trim() || loading) return;
    setLoading(true);
    await onCreate(name, subject);
    setLoading(false);
  };

  const inputStyle = {
    width: "100%",
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-sm)",
    padding: "13px 16px",
    color: "var(--text)",
    fontFamily: "var(--font)",
    fontSize: "0.95rem",
    outline: "none",
    marginBottom: "1rem",
    transition: "border-color 0.2s",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: "1.25rem",
          right: "1.25rem",
          zIndex: 100,
        }}
      >
        <ThemeToggle />
      </div>
      <div
        className="anim-popin"
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-xl)",
          padding: "2.5rem",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "var(--accent-dim)",
              border: "1px solid rgba(79,142,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              margin: "0 auto 1.25rem",
            }}
          >
            🖥️
          </div>
          <div
            style={{
              fontWeight: 800,
              fontSize: "1.5rem",
              letterSpacing: "-0.03em",
              color: "#fff",
              marginBottom: "0.4rem",
            }}
          >
            Yangi dars yaratish
          </div>
          <div style={{ color: "var(--text2)", fontSize: "0.88rem" }}>
            Ma'lumotlarni kiriting va darsni boshlang
          </div>
        </div>

        <Label>O'qituvchi ismi</Label>
        <input
          style={inputStyle}
          placeholder="Masalan: Karimov Jasur"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={(e) => (e.target.style.borderColor = "rgba(79,142,255,0.4)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />

        <Label>Fan nomi</Label>
        <input
          style={inputStyle}
          placeholder="Masalan: Algoritm va ma'lumotlar tuzilmasi"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          onFocus={(e) => (e.target.style.borderColor = "rgba(79,142,255,0.4)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />

        <button
          onClick={handleCreate}
          disabled={loading || !name.trim() || !subject.trim()}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(135deg, #3b74e8, #6d4afe)",
            color: "#fff",
            fontFamily: "var(--font)",
            fontWeight: 700,
            fontSize: "1rem",
            cursor:
              loading || !name.trim() || !subject.trim()
                ? "not-allowed"
                : "pointer",
            opacity: loading || !name.trim() || !subject.trim() ? 0.5 : 1,
            transition: "all 0.2s",
            letterSpacing: "-0.01em",
            boxShadow: "0 4px 20px rgba(79,142,255,0.3)",
          }}
        >
          {loading ? "⏳ Yaratilmoqda..." : "🚀 Darsni boshlash"}
        </button>
      </div>
    </div>
  );
}

function OTPDisplay({ otp, remaining }) {
  const warn = remaining <= 8;
  const pct = (remaining / 30) * 100;
  const digits = otp ? otp.split("") : ["–", "–", "–", "–", "–", "–"];

  return (
    <Card
      glow
      style={{
        textAlign: "center",
        animation: "borderPulse 3s ease-in-out infinite",
      }}
    >
      <Label>OTP PAROL — 30 SONIYADA YANGILANADI</Label>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          margin: "1rem 0",
        }}
      >
        {digits.map((d, i) => (
          <div
            key={`${otp}-${i}`}
            style={{
              width: 46,
              height: 58,
              borderRadius: 10,
              background: "var(--surface2)",
              border: `1px solid ${warn ? "rgba(255,92,92,0.3)" : "var(--border2)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--mono)",
              fontWeight: 500,
              fontSize: "1.6rem",
              color: warn ? "var(--red)" : "var(--accent)",
              animation: "digitFlip 0.3s cubic-bezier(.22,1,.36,1)",
              animationDelay: `${i * 0.04}s`,
              animationFillMode: "both",
              transition: "border-color 0.3s, color 0.3s",
              boxShadow: warn
                ? "0 0 12px rgba(255,92,92,0.1)"
                : "0 0 12px rgba(79,142,255,0.08)",
            }}
          >
            {d}
          </div>
        ))}
      </div>
      <div
        style={{
          height: 3,
          background: "var(--surface3)",
          borderRadius: 2,
          overflow: "hidden",
          margin: "0.75rem 0 0.5rem",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 2,
            background: warn ? "var(--red)" : "var(--accent)",
            width: `${pct}%`,
            transition: "width 1s linear, background 0.4s",
            boxShadow: warn ? "0 0 8px var(--red)" : "0 0 8px var(--accent)",
          }}
        />
      </div>
      <div
        style={{
          fontSize: "12px",
          fontFamily: "var(--mono)",
          color: warn ? "var(--red)" : "var(--text3)",
        }}
      >
        {remaining}s qoldi
      </div>
    </Card>
  );
}

function SessionBadge({ sessionId }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Card>
      <Label>SESSION ID — talabalarga bering</Label>
      <div
        onClick={copy}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--surface2)",
          border: "1px solid var(--border2)",
          borderRadius: "var(--r-sm)",
          padding: "14px 18px",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(79,142,255,0.3)";
          e.currentTarget.style.background = "var(--surface3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border2)";
          e.currentTarget.style.background = "var(--surface2)";
        }}
      >
        <span
          style={{
            fontFamily: "var(--mono)",
            fontWeight: 500,
            fontSize: "1.4rem",
            letterSpacing: "0.18em",
            color: "#fff",
          }}
        >
          {sessionId}
        </span>
        <span
          style={{
            fontSize: "12px",
            fontFamily: "var(--mono)",
            color: copied ? "var(--green)" : "var(--text3)",
          }}
        >
          {copied ? "✓ NUSXALANDI" : "📋 NUSXALASH"}
        </span>
      </div>
    </Card>
  );
}

function QRPanel({ qrData, remaining }) {
  const warn = remaining <= 8;
  return (
    <Card>
      <Label>QR KOD — scan qiling</Label>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "0.5rem 0 1rem",
        }}
      >
        <div
          style={{
            position: "relative",
            padding: 10,
            borderRadius: 14,
            background: "#fff",
            boxShadow: warn
              ? "0 0 0 3px rgba(255,92,92,0.3), 0 8px 32px rgba(0,0,0,0.3)"
              : "0 0 0 3px rgba(79,142,255,0.15), 0 8px 32px rgba(0,0,0,0.3)",
            transition: "box-shadow 0.4s",
          }}
        >
          {qrData && (
            <img
              src={qrData}
              alt="QR Code"
              style={{
                width: 188,
                height: 188,
                display: "block",
                borderRadius: 8,
              }}
            />
          )}
          <div
            style={{
              position: "absolute",
              left: 10,
              right: 10,
              height: 2,
              background:
                "linear-gradient(90deg, transparent, rgba(79,142,255,0.8), transparent)",
              animation: "scanLine 2s linear infinite",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
      <div
        style={{
          textAlign: "center",
          fontSize: "11px",
          fontFamily: "var(--mono)",
          color: "var(--text3)",
        }}
      >
        OTP yangilanganda QR ham yangilanadi
      </div>
    </Card>
  );
}

function StudentRow({ student, index }) {
  const hue =
    (student.username.charCodeAt(0) * 53 +
      (student.username.charCodeAt(1) || 0) * 17) %
    360;
  const time = new Date(student.joinedAt).toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return (
    <div
      className="anim-slidein"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        background: "var(--surface2)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-sm)",
        padding: "11px 14px",
        animationDelay: `${Math.min(index * 0.04, 0.3)}s`,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          flexShrink: 0,
          background: `linear-gradient(135deg, hsl(${hue},60%,40%), hsl(${(hue + 60) % 360},60%,55%))`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: "0.95rem",
          color: "#fff",
          boxShadow: `0 0 12px hsla(${hue},60%,50%,0.25)`,
        }}
      >
        {student.avatar}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: "0.92rem",
            color: "#fff",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {student.username}
        </div>
        <div
          style={{
            fontSize: "11px",
            fontFamily: "var(--mono)",
            color: "var(--text3)",
            marginTop: 2,
          }}
        >
          {time}
        </div>
      </div>
      <div
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "var(--green)",
          boxShadow: "0 0 8px var(--green)",
          flexShrink: 0,
        }}
      />
    </div>
  );
}

export default function HostPage() {
  const [step, setStep] = useState("setup");
  const [session, setSession] = useState(null);
  const [otp, setOtp] = useState("");
  const [qrData, setQrData] = useState("");
  const [remaining, setRemaining] = useState(30);
  const [students, setStudents] = useState([]);
  const socketRef = useRef(null);
  const timerRef = useRef(null);

  const startTick = useCallback((init) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRemaining(init);
    timerRef.current = setInterval(
      () => setRemaining((p) => (p <= 1 ? 30 : p - 1)),
      1000,
    );
  }, []);

  const handleCreate = async (name, subject) => {
    const res = await fetch(`${API}/api/session/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, subject }),
    });
    const data = await res.json();
    setSession(data);
    setOtp(data.otp);
    setQrData(data.qrData);
    startTick(data.remaining);
    setStep("active");

    const socket = io(SOCKET);
    socketRef.current = socket;
    socket.emit("host:join", { sessionId: data.sessionId });
    socket.on("otp:update", ({ otp: o, qrData: q, remaining: r }) => {
      setOtp(o);
      setQrData(q);
      startTick(r);
    });
    socket.on("student:joined", (s) => setStudents((prev) => [s, ...prev]));
  };

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (socketRef.current) socketRef.current.disconnect();
    },
    [],
  );

  if (step === "setup") return <SetupForm onCreate={handleCreate} />;

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "1.5rem",
        maxWidth: "1100px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.75rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              fontWeight: 800,
              fontSize: "1.2rem",
              letterSpacing: "-0.03em",
              color: "#fff",
            }}
          >
            YoqlamaQR
          </div>
          <Tag color="var(--green)" dim="var(--green-dim)">
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "var(--green)",
                display: "inline-block",
                animation: "ping 1.4s infinite",
              }}
            />
            JONLI
          </Tag>
        </div>
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Tag>{session?.subject}</Tag>
          <Tag color="var(--text2)" dim="var(--surface2)">
            {students.length} talaba
          </Tag>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.25rem",
          alignItems: "start",
        }}
      >
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          <SessionBadge sessionId={session?.sessionId} />
          <OTPDisplay otp={otp} remaining={remaining} />
          <QRPanel qrData={qrData} remaining={remaining} />
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <Card style={{ textAlign: "center", padding: "1.25rem" }}>
              <div
                style={{
                  fontSize: "2.2rem",
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {students.length}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  fontFamily: "var(--mono)",
                  color: "var(--text3)",
                  letterSpacing: "0.08em",
                }}
              >
                QAYD ETILGAN
              </div>
            </Card>
            <Card style={{ textAlign: "center", padding: "1.25rem" }}>
              <div
                style={{
                  fontSize: "2.2rem",
                  fontWeight: 800,
                  fontFamily: "var(--mono)",
                  color: remaining <= 8 ? "var(--red)" : "var(--accent)",
                  lineHeight: 1,
                  marginBottom: 4,
                  transition: "color 0.3s",
                }}
              >
                {remaining}s
              </div>
              <div
                style={{
                  fontSize: "11px",
                  fontFamily: "var(--mono)",
                  color: "var(--text3)",
                  letterSpacing: "0.08em",
                }}
              >
                YANGILASHGA
              </div>
            </Card>
          </div>

          <Card style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <Label>TALABALAR LOBBISI</Label>
              {students.length > 0 && (
                <span
                  style={{
                    fontSize: "11px",
                    fontFamily: "var(--mono)",
                    color: "var(--green)",
                    background: "var(--green-dim)",
                    border: "1px solid rgba(35,209,139,0.15)",
                    borderRadius: "6px",
                    padding: "2px 8px",
                  }}
                >
                  {students.length} ta
                </span>
              )}
            </div>
            {students.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem 1rem",
                  color: "var(--text3)",
                }}
              >
                <div
                  style={{
                    fontSize: "2.5rem",
                    marginBottom: "0.75rem",
                    opacity: 0.5,
                  }}
                >
                  👁️
                </div>
                <div style={{ fontSize: "13px", fontFamily: "var(--mono)" }}>
                  Talabalar kutilmoqda...
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--text3)",
                    marginTop: 6,
                  }}
                >
                  Yoqlama qilinganda shu yerda paydo bo'ladi
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  maxHeight: "420px",
                  overflowY: "auto",
                  paddingRight: 2,
                }}
              >
                {students.map((s, i) => (
                  <StudentRow key={s.id} student={s} index={i} />
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
