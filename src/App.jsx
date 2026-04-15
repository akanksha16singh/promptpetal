import { useState, useEffect } from 'react';
import './index.css';
import { palette } from './theme';
import { IconBack, IconSettings } from './components/Icons';
import { ThemeToggle, FloatingBlob } from './components/UI';
import HomeScreen from './components/HomeScreen';
import EditorScreen from './components/EditorScreen';
import SettingsScreen from './components/SettingsScreen';
import PrompterScreen from './components/PrompterScreen';

export default function App() {
  const [screen, setScreen] = useState("home"); // home | editor | prompter | settings
  const [mode, setMode] = useState("write");    // write | ai
  const [script, setScript] = useState("");
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("youtube");
  const [duration, setDuration] = useState("3-5 min");
  const [tone, setTone] = useState("casual");
  const [language, setLanguage] = useState("english");
  const [dark, setDark] = useState(false);

  // Prompter settings
  const [fontSize, setFontSize] = useState(32);
  const [scrollSpeed, setScrollSpeed] = useState(3);
  const [mirrorMode, setMirrorMode] = useState(false);
  const [voiceTracking, setVoiceTracking] = useState(true);
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [bgColor, setBgColor] = useState("#000000");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  // Full-screen prompter mode
  if (screen === "prompter") {
    return (
      <PrompterScreen
        script={script}
        fontSize={fontSize}
        scrollSpeed={scrollSpeed}
        mirrorMode={mirrorMode}
        voiceTracking={voiceTracking}
        textColor={textColor}
        bgColor={bgColor}
        dark={dark}
        onBack={() => setScreen("editor")}
        setFontSize={setFontSize}
        setScrollSpeed={setScrollSpeed}
      />
    );
  }

  return (
    <div style={{
      height: "100dvh", display: "flex", flexDirection: "column",
      background: "var(--bg)", position: "relative", overflow: "hidden",
    }}>
      {/* Decorative blobs */}
      <FloatingBlob color={palette.accent} size={300} top="-80px" left="-100px" />
      <FloatingBlob color={palette.lavender} size={250} top="60%" left="85%" delay={2} />
      <FloatingBlob color={palette.mint} size={200} top="80%" left="-50px" delay={4} />

      {/* Header */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 20px", position: "relative", zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {screen !== "home" && (
            <button
              onClick={() => setScreen(screen === "settings" ? "editor" : "home")}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--text-secondary)", display: "flex", alignItems: "center",
              }}
            >
              <IconBack />
            </button>
          )}
          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22,
            background: `linear-gradient(135deg, ${palette.accent}, ${palette.lavender})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            letterSpacing: -0.5,
          }}>
            PromptPetal ✿
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {screen === "editor" && (
            <button onClick={() => setScreen("settings")} style={{
              background: "var(--card)", border: "1.5px solid var(--border)",
              borderRadius: 12, width: 40, height: 40,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--text-secondary)",
              boxShadow: "var(--card-shadow)",
            }}>
              <IconSettings />
            </button>
          )}
          <ThemeToggle dark={dark} toggle={() => setDark(!dark)} />
        </div>
      </header>

      {/* Content area */}
      <div style={{
        flex: 1, overflow: "auto", padding: "0 20px 100px",
        position: "relative", zIndex: 5,
      }}>
        {screen === "home" && (
          <HomeScreen
            mode={mode} setMode={setMode}
            script={script} setScript={setScript}
            topic={topic} setTopic={setTopic}
            platform={platform} setPlatform={setPlatform}
            duration={duration} setDuration={setDuration}
            tone={tone} setTone={setTone}
            language={language} setLanguage={setLanguage}
            onGoToEditor={() => setScreen("editor")}
          />
        )}
        {screen === "editor" && (
          <EditorScreen
            script={script} setScript={setScript}
            onStart={() => setScreen("prompter")}
          />
        )}
        {screen === "settings" && (
          <SettingsScreen
            fontSize={fontSize} setFontSize={setFontSize}
            scrollSpeed={scrollSpeed} setScrollSpeed={setScrollSpeed}
            mirrorMode={mirrorMode} setMirrorMode={setMirrorMode}
            voiceTracking={voiceTracking} setVoiceTracking={setVoiceTracking}
            textColor={textColor} setTextColor={setTextColor}
            bgColor={bgColor} setBgColor={setBgColor}
            onDone={() => setScreen("editor")}
          />
        )}
      </div>
    </div>
  );
}
