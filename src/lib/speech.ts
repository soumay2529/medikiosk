import { SupportedLanguage } from "@/types/kiosk";

/**
 * Shared AudioContext singleton for zero-latency tone generation and microphone monitoring.
 */
let sharedAudioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!sharedAudioContext || sharedAudioContext.state === "closed") {
      sharedAudioContext = new AudioContextClass();
    }
    if (sharedAudioContext.state === "suspended") {
      sharedAudioContext.resume().catch(() => {});
    }
    return sharedAudioContext;
  } catch (err) {
    console.warn("Unable to initialize AudioContext:", err);
    return null;
  }
}

/**
 * Play accessible audio earcons / cues using the Web Audio API.
 * Guaranteed to wake suspended contexts on modern browser policies.
 */
export function playAudioTone(type: "start" | "stop" | "alert" | "success" | "chime"): void {
  if (typeof window === "undefined") return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Wake context on user gesture if suspended
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === "start") {
      // Ascending pleasant beep (Microphone listening start)
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === "stop") {
      // Descending confirmation beep (Microphone listening stop)
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === "alert") {
      // Urgent clinical Red-Flag siren
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(850, now);
      osc.frequency.setValueAtTime(620, now + 0.14);
      osc.frequency.setValueAtTime(850, now + 0.28);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === "success") {
      // Pleasant C-major triad
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === "chime") {
      // Gentle notification chime
      osc.type = "triangle";
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch (e) {
    console.debug("Audio tone playback exception:", e);
  }
}

/**
 * Cache voices across browser lifecycle.
 */
let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

/**
 * Retain reference to active utterance to prevent V8 Garbage Collection bug in Chromium.
 */
let activeUtterance: SpeechSynthesisUtterance | null = null;
let speechTimeoutId: any = null;

/**
 * Speech synthesis (Text-to-Speech) using the native browser Web Speech API.
 * With Chromium garbage-collection protection, context unfreeze, and fallback chime.
 */
export function speakText(
  text: string,
  lang: SupportedLanguage = "en",
  slowMode: boolean = false,
  onEnd?: () => void
): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    console.warn("Web Speech API not supported on this browser.");
    playAudioTone("chime");
    onEnd?.();
    return;
  }

  try {
    // Clear any previous speech & timer
    if (speechTimeoutId) {
      clearTimeout(speechTimeoutId);
      speechTimeoutId = null;
    }
    window.speechSynthesis.cancel();

    // Chromium speech unfreeze: resume paused audio pipeline
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    activeUtterance = utterance;
    (window as any)._currentSpeechUtterance = utterance; // Prevent GC

    // Language mapping
    const langMap: Record<SupportedLanguage, string> = {
      en: "en-IN",
      hi: "hi-IN",
      ta: "ta-IN",
    };
    const targetLang = langMap[lang] || "en-IN";
    utterance.lang = targetLang;
    utterance.rate = slowMode ? 0.8 : 1.0;
    utterance.pitch = 1.0;

    // Refresh voices if list was empty
    const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      cachedVoices = voices;
      // Best matching voice (e.g. en-IN or hi-IN or ta-IN)
      const matched = voices.find(
        (v) =>
          v.lang.toLowerCase() === targetLang.toLowerCase() ||
          v.lang.toLowerCase().replace("_", "-") === targetLang.toLowerCase() ||
          v.lang.toLowerCase().startsWith(lang)
      );
      if (matched) {
        utterance.voice = matched;
      }
    }

    const cleanup = () => {
      activeUtterance = null;
      if (speechTimeoutId) {
        clearTimeout(speechTimeoutId);
        speechTimeoutId = null;
      }
      onEnd?.();
    };

    utterance.onend = () => {
      cleanup();
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis encountered an error:", e);
      // Play graceful audio chime so user still gets an audio signal
      playAudioTone("chime");
      cleanup();
    };

    // Safety timeout: Chromium sometimes drops onend event on background tabs or long text
    const estimatedDurationMs = Math.max(3000, text.length * 90);
    speechTimeoutId = setTimeout(() => {
      if (activeUtterance === utterance) {
        cleanup();
      }
    }, estimatedDurationMs);

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error("Speech synthesis invocation failed:", err);
    playAudioTone("chime");
    onEnd?.();
  }
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    if (speechTimeoutId) {
      clearTimeout(speechTimeoutId);
      speechTimeoutId = null;
    }
    activeUtterance = null;
    window.speechSynthesis.cancel();
  }
}
