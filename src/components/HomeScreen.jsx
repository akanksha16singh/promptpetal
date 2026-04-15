import { useState, useCallback } from 'react';
import { palette } from '../theme';
import { IconEdit, IconSparkle } from './Icons';
import { Pill, OptionGroup } from './UI';
import { generateScript } from '../services/ai';

export default function HomeScreen({
  mode, setMode, script, setScript, topic, setTopic,
  platform, setPlatform, duration, setDuration,
  tone, setTone, language, setLanguage,
  onGoToEditor,
}) {
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setGenError("");
    try {
      const result = await generateScript({ topic, platform, duration, tone, language });
      setScript(result);
      onGoToEditor();
    } catch (e) {
      setGenError(e.message || "Failed to generate script");
    } finally {
      setGenerating(false);
    }
  }, [topic, platform, duration, tone, language, setScript, onGoToEditor]);

  const wordCount = script.split(/\s+/).filter(Boolean).length;

  return (
    <div className="fade-in" style={{ maxWidth: 600, margin: "0 auto" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 32, marginTop: 8 }}>
        <div style={{ fontSize: 48, marginBottom: 12, animation: "float 3s ease-in-out infinite" }}>
          🌸
        </div>
        <h2 style={{
          fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: 26, lineHeight: 1.3, marginBottom: 8,
        }}>
          Your words, <br />beautifully on screen
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.6 }}>
          Smart teleprompter that follows your voice. <br />
          Write or AI‑generate your script, then just speak.
        </p>
      </div>

      {/* Mode selector */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 28 }}>
        <Pill active={mode === "write"} onClick={() => setMode("write")} icon={<IconEdit />}>
          Write Script
        </Pill>
        <Pill active={mode === "ai"} onClick={() => setMode("ai")} icon={<IconSparkle />} color={palette.lavender}>
          AI Generate
        </Pill>
      </div>

      {/* Write mode */}
      {mode === "write" && (
        <div className="fade-in">
          <label style={{
            display: "block", fontWeight: 600, fontSize: 13,
            color: "var(--text-secondary)", marginBottom: 8,
            textTransform: "uppercase", letterSpacing: 1,
          }}>Your Script</label>
          <textarea
            value={script}
            onChange={e => setScript(e.target.value)}
            placeholder="Paste or type your script here..."
            rows={10}
            style={{
              width: "100%", padding: 16, borderRadius: 16,
              border: "1.5px solid var(--border)", background: "var(--card)",
              color: "var(--text-primary)", fontFamily: "var(--font-display)",
              fontSize: 15, lineHeight: 1.8, resize: "vertical",
              boxShadow: "var(--card-shadow)", transition: "border-color 0.2s",
            }}
          />
          <div style={{ textAlign: "right", marginTop: 6, fontSize: 12, color: "var(--text-secondary)" }}>
            {wordCount} words · ~{Math.ceil(wordCount / 150)} min read
          </div>
        </div>
      )}

      {/* AI mode */}
      {mode === "ai" && (
        <div className="fade-in">
          <label style={{
            display: "block", fontWeight: 600, fontSize: 13,
            color: "var(--text-secondary)", marginBottom: 8,
            textTransform: "uppercase", letterSpacing: 1,
          }}>Topic or Idea</label>
          <textarea
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="e.g. 'Why everyone is switching to flip phones in 2026' or 'Morning routine for entrepreneurs'..."
            rows={3}
            style={{
              width: "100%", padding: 16, borderRadius: 16,
              border: "1.5px solid var(--border)", background: "var(--card)",
              color: "var(--text-primary)", fontFamily: "var(--font-display)",
              fontSize: 15, lineHeight: 1.7, resize: "none",
              boxShadow: "var(--card-shadow)",
            }}
          />

          <div style={{ marginTop: 20 }}>
            <OptionGroup label="Platform">
              {[["youtube", "YouTube"], ["instagram", "Instagram"], ["shorts", "Shorts / Reels"]].map(([v, l]) => (
                <Pill key={v} active={platform === v} onClick={() => setPlatform(v)}>{l}</Pill>
              ))}
            </OptionGroup>
            <OptionGroup label="Duration">
              {["1-2 min", "3-5 min", "5-10 min", "10+ min"].map(v => (
                <Pill key={v} active={duration === v} onClick={() => setDuration(v)}>{v}</Pill>
              ))}
            </OptionGroup>
            <OptionGroup label="Tone">
              {["casual", "professional", "funny", "motivational"].map(v => (
                <Pill key={v} active={tone === v} onClick={() => setTone(v)}
                  color={v === "funny" ? palette.peach : v === "motivational" ? palette.mint : undefined}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </Pill>
              ))}
            </OptionGroup>
            <OptionGroup label="Language">
              {[["english", "English"], ["hindi", "Hindi"], ["hinglish", "Hinglish"]].map(([v, l]) => (
                <Pill key={v} active={language === v} onClick={() => setLanguage(v)} color={palette.lavender}>{l}</Pill>
              ))}
            </OptionGroup>
          </div>

          {genError && (
            <div style={{
              marginTop: 16, padding: "12px 16px", borderRadius: 12,
              background: "#FFF0F0", color: "#D32F2F",
              fontSize: 13, border: "1px solid #FFCDD2",
            }}>{genError}</div>
          )}

          <button onClick={handleGenerate} disabled={generating || !topic.trim()} style={{
            width: "100%", marginTop: 20, padding: "16px 24px",
            borderRadius: 50, border: "none",
            background: generating
              ? `linear-gradient(90deg, ${palette.lavender}, ${palette.accent}, ${palette.lavender})`
              : `linear-gradient(135deg, ${palette.lavender}, ${palette.accent})`,
            backgroundSize: generating ? "200% auto" : "100%",
            animation: generating ? "shimmer 1.5s linear infinite" : "none",
            color: "#FFF", fontFamily: "var(--font-display)",
            fontWeight: 700, fontSize: 16,
            cursor: generating ? "wait" : "pointer",
            opacity: !topic.trim() ? 0.5 : 1,
            boxShadow: `0 4px 20px ${palette.accentGlow}`,
            transition: "all 0.3s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            {generating ? (
              <>
                <div style={{ width: 18, height: 18, border: "2px solid #fff4", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                Crafting your script...
              </>
            ) : (
              <><IconSparkle /> Generate Script</>
            )}
          </button>
        </div>
      )}

      {/* Continue button for write mode */}
      {mode === "write" && script.trim() && (
        <button onClick={onGoToEditor} style={{
          width: "100%", marginTop: 20, padding: "16px 24px",
          borderRadius: 50, border: "none",
          background: `linear-gradient(135deg, ${palette.accent}, ${palette.peach})`,
          color: "#FFF", fontFamily: "var(--font-display)",
          fontWeight: 700, fontSize: 16, cursor: "pointer",
          boxShadow: `0 4px 20px ${palette.accentGlow}`,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          Continue to Editor →
        </button>
      )}
    </div>
  );
}
