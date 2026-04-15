import { palette } from '../theme';
import { IconMoon, IconSun } from './Icons';

export function ThemeToggle({ dark, toggle }) {
  return (
    <button
      onClick={toggle}
      style={{
        background: "var(--card)",
        border: "1.5px solid var(--border)",
        borderRadius: 12,
        width: 40, height: 40,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
        color: "var(--text-secondary)",
        transition: "all 0.2s",
        boxShadow: "var(--card-shadow)",
      }}
      title={dark ? "Light mode" : "Dark mode"}
    >
      {dark ? <IconSun /> : <IconMoon />}
    </button>
  );
}

export function Pill({ children, active, onClick, icon, color = "var(--accent)" }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "10px 20px",
        borderRadius: 50,
        border: active ? `2px solid ${color}` : "2px solid var(--border)",
        background: active ? `${color}15` : "var(--card)",
        color: active ? color : "var(--text-secondary)",
        fontFamily: "var(--font-display)",
        fontWeight: 600,
        fontSize: 14,
        cursor: "pointer",
        transition: "all 0.25s ease",
        boxShadow: active ? `0 2px 12px ${color}20` : "none",
      }}
    >
      {icon}{children}
    </button>
  );
}

export function FloatingBlob({ color, size, top, left, delay = 0 }) {
  return (
    <div style={{
      position: "absolute",
      width: size, height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
      top, left,
      animation: `float 6s ease-in-out ${delay}s infinite`,
      pointerEvents: "none",
      zIndex: 0,
    }} />
  );
}

export function OptionGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontWeight: 600, fontSize: 12, color: "var(--text-secondary)",
        textTransform: "uppercase", letterSpacing: 1, marginBottom: 8,
      }}>{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{children}</div>
    </div>
  );
}

export function SettingRow({ label, value, children }) {
  return (
    <div style={{
      background: "var(--card)", borderRadius: 16,
      padding: "16px 20px", marginBottom: 12,
      border: "1px solid var(--border)",
      boxShadow: "var(--card-shadow)",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: children ? 12 : 0,
      }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{label}</span>
        {value !== undefined && <span style={{
          fontSize: 13, color: "var(--text-secondary)",
          fontFamily: "var(--font-mono)",
        }}>{value}</span>}
      </div>
      {children}
    </div>
  );
}

export function RangeSlider({ min, max, value, onChange, color = palette.accent }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range" min={min} max={max} value={value}
      onChange={e => onChange(Number(e.target.value))}
      style={{
        width: "100%", height: 6,
        WebkitAppearance: "none", appearance: "none",
        borderRadius: 3,
        background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, var(--border) ${pct}%, var(--border) 100%)`,
        cursor: "pointer",
        accentColor: color,
      }}
    />
  );
}

export function ToggleSwitch({ on, onToggle, color = palette.accent }) {
  return (
    <button onClick={onToggle} style={{
      width: 48, height: 28, borderRadius: 14,
      background: on ? color : "var(--border)",
      border: "none", cursor: "pointer",
      position: "relative", transition: "background 0.2s",
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: "50%",
        background: "#FFF",
        position: "absolute", top: 3,
        left: on ? 23 : 3,
        transition: "left 0.2s",
        boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
      }} />
    </button>
  );
}

export function ColorPick({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {["#FFFFFF", "#000000", "#FFD700", "#00FF88", "#FF6B8A", "#8B5CF6"].map(c => (
        <button key={c} onClick={() => onChange(c)} style={{
          width: 28, height: 28, borderRadius: "50%",
          background: c,
          border: value === c ? `3px solid ${palette.accent}` : "2px solid var(--border)",
          cursor: "pointer",
          transform: value === c ? "scale(1.15)" : "scale(1)",
          transition: "all 0.2s",
        }} />
      ))}
      <input type="color" value={value} onChange={e => onChange(e.target.value)} style={{
        width: 28, height: 28, borderRadius: "50%",
        border: "2px solid var(--border)", cursor: "pointer",
        padding: 0, overflow: "hidden",
      }} />
    </div>
  );
}

export function ControlBtn({ onClick, title, children, style = {} }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 44, height: 44,
      borderRadius: "50%",
      border: "none",
      background: "rgba(255,255,255,0.12)",
      backdropFilter: "blur(8px)",
      color: "#FFF",
      cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 14,
      transition: "all 0.2s",
      ...style,
    }}>
      {children}
    </button>
  );
}
