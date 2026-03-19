import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ style = {} }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      title={isDark ? 'Light modega o\'tish' : 'Dark modega o\'tish'}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'var(--surface2)', border: '1px solid var(--border2)',
        borderRadius: '100px', padding: '6px 12px 6px 8px',
        cursor: 'pointer', transition: 'all 0.2s',
        ...style,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--surface3)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--surface2)'; }}
    >
      {/* Track */}
      <div style={{
        width: 36, height: 20, borderRadius: 10, position: 'relative',
        background: isDark ? 'rgba(79,142,255,0.25)' : 'rgba(37,99,235,0.2)',
        border: `1px solid ${isDark ? 'rgba(79,142,255,0.4)' : 'rgba(37,99,235,0.4)'}`,
        transition: 'all 0.3s',
        flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 2,
          left: isDark ? 2 : 18,
          width: 14, height: 14, borderRadius: '50%',
          background: isDark ? 'var(--accent)' : '#f59e0b',
          transition: 'left 0.3s cubic-bezier(.22,1,.36,1)',
          boxShadow: isDark ? '0 0 6px rgba(79,142,255,0.6)' : '0 0 6px rgba(245,158,11,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '8px',
        }}>
          {isDark ? '🌙' : '☀️'}
        </div>
      </div>
      <span style={{
        fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--text2)',
        letterSpacing: '0.06em', whiteSpace: 'nowrap',
      }}>
        {isDark ? 'DARK' : 'LIGHT'}
      </span>
    </button>
  );
}