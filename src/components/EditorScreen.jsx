import { palette } from '../theme';
import { IconPlay } from './Icons';

export default function EditorScreen({ script, setScript, onStart }) {
  const wordCount = script.split(/\s+/).filter(Boolean).length;
  const estMins = Math.ceil(wordCount / 150);

  return (
    <div className="fade-in" style={{ maxWidth: 600, margin: "0 auto" }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 16,
      }}>
        <h2 style={{ fontWeight: 700, fontSize: 20 }}>Edit Script</h2>
        <span style={{
          fontSize: 13, color: "var(--text-secondary)",
          fontFamily: "var(--font-mono)",
        }}>
          {wordCount} words · ~{estMins} min
        </span>
      </div>

      <textarea
        value={script}
        onChange={e => setScript(e.target.value)}
        style={{
          width: "100%", minHeight: "50dvh",
          padding: 20, borderRadius: 20,
          border: "1.5px solid var(--border)",
          background: "var(--card)", color: "var(--text-primary)",
          fontFamily: "var(--font-display)", fontSize: 16, lineHeight: 1.9,
          resize: "vertical", boxShadow: "var(--card-shadow)",
        }}
      />

      <button onClick={onStart} disabled={!script.trim()} style={{
        width: "100%", marginTop: 20, padding: "18px 24px",
        borderRadius: 50, border: "none",
        background: `linear-gradient(135deg, ${palette.mint}, ${palette.lavender})`,
        color: "#FFF", fontFamily: "var(--font-display)",
        fontWeight: 700, fontSize: 17, cursor: "pointer",
        boxShadow: `0 4px 24px ${palette.lavender}40`,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        opacity: script.trim() ? 1 : 0.5,
      }}>
        <IconPlay /> Start Teleprompter
      </button>
    </div>
  );
}
