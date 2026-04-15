import { useState, useRef, useEffect, useCallback } from 'react';
import { palette } from '../theme';
import { IconBack, IconReset, IconPlay, IconPause, IconFlip } from './Icons';
import { ControlBtn } from './UI';

// ─── Fuzzy matching helpers ───

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9\u0900-\u097F]/g, "");
}

function editDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function isFuzzyMatch(spoken, scriptWord) {
  if (!spoken || !scriptWord) return false;
  if (spoken === scriptWord) return true;
  if (spoken.length >= 3 && scriptWord.startsWith(spoken)) return true;
  if (scriptWord.length >= 3 && spoken.startsWith(scriptWord)) return true;
  const maxDist = Math.max(spoken.length, scriptWord.length) <= 4 ? 1 : 2;
  return editDistance(spoken, scriptWord) <= maxDist;
}

export default function PrompterScreen({
  script, fontSize, scrollSpeed, mirrorMode, voiceTracking,
  textColor, bgColor, onBack, setFontSize, setScrollSpeed,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [debugText, setDebugText] = useState("");

  const containerRef = useRef(null);
  const wordsRef = useRef([]);
  const recognitionRef = useRef(null);
  const scrollIntervalRef = useRef(null);
  const autoHideRef = useRef(null);
  const manualScrollRef = useRef(false);

  // Use refs for mutable state that closures need access to
  const isPlayingRef = useRef(false);
  const searchFromRef = useRef(0);
  const currentWordRef = useRef(0);

  const words = script.split(/\s+/).filter(Boolean);
  const normalizedWordsRef = useRef([]);

  // Pre-normalize all script words once
  useEffect(() => {
    normalizedWordsRef.current = words.map(w => normalize(w));
  }, [script]);

  // Keep refs in sync with state
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => {
    currentWordRef.current = currentWordIndex;
    searchFromRef.current = currentWordIndex;
  }, [currentWordIndex]);

  // ─── Scroll to a word ───
  const scrollToWord = useCallback((index) => {
    const el = wordsRef.current[index];
    if (el && containerRef.current) {
      const rect = el.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      const targetY = rect.top - containerRect.top - containerRect.height * 0.35;
      if (Math.abs(targetY) > 5) {
        containerRef.current.scrollBy({ top: targetY, behavior: "smooth" });
      }
    }
  }, []);

  // ─── Advance to a specific word index ───
  const advanceToWord = useCallback((index) => {
    setCurrentWordIndex(index);
    currentWordRef.current = index;
    searchFromRef.current = index;
    scrollToWord(index);
  }, [scrollToWord]);

  // ─── Auto-hide controls ───
  const resetAutoHide = useCallback(() => {
    setShowControls(true);
    clearTimeout(autoHideRef.current);
    if (isPlayingRef.current) {
      autoHideRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, []);

  // ─── Speech Recognition ───
  const startListening = useCallback(() => {
    if (!voiceTracking) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setDebugText("Speech Recognition not supported");
      return;
    }

    // Stop any existing instance
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      try { recognitionRef.current.stop(); } catch (e) { /* */ }
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 3;

    // Track matched position per utterance segment
    let matchedUpTo = searchFromRef.current;

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const isFinal = result.isFinal;

        for (let alt = 0; alt < result.length; alt++) {
          const transcript = result[alt].transcript.trim().toLowerCase();
          if (!transcript) continue;

          const spokenWords = transcript.split(/\s+/).filter(Boolean);

          // For interim: only look at the last few new words to avoid re-matching
          // For final: process all words in this segment
          const startIdx = isFinal ? 0 : Math.max(0, spokenWords.length - 3);

          for (let s = startIdx; s < spokenWords.length; s++) {
            const spokenNorm = normalize(spokenWords[s]);
            if (!spokenNorm || spokenNorm.length < 2) continue;

            const searchStart = matchedUpTo;
            const searchEnd = Math.min(searchStart + 50, normalizedWordsRef.current.length);

            let bestMatch = -1;
            let bestDist = Infinity;

            for (let j = searchStart; j < searchEnd; j++) {
              const scriptWord = normalizedWordsRef.current[j];
              if (!scriptWord) continue;

              if (isFuzzyMatch(spokenNorm, scriptWord)) {
                const dist = j - searchStart;
                if (dist < bestDist) {
                  bestDist = dist;
                  bestMatch = j;
                }
                if (spokenNorm === scriptWord && dist < 5) break;
              }
            }

            if (bestMatch >= 0) {
              const jumpSize = bestMatch - matchedUpTo;
              if (jumpSize >= 0 && jumpSize <= 15) {
                matchedUpTo = bestMatch + 1;
                advanceToWord(bestMatch);
                setDebugText(`"${spokenWords[s]}" → word ${bestMatch}`);
              }
              break;
            }
          }

          if (matchedUpTo > searchFromRef.current) break;
        }

        if (isFinal) {
          searchFromRef.current = matchedUpTo;
        }
      }
    };

    recognition.onerror = (e) => {
      setDebugText(`Mic error: ${e.error}`);
      if (e.error === "not-allowed") {
        setIsListening(false);
        setDebugText("Microphone blocked — check permissions");
      }
    };

    recognition.onend = () => {
      if (isPlayingRef.current && voiceTracking) {
        setTimeout(() => {
          if (isPlayingRef.current) {
            try {
              recognition.start();
              setDebugText("Listening...");
            } catch (e) {
              setIsListening(false);
            }
          }
        }, 100);
      } else {
        setIsListening(false);
        setDebugText("");
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
      setDebugText("Listening...");
    } catch (e) {
      setDebugText(`Failed to start: ${e.message}`);
    }
  }, [voiceTracking, advanceToWord]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      try { recognitionRef.current.stop(); } catch (e) { /* */ }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setDebugText("");
  }, []);

  // ─── Auto-scroll ───
  const startAutoScroll = useCallback(() => {
    if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    const speed = voiceTracking ? scrollSpeed * 0.3 : scrollSpeed * 0.8;
    scrollIntervalRef.current = setInterval(() => {
      if (containerRef.current && !manualScrollRef.current) {
        containerRef.current.scrollBy({ top: speed, behavior: "auto" });
      }
    }, 50);
  }, [scrollSpeed, voiceTracking]);

  const stopAutoScroll = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  }, []);

  // ─── Play / Pause ───
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      isPlayingRef.current = false;
      stopAutoScroll();
      stopListening();
      setIsPlaying(false);
    } else {
      isPlayingRef.current = true;
      setIsPlaying(true);
      startAutoScroll();
      if (voiceTracking) {
        setTimeout(() => startListening(), 150);
      }
    }
  }, [isPlaying, voiceTracking, startAutoScroll, stopAutoScroll, startListening, stopListening]);

  // ─── Reset ───
  const reset = useCallback(() => {
    isPlayingRef.current = false;
    stopAutoScroll();
    stopListening();
    setIsPlaying(false);
    setCurrentWordIndex(0);
    currentWordRef.current = 0;
    searchFromRef.current = 0;
    if (containerRef.current) containerRef.current.scrollTop = 0;
  }, [stopAutoScroll, stopListening]);

  // ─── Cleanup ───
  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
      stopAutoScroll();
      stopListening();
    };
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
        onTouchEnd={() => { setTimeout(() => { manualScrollRef.current = false; }, 1500); }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto", lineHeight: 1.9, textAlign: "center" }}>
          {words.map((word, i) => {
            const isCurrent = i === currentWordIndex;
            const isSpoken = i < currentWordIndex;
            const isNearCurrent = i >= currentWordIndex && i <= currentWordIndex + 2;

            return (
              <span
                key={i}
                ref={el => wordsRef.current[i] = el}
                style={{
                  display: "inline",
                  fontSize,
                  fontFamily: "var(--font-display)",
                  fontWeight: isCurrent ? 700 : isNearCurrent ? 600 : 500,
                  color: isSpoken
                    ? `${textColor}40`
                    : isCurrent
                      ? palette.accent
                      : isNearCurrent
                        ? textColor
                        : `${textColor}BB`,
                  transition: "color 0.3s, font-weight 0.3s",
                  textShadow: isCurrent ? `0 0 24px ${palette.accent}80` : "none",
                }}
              >
                {word}{" "}
              </span>
            );
          })}
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

        {/* Status indicator */}
        {(isListening || debugText) && (
          <div style={{
            position: "absolute", top: -40, left: "50%", transform: "translateX(-50%)",
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 16px", borderRadius: 20,
            background: `${palette.accent}20`, backdropFilter: "blur(8px)",
            whiteSpace: "nowrap", maxWidth: "90vw",
          }}>
            {isListening && (
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: palette.accent, flexShrink: 0,
                animation: "pulseGlow 1.5s ease-in-out infinite",
              }} />
            )}
            <span style={{
              fontSize: 11, color: isListening ? palette.accent : "#ff9999",
              fontWeight: 600, fontFamily: "var(--font-mono)",
              overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {debugText || "Listening..."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
