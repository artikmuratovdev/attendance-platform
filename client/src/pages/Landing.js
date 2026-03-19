import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

export default function Landing() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      a: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(79,142,255,${p.a})`;
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(79,142,255,${0.06 * (1 - d / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "3.5rem",
          width: "100%",
          maxWidth: "720px",
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
          className="anim-fadeup"
          style={{ textAlign: "center", animationDelay: "0.05s" }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "1.8rem",
              background: "rgba(35,209,139,0.08)",
              border: "1px solid rgba(35,209,139,0.2)",
              borderRadius: "100px",
              padding: "5px 14px 5px 10px",
              fontSize: "11px",
              fontFamily: "var(--mono)",
              letterSpacing: "0.1em",
              color: "var(--green)",
            }}
          >
            <span
              style={{
                position: "relative",
                display: "inline-block",
                width: 8,
                height: 8,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: "var(--green)",
                  animation: "ping 1.4s ease-out infinite",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: "var(--green)",
                }}
              />
            </span>
            REAL-TIME ATTENDANCE SYSTEM
          </div>

          <h1
            style={{
              fontWeight: 900,
              fontSize: "clamp(3rem, 7vw, 5.5rem)",
              lineHeight: 1,
              letterSpacing: "-0.04em",
              color: "#fff",
              marginBottom: "1.25rem",
            }}
          >
            Yoqlama
            <span
              style={{
                display: "block",
                background:
                  "linear-gradient(100deg, var(--accent) 0%, #a78bfa 50%, var(--green) 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "shimmer 4s linear infinite",
              }}
            >
              QR · OTP
            </span>
          </h1>
          <p
            style={{
              color: "var(--text2)",
              fontSize: "1.05rem",
              lineHeight: 1.7,
              maxWidth: "440px",
              margin: "0 auto",
            }}
          >
            Har 30 soniyada yangilanadigan OTP va QR kod orqali talaballar
            yoqlamasini real vaqtda oling
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
            gap: "1.25rem",
            width: "100%",
          }}
        >
          <RoleCard
            delay="0.15s"
            emoji="🖥️"
            label="HOST"
            title="O'qituvchi"
            desc="Dars oching. OTP + QR avtomatik yaratiladi, har 30 soniyada yangilanadi. Talabalar real vaqtda ko'rinadi."
            accentColor="var(--accent)"
            accentDim="var(--accent-dim)"
            btnLabel="Dars boshlash"
            btnGrad="linear-gradient(135deg, #3b74e8 0%, #6d4afe 100%)"
            onClick={() => navigate("/host")}
          />
          <RoleCard
            delay="0.22s"
            emoji="🎓"
            label="CLIENT"
            title="Talaba"
            desc="Session ID kiriting, OTP yozing yoki QR kodni scan qiling. Bir daqiqada yoqlama tasdiqlanadi."
            accentColor="var(--green)"
            accentDim="var(--green-dim)"
            btnLabel="Yoqlamaga kirish"
            btnGrad="linear-gradient(135deg, #1cb97c 0%, #0d9488 100%)"
            onClick={() => navigate("/client")}
          />
        </div>

        <div
          className="anim-fadeup"
          style={{
            animationDelay: "0.35s",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {["React", "Express.js", "Socket.io", "TOTP", "QR Code"].map((t) => (
            <span
              key={t}
              style={{
                fontSize: "11px",
                fontFamily: "var(--mono)",
                color: "var(--text3)",
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                padding: "4px 10px",
                letterSpacing: "0.04em",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function RoleCard({
  delay,
  emoji,
  label,
  title,
  desc,
  accentColor,
  accentDim,
  btnLabel,
  btnGrad,
  onClick,
}) {
  const ref = useRef(null);

  const onEnter = () => {
    ref.current.style.transform = "translateY(-5px)";
    ref.current.style.background = "rgba(255,255,255,0.055)";
    ref.current.style.borderColor =
      accentColor === "var(--accent)"
        ? "rgba(79,142,255,0.3)"
        : "rgba(35,209,139,0.3)";
    ref.current.style.boxShadow = `0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)`;
  };
  const onLeave = () => {
    ref.current.style.transform = "translateY(0)";
    ref.current.style.background = "var(--surface)";
    ref.current.style.borderColor = "var(--border)";
    ref.current.style.boxShadow = "none";
  };

  return (
    <div
      ref={ref}
      className="anim-fadeup"
      style={{
        animationDelay: delay,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-xl)",
        padding: "2rem",
        cursor: "pointer",
        transition: "all 0.28s cubic-bezier(.22,1,.36,1)",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          opacity: 0.5,
        }}
      />

      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: accentDim,
          border: `1px solid ${accentColor === "var(--accent)" ? "rgba(79,142,255,0.15)" : "rgba(35,209,139,0.15)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.6rem",
          marginBottom: "1.25rem",
        }}
      >
        {emoji}
      </div>

      <div
        style={{
          fontSize: "10px",
          fontFamily: "var(--mono)",
          color: accentColor,
          letterSpacing: "0.15em",
          marginBottom: "6px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontWeight: 700,
          fontSize: "1.25rem",
          color: "#fff",
          marginBottom: "0.6rem",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </div>
      <div
        style={{
          color: "var(--text2)",
          fontSize: "0.88rem",
          lineHeight: 1.65,
          marginBottom: "1.75rem",
        }}
      >
        {desc}
      </div>

      <button
        style={{
          background: btnGrad,
          border: "none",
          borderRadius: "10px",
          color: "#fff",
          padding: "11px 20px",
          fontFamily: "var(--font)",
          fontWeight: 600,
          fontSize: "0.9rem",
          cursor: "pointer",
          letterSpacing: "-0.01em",
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          transition: "transform 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.04)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        {btnLabel} →
      </button>
    </div>
  );
}
