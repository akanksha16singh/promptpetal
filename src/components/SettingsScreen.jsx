import { palette } from '../theme';
import { SettingRow, RangeSlider, ToggleSwitch, ColorPick } from './UI';

export default function SettingsScreen({
  fontSize, setFontSize, scrollSpeed, setScrollSpeed,
  mirrorMode, setMirrorMode, voiceTracking, setVoiceTracking,
  textColor, setTextColor, bgColor, setBgColor, onDone,
}) {
  return (
    <div className="fade-in" style={{ maxWidth: 500, margin: "0 auto" }}>
      <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 24 }}>Prompter Settings</h2>

      <SettingRow label="Font Size" value={`${fontSize}px`}>
        <RangeSlider min={18} max={72} value={fontSize} onChange={setFontSize} color={palette.accent} />
      </SettingRow>

      <SettingRow label="Scroll Speed" value={scrollSpeed}>
        <RangeSlider min={1} max={10} value={scrollSpeed} onChange={setScrollSpeed} color={palette.lavender} />
      </SettingRow>

      <SettingRow label="Voice Tracking" value={voiceTracking ? "On" : "Off"}>
        <ToggleSwitch on={voiceTracking} onToggle={() => setVoiceTracking(!voiceTracking)} />
      </SettingRow>

      <SettingRow label="Mirror Mode" value={mirrorMode ? "On" : "Off"}>
        <ToggleSwitch on={mirrorMode} onToggle={() => setMirrorMode(!mirrorMode)} color={palette.lavender} />
      </SettingRow>

      <SettingRow label="Text Color">
        <ColorPick value={textColor} onChange={setTextColor} />
      </SettingRow>

      <SettingRow label="Background">
        <ColorPick value={bgColor} onChange={setBgColor} />
      </SettingRow>

      <button onClick={onDone} style={{
        width: "100%", marginTop: 24, padding: "16px",
        borderRadius: 50, border: "none",
        background: `linear-gradient(135deg, ${palette.accent}, ${palette.lavender})`,
        color: "#FFF", fontFamily: "var(--font-display)",
        fontWeight: 700, fontSize: 16, cursor: "pointer",
      }}>
        Done
      </button>
    </div>
  );
}
