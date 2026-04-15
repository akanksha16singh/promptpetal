import { useState, useRef, useEffect, useCallback } from 'react';
import { palette } from '../theme';
import { IconBack, IconReset, IconPlay, IconPause, IconFlip } from './Icons';
import { ControlBtn } from './UI';

export default function PrompterScreen({
  script, fontSize, scrollSpeed, mirrorMode, voiceTracking,
  textColor, bgColor, onBack, setFontSize, setScrollSpeed,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isListening, setIsListening] = useState(false);

  const containerRef = useRef(null);
  const wordsRef = useRef([]);
  const recognitionRef = useRef(null);
  const scrollIntervalRef = useRef(null);
  const autoHideRef = useRef(null);
  const manualScrollRef = useRef(false);

  const words = script.split(/\s+/).filter(Boolean);

  // ─── Auto-hide controls ───
  const resetAutoHide = useCallback(() => {
    setShowControls(true);
    clearTimeout(autoHideRef.current);
    if (isPlaying) {
      autoHideRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  // ─── Speech Recognition ───
  const startListening = useCallback(() => {
    if (!voiceTracking) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    const lowerWords = words.map(w =>
      w.toLowerCase().replace(/[^a-zA-Z0-9\u0900-\u097F]/g, "")
    );
    let searchFrom = 0;

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.trim().toLowerCase();
        const spokenWords = transcript.split(/\s+/);

        for (const spoken of spokenWords) {
          const clean = spoken.replace(/[^a-zA-Z0-9\u0900-\u097F]/g, "");
          if (!clean) continue;

          for (let j = searchFrom; j < Math.min(searchFrom + 30, lowerWords.length); j++) {
            if (lowerWords[j] === clean || lowerWords[j].includes(clean)) {
              searchFrom = j + 1;
              setCurrentWordIndex(j);

              const el = wordsRef.current[j];
              if (el && containerRef.current) {
                const rect = el.getBoundingClientRect();
                const containerRect = containerRef.current.getBoundingClientRect();
                const targetY = rect.top - containerRect.top - containerRect.height * 0.35;
                containerRef.current.scrollBy({ top: targetY, behavior: "smooth" });
              }
              break;
            }
          }
        }
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => {
      if (isPlaying && voiceTracking) {
        try { recognition.start(); } catch (e) { /* ignore */ }
      } else {
        setIsListening(false);
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch (e) { /* ignore */ }
  }, [words, voiceTracking, isPlaying]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // ─── Auto-scroll ───
  const startAutoScroll = useCallback(() => {
    if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    scrollIntervalRef.current = setInterval(() => {
      if (containerRef.current && !manualScrollRef.current) {
        containerRef.current.scrollBy({ top: scrollSpeed * 0.8, behavior: "auto" });
      }
    }, 50);
  }, [scrollSpeed]);

  const stopAutoScroll = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  }, []);

  // ─── Play / Pause ───
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopAutoScroll();
      stopListening();
      setIsPlaying(false);
    } else {
      if (!voiceTracking) startAutoScroll();
      if (voiceTracking) {
        startListening();
        startAutoScroll(); // slow backup scroll
      }
      setIsPlaying(true);
    }
  }, [isPlaying, voiceTracking, startAutoScroll, stopAutoScroll, startListening, stopListening]);

  // ─── Reset ───
  const reset = useCallback(() => {
    stopAutoScroll();
    stopListening();
    setIsPlaying(false);
    setCurrentWordIndex(0);
    if (containerRef.current) containerRef.current.scrollTop = 0;
  }, [stopAutoScroll, stopListening]);

  // ─── Cleanup ───
  useEffect(() => {
    return () => { stopAutoScroll(); stopListening(); };
  }, [stopAutoScroll, stopListening]);

  // ─── Show controls on interaction ───
  useEffect(() => {
    const handler = () => resetAutoHide();
    document.addEventListener("touchstart", handler);
    document.addEventListener("mousemove", handler);
    return () => {
      document.removeEventListener("touchstart", handler);
      document.removeEventListener("mousemove", handler);
    };
  }, [resetAutoHide]);

  const progress = words.length > 0 ? ((currentWordIndex + 1) / words.length) * 100 : 0;

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: bgColor,
        zIndex: 1000, display: "flex", flexDirection: "column",
      }}
      onClick={resetAutoHide}
    >
      {/* Progress bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: "rgba(255,255,255,0.1)", zIndex: 20,
      }}>
        <div style={{
          height: "100%", width: `${progress}%`,
          background: `linear-gradient(90deg, ${palette.accent}, ${palette.lavender})`,
          transition: "width 0.3s",
        }} />
      </div>

      {/* Reading guide line */}
      <div style={{
        position: "absolute", top: "35%", left: 0, right: 0,
        height: 2, background: `${palette.accent}40`,
        zIndex: 10, pointerEvents: "none",
      }} />

      {/* Script area */}
      <div
        ref={containerRef}
        style={{
          flex: 1, overflow: "auto",
          padding: "30dvh 24px 50dvh",
          transform: mirrorMode ? "scaleX(-1)" : "none",
          WebkitOverflowScrolling: "touch",
        }}
        onTouchStart={() => { manualScrollRef.current = true; }}
        onTouchEnd={() => { setTimeout(() => { manualScrollRef.current = false; }, 1000); }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto", lineHeight: 1.9, textAlign: "center" }}>
          {words.map((word, i) => (
            <span
              key={i}
              ref={el => wordsRef.current[i] = el}
              style={{
                display: "inline", fontSize,
                fontFamily: "var(--font-display)",
                fontWeight: i === currentWordIndex ? 700 : 500,
                color: i < currentWordIndex
                  ? `${textColor}55`
                  : i === currentWordIndex
                    ? palette.accent
                    : textColor,
                transition: "color 0.2s, font-weight 0.2s",
                textShadow: i === currentWordIndex ? `0 0 20px ${palette.accent}60` : "none",
              }}
            >
              {word}{" "}
            </span>
          ))}
        </div>
      </div>

      {/* Controls overlay */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "16px 20px",
        paddingBottom: "max(16px, env(safe-area-inset-bottom))",
        background: `linear-gradient(transparent, ${bgColor}ee, ${bgColor})`,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
        opacity: showControls ? 1 : 0,
        transition: "opacity 0.3s",
        pointerEvents: showControls ? "auto" : "none",
        zIndex: 20,
      }}>
        <ControlBtn onClick={onBack} title="Back"><IconBack /></ControlBtn>
        <ControlBtn onClick={reset} title="Reset"><IconReset /></ControlBtn>
        <ControlBtn onClick={() => setFontSize(f => Math.max(16, f - 4))} title="Smaller text">
          <span style={{ fontSize: 13, fontWeight: 700 }}>A-</span>
        </ControlBtn>

        <button onClick={togglePlay} style={{
          width: 64, height: 64, borderRadius: "50%", border: "none",
          background: `linear-gradient(135deg, ${palette.accent}, ${palette.lavender})`,
          color: "#FFF", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 4px 24px ${palette.accentGlow}`,
          animation: isPlaying ? "pulseGlow 2s ease-in-out infinite" : "none",
        }}>
          {isPlaying ? <IconPause /> : <IconPlay />}
        </button>

        <ControlBtn onClick={() => setFontSize(f => Math.min(80, f + 4))} title="Larger text">
          <span style={{ fontSize: 16, fontWeight: 700 }}>A+</span>
        </ControlBtn>
        <ControlBtn onClick={() => setScrollSpeed(s => s >= 10 ? 1 : s + 1)} title={`Speed: ${scrollSpeed}`}>
          <span style={{ fontSize: 11, fontWeight: 700 }}>{scrollSpeed}×</span>
        </ControlBtn>
        <ControlBtn onClick={() => {}} title="Mirror">
          <IconFlip />
        </ControlBtn>

        {isListening && (
          <div style={{
            position: "absolute", top: -36, left: "50%", transform: "translateX(-50%)",
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 14px", borderRadius: 20,
            background: `${palette.accent}20`, backdropFilter: "blur(8px)",
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: palette.accent,
              animation: "pulseGlow 1.5s ease-in-out infinite",
            }} />
            <span style={{ fontSize: 12, color: palette.accent, fontWeight: 600 }}>
              Listening...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
