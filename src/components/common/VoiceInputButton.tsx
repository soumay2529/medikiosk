"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Volume2,
  Edit3,
  ArrowRight,
  Plus,
  Check,
  X
} from "lucide-react";
import { playAudioTone, getAudioContext } from "@/lib/speech";
import { useKioskStore } from "@/store/useKioskStore";
import {
  CLINICAL_SYMPTOM_TAXONOMY,
  ClinicalSymptomDefinition,
  extractAllPossibleSymptoms,
  extractAssociatedSymptoms
} from "@/lib/clinical-extractor";

interface VoiceInputButtonProps {
  questionKey: string;
  onTranscriptComplete: (transcript: string, inferredValue?: any) => void;
  className?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  questionKey,
  onTranscriptComplete,
  className = "",
}) => {
  // Mode: "idle" | "recording" | "review"
  const [recordMode, setRecordMode] = useState<"idle" | "recording" | "review">("idle");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcriptText, setTranscriptText] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);

  // Selected symptoms identified for conclusion
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  // Audio Playback of User's Actual Recorded Voice
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecordedVoice, setIsPlayingRecordedVoice] = useState(false);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const language = useKioskStore((state) => state.encounter.language);

  // References
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);
  const isManuallyStoppedRef = useRef<boolean>(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllMedia();
    };
  }, []);

  const stopAllMedia = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {}
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.abort();
      } catch (err) {}
      speechRecognitionRef.current = null;
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    setAudioLevel(0);
  };

  /**
   * Start User-Controlled Recording (Continuous until user taps Stop)
   */
  const startRecording = async () => {
    stopAllMedia();
    isManuallyStoppedRef.current = false;
    setRecordMode("recording");
    setRecordingSeconds(0);
    setTranscriptText("");
    setSelectedSymptoms([]);
    setRecordedAudioUrl(null);
    audioChunksRef.current = [];

    playAudioTone("start");

    // Start 1-second elapsed counter (max 60 seconds)
    timerIntervalRef.current = setInterval(() => {
      setRecordingSeconds((prev) => {
        if (prev >= 59) {
          stopRecordingAndReview();
          return 60;
        }
        return prev + 1;
      });
    }, 1000);

    // 1. Microphone capture with MediaRecorder
    let stream: MediaStream | null = null;
    try {
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        // Initialize MediaRecorder to save audio
        try {
          const recorder = new MediaRecorder(stream);
          mediaRecorderRef.current = recorder;

          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };

          recorder.onstop = () => {
            if (audioChunksRef.current.length > 0) {
              const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
              const url = URL.createObjectURL(audioBlob);
              setRecordedAudioUrl(url);
            }
          };

          recorder.start(100); // collect in 100ms slices
        } catch (recErr) {
          console.warn("MediaRecorder initialization error:", recErr);
        }

        // Live Audio Equalizer via Web Audio API
        const audioCtx = getAudioContext();
        if (audioCtx) {
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateMeter = () => {
            if (isManuallyStoppedRef.current) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
            animFrameRef.current = requestAnimationFrame(updateMeter);
          };
          updateMeter();
        }
      }
    } catch (err) {
      console.warn("Microphone permission denied or unavailable:", err);
      // Simulated audio waveform fallback for testing without mic
      let t = 0;
      const simTimer = setInterval(() => {
        if (isManuallyStoppedRef.current) {
          clearInterval(simTimer);
          return;
        }
        t += 0.2;
        setAudioLevel(Math.round(40 + Math.sin(t) * 35));
      }, 100);
    }

    // 2. Real Browser Speech Recognition (Continuous Mode)
    const SpeechRecognitionClass =
      typeof window !== "undefined" &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

    if (SpeechRecognitionClass) {
      try {
        const recognition = new SpeechRecognitionClass();
        speechRecognitionRef.current = recognition;

        const langTag = language === "hi" ? "hi-IN" : language === "ta" ? "ta-IN" : "en-IN";
        recognition.lang = langTag;
        recognition.continuous = true;
        recognition.interimResults = true;

        let accumulated = "";

        recognition.onresult = (event: any) => {
          let currentInterim = "";
          for (let i = 0; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              accumulated += (accumulated ? " " : "") + transcript;
            } else {
              currentInterim = transcript;
            }
          }
          const text = (accumulated + " " + currentInterim).trim();
          if (text) {
            setTranscriptText(text);
          }
        };

        recognition.onerror = (e: any) => {
          console.warn("Speech recognition notice:", e.error);
        };

        recognition.onend = () => {
          if (!isManuallyStoppedRef.current && speechRecognitionRef.current) {
            try {
              recognition.start();
            } catch (restartErr) {
              // ignore
            }
          }
        };

        recognition.start();
      } catch (recInitErr) {
        console.warn("SpeechRecognition start exception:", recInitErr);
      }
    }
  };

  /**
   * User taps "Stop & Review"
   */
  const stopRecordingAndReview = () => {
    isManuallyStoppedRef.current = true;
    playAudioTone("stop");

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {}
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (err) {}
      speechRecognitionRef.current = null;
    }

    setAudioLevel(0);

    // Extract clinical symptoms from whatever was spoken
    // DO NOT INJECT FALSE CHEST PAIN FALLBACK!
    const text = transcriptText.trim();
    if (questionKey === "chief_complaint") {
      if (text.length > 0) {
        const extracted = extractAllPossibleSymptoms(text);
        const symptomsFound = extracted.detectedSymptoms.map((d) => d.name);
        setSelectedSymptoms(symptomsFound);
      } else {
        setSelectedSymptoms([]);
      }
    } else if (questionKey === "associated_symptoms") {
      if (text.length > 0) {
        const assoc = extractAssociatedSymptoms(text);
        setSelectedSymptoms(assoc);
      } else {
        setSelectedSymptoms([]);
      }
    }

    setRecordMode("review");
  };

  /**
   * When user edits text manually in review textarea, re-evaluate symptoms
   */
  const handleTextChange = (newText: string) => {
    setTranscriptText(newText);
    if (questionKey === "chief_complaint") {
      const extracted = extractAllPossibleSymptoms(newText);
      const symptomsFound = extracted.detectedSymptoms.map((d) => d.name);
      // Keep any manually added ones and union with freshly detected
      setSelectedSymptoms((prev) => Array.from(new Set([...symptomsFound, ...prev])));
    }
  };

  /**
   * Toggle a symptom in the conclusion checklist
   */
  const handleToggleSymptom = (symptomName: string) => {
    setSelectedSymptoms((prev) => {
      if (prev.includes(symptomName)) {
        return prev.filter((s) => s !== symptomName);
      } else {
        return [...prev, symptomName];
      }
    });
  };

  /**
   * User confirms the transcribed & selected symptoms
   */
  const handleConfirmTranscript = () => {
    playAudioTone("success");

    if (questionKey === "chief_complaint") {
      // If user selected specific symptoms, pass the array of symptoms
      const finalSymptoms = selectedSymptoms.length > 0
        ? selectedSymptoms
        : transcriptText.trim()
        ? [transcriptText.trim()]
        : ["General OPD Medical Consultation"];

      onTranscriptComplete(transcriptText || finalSymptoms.join(", "), finalSymptoms);
    } else if (questionKey === "associated_symptoms") {
      const finalAssoc = selectedSymptoms.length > 0
        ? selectedSymptoms
        : extractAssociatedSymptoms(transcriptText);

      onTranscriptComplete(transcriptText || finalAssoc.join(", "), finalAssoc);
    } else {
      onTranscriptComplete(transcriptText, transcriptText);
    }

    setRecordMode("idle");
  };

  /**
   * One-Tap Quick Presets for Instant Testing
   */
  const handleApplyPreset = (presetText: string) => {
    setTranscriptText(presetText);
    playAudioTone("success");

    if (questionKey === "chief_complaint") {
      const extracted = extractAllPossibleSymptoms(presetText);
      const symptoms = extracted.detectedSymptoms.map((d) => d.name);
      const finalSymptoms = symptoms.length > 0 ? symptoms : [presetText];
      onTranscriptComplete(presetText, finalSymptoms);
    } else if (questionKey === "associated_symptoms") {
      const assoc = extractAssociatedSymptoms(presetText);
      onTranscriptComplete(presetText, assoc);
    } else {
      onTranscriptComplete(presetText, presetText);
    }
    setRecordMode("idle");
  };

  /**
   * Toggle Playback of User's Actual Recorded Voice
   */
  const handleToggleVoicePlayback = () => {
    if (!recordedAudioUrl) return;

    if (isPlayingRecordedVoice && audioElementRef.current) {
      audioElementRef.current.pause();
      setIsPlayingRecordedVoice(false);
    } else {
      if (!audioElementRef.current) {
        const audio = new Audio(recordedAudioUrl);
        audioElementRef.current = audio;
        audio.onended = () => setIsPlayingRecordedVoice(false);
        audio.onerror = () => setIsPlayingRecordedVoice(false);
      }
      audioElementRef.current.play();
      setIsPlayingRecordedVoice(true);
    }
  };

  return (
    <div className={`flex flex-col items-center gap-3 w-full max-w-xl mx-auto ${className}`}>
      {/* 1. IDLE STATE */}
      {recordMode === "idle" && (
        <div className="w-full space-y-3">
          <button
            type="button"
            onClick={startRecording}
            className="w-full flex items-center justify-center gap-3.5 rounded-2xl p-4 sm:p-5 bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-slate-800/30 transition-all cursor-pointer active:scale-98 border-2 border-slate-700 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Mic className="w-6 h-6" />
            </div>
            <div className="text-left">
              <div className="font-black text-lg sm:text-xl text-white">Tap to Speak Your Symptoms</div>
              <div className="text-xs text-slate-400">
                {language === "hi"
                  ? "माइक से बोलें • हिन्दी (Continuous Recording)"
                  : language === "ta"
                  ? "மைக் மூலம் பேசுங்கள் • தமிழ் (Continuous Recording)"
                  : "Tap to record • Continuous listening until you tap Done"}
              </div>
            </div>
          </button>

          {/* Quick One-Tap Test Presets Covering Diverse Conditions */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Or Tap a Quick Clinical Preset to Test:
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {questionKey === "chief_complaint" ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      handleApplyPreset(
                        language === "hi"
                          ? "दो दिन से तेज बुखार, कंपकंपी और बदन दर्द है"
                          : language === "ta"
                          ? "இரண்டு நாட்களாக கடுமையான காய்ச்சல் மற்றும் உடல் வலி"
                          : "High fever with chills and body ache for 2 days"
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200 transition-all cursor-pointer shadow-2xs"
                  >
                    🌡️ High Fever &amp; Chills
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleApplyPreset(
                        language === "hi"
                          ? "पेट में तेज दर्द, मरोड़ और उल्टी हो रही है"
                          : language === "ta"
                          ? "வயிற்று வலி மற்றும் வாந்தி உள்ளது"
                          : "Severe stomach pain with cramps and vomiting"
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 text-xs font-bold border border-emerald-200 transition-all cursor-pointer shadow-2xs"
                  >
                    🤢 Stomach / Abdominal Pain
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleApplyPreset(
                        language === "hi"
                          ? "तीन दिनों से लगातार खांसी, कफ और गले में दर्द है"
                          : language === "ta"
                          ? "தொடர்ச்சியான இருமல் மற்றும் தொண்டை வலி"
                          : "Persistent cough with phlegm and sore throat"
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-blue-900 text-xs font-bold border border-blue-200 transition-all cursor-pointer shadow-2xs"
                  >
                    😷 Cough &amp; Cold
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleApplyPreset(
                        language === "hi"
                          ? "सिर में बहुत तेज दर्द और चक्कर आ रहे हैं"
                          : language === "ta"
                          ? "கடுமையான தலைவலி மற்றும் தலைச்சுற்றல்"
                          : "Severe throbbing headache and dizziness"
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-purple-50 text-purple-900 text-xs font-bold border border-purple-200 transition-all cursor-pointer shadow-2xs"
                  >
                    🧠 Severe Headache
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleApplyPreset(
                        language === "hi"
                          ? "घुटनों में बहुत दर्द, सूजन और सुबह जकड़न है"
                          : language === "ta"
                          ? "முழங்கால்களில் வலி மற்றும் விறைப்பு"
                          : "Knee joint pain with swelling and morning stiffness"
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-300 transition-all cursor-pointer shadow-2xs"
                  >
                    🦴 Joint / Knee Pain
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleApplyPreset(
                        language === "hi"
                          ? "छाती में तेज भारीपन और दर्द बाईं बांह में जा रहा है"
                          : language === "ta"
                          ? "நெஞ்சில் கடுமையான வலி மற்றும் அழுத்தம்"
                          : "Retrosternal chest pain radiating to left arm"
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-red-50 text-red-900 text-xs font-bold border border-red-200 transition-all cursor-pointer shadow-2xs"
                  >
                    🫀 Chest Pain (Cardiac)
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("Cold sweating and acute breathlessness")}
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    🚨 Cold Sweating &amp; Breathlessness (RF-01)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("Pain radiating to left arm and jaw")}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-300 transition-all cursor-pointer shadow-2xs"
                  >
                    ⚡ Left Arm &amp; Jaw Radiation
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("Nausea and vomiting since morning")}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-300 transition-all cursor-pointer shadow-2xs"
                  >
                    🤢 Nausea &amp; Vomiting
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. ACTIVE RECORDING STATE (User controls when to stop) */}
      {recordMode === "recording" && (
        <div className="w-full bg-slate-950 rounded-3xl p-5 sm:p-6 border-3 border-red-500 shadow-2xl space-y-4 animate-in fade-in">
          {/* Header Status & Elapsed Timer */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600" />
              </span>
              <span className="text-white font-black text-sm uppercase tracking-wider">
                RECORDING LIVE AUDIO
              </span>
            </div>
            <span className="font-mono text-base font-black text-amber-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-700">
              00:{recordingSeconds.toString().padStart(2, "0")} / 01:00
            </span>
          </div>

          {/* Live Dynamic Audio Equalizer Bars */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>MIC SENSOR ACTIVE</span>
              <span>LEVEL: {audioLevel}%</span>
            </div>
            <div className="flex items-end justify-center gap-1.5 h-12 bg-slate-900 rounded-2xl p-2 overflow-hidden border border-slate-800">
              {Array.from({ length: 22 }).map((_, i) => {
                const waveFactor = Math.sin((i / 22) * Math.PI);
                const barHeight = Math.max(12, Math.min(100, audioLevel * waveFactor + (i % 4) * 8));
                return (
                  <div
                    key={i}
                    className="w-2 bg-gradient-to-t from-emerald-500 via-cyan-400 to-red-400 rounded-full transition-all duration-75"
                    style={{ height: `${barHeight}%` }}
                  />
                );
              })}
            </div>
          </div>

          {/* Real-time Streaming Transcript Preview */}
          <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 text-xs sm:text-sm text-white space-y-1 min-h-[56px] flex flex-col justify-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Live Speech Transcript:
            </span>
            <div className="font-medium italic text-emerald-300">
              {transcriptText ? (
                <span>&ldquo;{transcriptText}&rdquo;</span>
              ) : (
                <span className="text-slate-500 not-italic">
                  Listening... speak your symptoms in English, Hindi, or Tamil.
                </span>
              )}
            </div>
          </div>

          {/* Prominent Stop & Review Button */}
          <button
            type="button"
            onClick={stopRecordingAndReview}
            className="w-full py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-lg shadow-xl hover:shadow-red-500/30 transition-all flex items-center justify-center gap-3 cursor-pointer animate-pulse"
          >
            <Square className="w-5 h-5 fill-current" />
            <span>Stop &amp; Conclude Symptoms (Tap when done)</span>
          </button>
        </div>
      )}

      {/* 3. REVIEW & CONCLUDE STATE: Interactive symptom extraction & multi-select */}
      {recordMode === "review" && (
        <div className="w-full bg-white rounded-3xl p-5 sm:p-6 border-2 border-emerald-400 shadow-xl space-y-5 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-900 font-black text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Voice Intake &amp; Symptom Conclusion</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold font-mono">
              Recorded ({recordingSeconds}s)
            </span>
          </div>

          {/* Recorded Audio Playback */}
          {recordedAudioUrl && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 block">Your Microphone Audio</span>
                  <span className="text-[10px] text-slate-500">Listen back to your recording</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleVoicePlayback}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                {isPlayingRecordedVoice ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlayingRecordedVoice ? "Pause" : "Play Recording"}</span>
              </button>
            </div>
          )}

          {/* Editable Transcription Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
              <Edit3 className="w-3.5 h-3.5 text-blue-600" />
              <span>Transcribed Speech (Edit if words were misheard):</span>
            </label>
            <textarea
              rows={2}
              value={transcriptText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Spoken words will appear here. You can also type symptoms directly."
              className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-blue-600 focus:outline-none text-sm font-medium text-slate-900 bg-slate-50/70"
            />
          </div>

          {/* CONCLUDED POSSIBLE SYMPTOMS SECTION */}
          <div className="space-y-3 p-4 bg-emerald-50/70 rounded-2xl border-2 border-emerald-200">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-black text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Possible Symptoms Concluded From Audio:
                </span>
                <span className="text-[11px] text-emerald-800 block">
                  Tap any symptom to select or deselect before adding to chart
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold text-xs">
                {selectedSymptoms.length} Selected
              </span>
            </div>

            {/* If symptoms detected */}
            {selectedSymptoms.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedSymptoms.map((symptom) => {
                  const def = CLINICAL_SYMPTOM_TAXONOMY.find((d) => d.name === symptom);
                  return (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => handleToggleSymptom(symptom)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{def?.icon || "🩺"} {symptom}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  No specific medical keywords detected in audio
                </div>
                <p className="text-[11px] text-amber-800">
                  Please tap your symptoms from the list below or edit the speech text above.
                </p>
              </div>
            )}

            {/* Quick Add Other Common Symptoms */}
            <div className="pt-2 border-t border-emerald-200/80 space-y-1.5">
              <span className="text-[11px] font-bold text-emerald-900 block">
                + Add / Toggle Other Common Symptoms:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {CLINICAL_SYMPTOM_TAXONOMY.map((tax) => {
                  const isSelected = selectedSymptoms.includes(tax.name);
                  if (isSelected) return null; // already shown above

                  return (
                    <button
                      key={tax.id}
                      type="button"
                      onClick={() => handleToggleSymptom(tax.name)}
                      className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 text-[11px] font-semibold border border-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-emerald-600" />
                      <span>{tax.icon} {tax.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={startRecording}
              className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Re-record</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmTranscript}
              className="flex-1 py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm sm:text-base font-black shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>
                ✓ Confirm &amp; Add {selectedSymptoms.length > 0 ? `(${selectedSymptoms.length}) Symptoms` : "to Chart"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
