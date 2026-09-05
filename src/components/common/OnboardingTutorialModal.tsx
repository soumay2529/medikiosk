"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Globe2,
  Mic,
  FileText,
  Shield,
  Stethoscope,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  HelpCircle,
  Film,
  RotateCcw,
  SkipForward,
  SkipBack,
  Camera,
  Cpu,
  Lock,
  UserCheck
} from "lucide-react";
import { useKioskStore } from "@/store/useKioskStore";
import { speakText, stopSpeaking, playAudioTone } from "@/lib/speech";

interface OnboardingTutorialModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const TUTORIAL_SLIDES = [
  {
    step: 1,
    title: "Choose Your Language",
    subtitle: "Accessible in English, हिन्दी, & தமிழ்",
    description:
      "Start by selecting your preferred language. MediKiosk provides full audio read-back support via the Web Speech API on every single screen for non-literate patients.",
    icon: Globe2,
    badge: "Multilingual Access",
    color: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-50 border-blue-200 text-blue-900",
    visual: (
      <div className="flex items-center justify-center gap-3 py-6">
        <div className="p-4 rounded-2xl bg-white border-2 border-blue-500 shadow-md text-center transform hover:scale-105 transition-all">
          <span className="text-3xl block">🇬🇧</span>
          <span className="text-xs font-black text-slate-800">English</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-sm text-center transform hover:scale-105 transition-all">
          <span className="text-3xl block">🇮🇳</span>
          <span className="text-xs font-black text-slate-800">हिन्दी</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-sm text-center transform hover:scale-105 transition-all">
          <span className="text-3xl block">🏛️</span>
          <span className="text-xs font-black text-slate-800">தமிழ்</span>
        </div>
      </div>
    ),
  },
  {
    step: 2,
    title: "Speak or Tap Your Symptoms",
    subtitle: "Multimodal Voice + Touch Clinical History",
    description:
      "Simply tap to speak or press quick-select symptom chips. Our clinical engine deterministically evaluates red flags (like Chest Pain + Sweating for Cardiac ACS) and instantly escalates urgent triage cases.",
    icon: Mic,
    badge: "Smart Clinical Intake",
    color: "from-purple-500 to-pink-600",
    bgLight: "bg-purple-50 border-purple-200 text-purple-900",
    visual: (
      <div className="space-y-3 py-4 max-w-sm mx-auto">
        <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-purple-200 shadow-xs">
          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center animate-pulse">
            <Mic className="w-4 h-4" />
          </div>
          <div className="text-xs font-semibold text-slate-700">
            &ldquo;छाती में भारीपन और पसीना आ रहा है...&rdquo;
          </div>
        </div>
        <div className="p-2.5 bg-red-100 rounded-xl border border-red-300 text-[11px] font-bold text-red-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
          <span>Rule RF-01 Detected: Priority 1 Triage Alert</span>
        </div>
      </div>
    ),
  },
  {
    step: 3,
    title: "Scan Prior Prescriptions",
    subtitle: "AI Document OCR with Inline Corrections",
    description:
      "Scan old doctor prescriptions or hospital discharge slips. MediKiosk extracts medication names and dosages with confidence scoring, allowing patients to review and confirm all items.",
    icon: FileText,
    badge: "Paper Record Digitisation",
    color: "from-amber-500 to-orange-600",
    bgLight: "bg-amber-50 border-amber-200 text-amber-900",
    visual: (
      <div className="p-3.5 bg-white rounded-2xl border-2 border-amber-300 shadow-sm space-y-2 max-w-sm mx-auto">
        <div className="flex items-center justify-between text-xs font-bold border-b border-slate-100 pb-1.5">
          <span className="text-slate-800">Metformin 500mg</span>
          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px]">93% High Conf</span>
        </div>
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-800">Atorvastatin 20mg</span>
          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px]">Review Needed</span>
        </div>
      </div>
    ),
  },
  {
    step: 4,
    title: "Optional Emergency Face ID",
    subtitle: "Protecting You When Unconscious (DPDP Compliant)",
    description:
      "Optionally enroll your facial reference in our secure hospital index. If you are ever brought in unconscious, ER doctors can scan your face to pull critical allergies and medications under DPDP Act 2023 §7(d). You can revoke this anytime!",
    icon: Shield,
    badge: "Biometric Safety Net",
    color: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50 border-emerald-200 text-emerald-900",
    visual: (
      <div className="flex items-center justify-center gap-4 py-4">
        <div className="relative w-20 h-20 rounded-2xl border-2 border-emerald-500 bg-slate-900 flex items-center justify-center text-white overflow-hidden shadow-md">
          <div className="absolute inset-0 bg-emerald-500/20 animate-pulse" />
          <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-emerald-400" />
          <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-emerald-400" />
          <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-emerald-400" />
          <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-emerald-400" />
          <Shield className="w-8 h-8 text-emerald-400" />
        </div>
        <div className="text-left text-xs space-y-1">
          <span className="font-bold text-slate-800 block">✓ Encrypted Hospital Index</span>
          <span className="text-[11px] text-slate-500 block">Never shared with national databases</span>
          <span className="text-[11px] text-emerald-700 font-semibold block">100% Consent Revocable</span>
        </div>
      </div>
    ),
  },
  {
    step: 5,
    title: "Physician Handoff & ABDM FHIR",
    subtitle: "Instant Consultation Summary & Interoperability",
    description:
      "Once submitted, attending doctors get a formatted clinical note with provenance badges, AYUSH parameters (Dashavidha Pariksha), print-to-PDF export, and an 8/8 validated ABDM FHIR R4 Bundle.",
    icon: Stethoscope,
    badge: "ABDM FHIR R4 Ready",
    color: "from-blue-600 to-indigo-700",
    bgLight: "bg-indigo-50 border-indigo-200 text-indigo-900",
    visual: (
      <div className="p-3.5 bg-slate-900 text-white rounded-2xl space-y-1.5 max-w-sm mx-auto text-left font-mono text-[11px]">
        <div className="flex items-center justify-between text-emerald-400 font-bold">
          <span>FHIR R4 Bundle (Document)</span>
          <span className="px-1.5 py-0.2 bg-emerald-900/60 rounded text-[9px]">8/8 Valid</span>
        </div>
        <div className="text-slate-400 text-[10px]">
          Patient • Encounter • Condition • Meds • Obs • DiagnosticReport • Composition • Consent
        </div>
      </div>
    ),
  },
];

// 5 Detailed Scenes for the Interactive Video Walkthrough Player
const VIDEO_SCENES = [
  {
    id: 1,
    timeStart: 0,
    timeEnd: 9,
    title: "Step 1: Multilingual Registration & Masked ABHA",
    tag: "OPD ONBOARDING",
    narration:
      "Step one: Patients select English, Hindi, or Tamil, and identify via their masked ABHA ID with DPDP Act data access controls.",
    renderScene: () => (
      <div className="h-full flex flex-col justify-between p-6 bg-slate-950 text-white animate-in fade-in">
        <div className="flex justify-between items-center text-xs text-blue-400 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            OPD INTAKE TERMINAL 04
          </span>
          <span>LANG: HINDI / ENGLISH / TAMIL</span>
        </div>

        <div className="space-y-4 max-w-md mx-auto w-full text-center">
          <div className="flex justify-center gap-3">
            <span className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md">
              🇬🇧 English
            </span>
            <span className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm border border-slate-700">
              🇮🇳 हिन्दी
            </span>
            <span className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm border border-slate-700">
              🏛️ தமிழ்
            </span>
          </div>

          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2 text-left">
            <div className="text-xs text-slate-400 font-bold">ABHA CARD VERIFICATION</div>
            <div className="text-xl font-mono text-emerald-400 font-black tracking-wider">
              14-8842-XXXX-3421
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>DPDP 2023 §6(4) Opt-in Consent Attached</span>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400">
          Scene 1/5 • Patient Registration &amp; Masked Health Identifier
        </div>
      </div>
    ),
  },
  {
    id: 2,
    timeStart: 9,
    timeEnd: 18,
    title: "Step 2: Voice & Touch Intake + Red-Flag Triage",
    tag: "SMART INTAKE",
    narration:
      "Step two: Patients speak their symptoms. Our deterministic clinical engine catches red flags like Acute Coronary Syndrome and triggers priority triage.",
    renderScene: () => (
      <div className="h-full flex flex-col justify-between p-6 bg-slate-950 text-white animate-in fade-in">
        <div className="flex justify-between items-center text-xs text-purple-400 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
            LIVE VOICE RECOGNITION (ASR)
          </span>
          <span>LANG: en-IN / hi-IN</span>
        </div>

        <div className="space-y-4 max-w-md mx-auto w-full text-center">
          {/* Animated Waveform */}
          <div className="flex items-center justify-center gap-1.5 h-12">
            {[40, 75, 100, 60, 90, 45, 80, 100, 70, 50, 85, 30, 90, 60].map((h, i) => (
              <div
                key={i}
                className="w-2 bg-gradient-to-t from-purple-500 to-pink-400 rounded-full animate-pulse"
                style={{ height: `${h}%`, animationDelay: `${i * 70}ms` }}
              />
            ))}
          </div>

          <div className="p-3 bg-purple-950/60 border border-purple-500/50 rounded-2xl text-xs text-purple-200 italic">
            &ldquo;Chest pain radiating to left arm with cold sweating since morning...&rdquo;
          </div>

          {/* Red Flag Alarm Banner */}
          <div className="p-3 bg-red-600 text-white rounded-xl font-bold text-xs flex items-center justify-between shadow-lg animate-bounce">
            <span>🚨 Rule RF-01 Triggered: Acute Coronary Syndrome</span>
            <span className="px-2 py-0.5 bg-white text-red-700 text-[10px] font-black rounded uppercase">
              Priority 1
            </span>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400">
          Scene 2/5 • Voice Transcription &amp; Deterministic Clinical Rules
        </div>
      </div>
    ),
  },
  {
    id: 3,
    timeStart: 18,
    timeEnd: 27,
    title: "Step 3: Paper Prescription OCR Scanner",
    tag: "DOCUMENT OCR",
    narration:
      "Step three: Digitize past paper prescriptions. AI OCR extracts medications with confidence scoring and allows one-click physician confirmation.",
    renderScene: () => (
      <div className="h-full flex flex-col justify-between p-6 bg-slate-950 text-white animate-in fade-in">
        <div className="flex justify-between items-center text-xs text-amber-400 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            OPTICAL CHARACTER RECOGNITION (OCR)
          </span>
          <span>STATUS: EXTRACTING</span>
        </div>

        <div className="relative max-w-sm mx-auto w-full p-4 bg-slate-900 border-2 border-amber-500/40 rounded-2xl overflow-hidden shadow-xl space-y-2.5">
          {/* Scanning laser beam */}
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce top-1/2 -translate-y-1/2 pointer-events-none" />

          <div className="flex items-center justify-between text-xs font-bold border-b border-slate-800 pb-2">
            <span className="text-slate-200">Metformin 500mg BD</span>
            <span className="px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-400 text-[10px] font-mono">
              ✓ 94% High Conf
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-bold border-b border-slate-800 pb-2">
            <span className="text-slate-200">Telmisartan 40mg OD</span>
            <span className="px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-400 text-[10px] font-mono">
              ✓ 91% High Conf
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-200">Atorvastatin 20mg HS</span>
            <span className="px-2 py-0.5 rounded bg-amber-900/80 text-amber-300 text-[10px] font-mono">
              ⚠️ Review Needed
            </span>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400">
          Scene 3/5 • AI Paper Prescription OCR with Confidence Scoring
        </div>
      </div>
    ),
  },
  {
    id: 4,
    timeStart: 27,
    timeEnd: 36,
    title: "Step 4: Emergency Face ID Safety Net",
    tag: "BIOMETRIC REGISTRY",
    narration:
      "Step four: Optionally register a facial reference. If brought in unconscious, emergency doctors can scan your face to pull critical allergy records.",
    renderScene: () => (
      <div className="h-full flex flex-col justify-between p-6 bg-slate-950 text-white animate-in fade-in">
        <div className="flex justify-between items-center text-xs text-emerald-400 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            EMERGENCY OPT-IN BIOMETRICS
          </span>
          <span>DPDP ACT §6(4)</span>
        </div>

        <div className="space-y-3 max-w-sm mx-auto w-full text-center">
          {/* Biometric reticle */}
          <div className="relative w-32 h-32 mx-auto rounded-3xl border-2 border-emerald-400/80 flex items-center justify-center bg-emerald-950/20 shadow-inner">
            <div className="absolute inset-2 border border-dashed border-emerald-300/60 rounded-2xl animate-spin" />
            <UserCheck className="w-12 h-12 text-emerald-400" />
            <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-emerald-500 text-slate-950 text-[9px] font-black rounded">
              92% MATCH
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-bold text-sm text-white">Rameshwar Prasad Patel (56y, M)</div>
            <div className="text-[11px] text-red-400 font-bold bg-red-950/80 border border-red-800 rounded-lg p-1.5">
              ⚠️ Severe Penicillin Allergy (Anaphylaxis Risk)
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400">
          Scene 4/5 • Opt-in Local Hospital Face ID for Unconscious Triage
        </div>
      </div>
    ),
  },
  {
    id: 5,
    timeStart: 36,
    timeEnd: 45,
    title: "Step 5: Physician Handoff & ABDM FHIR R4 Bundle",
    tag: "CLINICAL SUMMARY",
    narration:
      "Step five: Attending physicians receive a structured clinical summary, and an 8 out of 8 validated ABDM FHIR R4 bundle is generated.",
    renderScene: () => (
      <div className="h-full flex flex-col justify-between p-6 bg-slate-950 text-white animate-in fade-in">
        <div className="flex justify-between items-center text-xs text-cyan-400 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
            PHYSICIAN CLINICAL HANDOFF
          </span>
          <span>ABDM FHIR R4 (8/8 VALID)</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl max-w-sm mx-auto w-full text-left space-y-2 text-xs">
          <div className="flex items-center justify-between text-emerald-400 font-bold font-mono">
            <span>ABDM Document Bundle</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px]">
              ✓ Ready for EMR
            </span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Includes Patient, Encounter, Condition (SNOMED-CT: 29857009), MedicationRequest, Observations, DiagnosticReport, Composition &amp; Consent.
          </p>
          <div className="pt-1 flex gap-2">
            <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-[10px] font-mono">
              Provenance: Verified
            </span>
            <span className="px-2 py-1 bg-blue-900/60 text-blue-300 rounded text-[10px] font-mono">
              JSON Export: Ready
            </span>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400">
          Scene 5/5 • Doctor Review &amp; Interoperable Health Record Export
        </div>
      </div>
    ),
  },
];

export const OnboardingTutorialModal: React.FC<OnboardingTutorialModalProps> = ({
  isOpen,
  onClose,
}) => {
  const isStoreTutorialOpen = useKioskStore((state) => state.isTutorialOpen);
  const setStoreTutorialOpen = useKioskStore((state) => state.setTutorialOpen);
  const language = useKioskStore((state) => state.encounter.language);

  const [activeSlide, setActiveSlide] = useState(0);
  const [viewMode, setViewMode] = useState<"slides" | "video">("slides");

  // Video Simulation Player State
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0); // 0 to 45s
  const [isVideoMuted, setIsVideoMuted] = useState(false); // Default unmuted so voice is heard!
  const [playbackRate, setPlaybackRate] = useState<1 | 1.5>(1);

  const lastNarratedSceneRef = useRef<number>(-1);

  // Determine active open state
  const isModalVisible = isOpen ?? isStoreTutorialOpen;

  const handleClose = () => {
    stopSpeaking();
    setIsVideoPlaying(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("medikiosk_tutorial_completed", "true");
    }
    if (onClose) {
      onClose();
    } else {
      setStoreTutorialOpen(false);
    }
  };

  const handleNext = () => {
    if (activeSlide < TUTORIAL_SLIDES.length - 1) {
      setActiveSlide((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (activeSlide > 0) {
      setActiveSlide((prev) => prev - 1);
    }
  };

  // Video Timeline & Animation loop
  useEffect(() => {
    let timer: any = null;
    if (viewMode === "video" && isVideoPlaying) {
      timer = setInterval(() => {
        setVideoCurrentTime((prev) => {
          const next = prev + 1 * playbackRate;
          if (next >= 45) {
            return 0; // loop
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [viewMode, isVideoPlaying, playbackRate]);

  // Current Scene Index (0 to 4)
  const currentSceneIndex = Math.min(
    VIDEO_SCENES.length - 1,
    Math.floor(videoCurrentTime / 9)
  );
  const currentScene = VIDEO_SCENES[currentSceneIndex];

  // Narration Voiceover when scene changes in video mode
  useEffect(() => {
    if (viewMode === "video" && isVideoPlaying && !isVideoMuted) {
      if (lastNarratedSceneRef.current !== currentSceneIndex) {
        lastNarratedSceneRef.current = currentSceneIndex;
        speakText(currentScene.narration, language, false);
      }
    } else if (!isVideoPlaying || isVideoMuted) {
      stopSpeaking();
    }
  }, [viewMode, isVideoPlaying, isVideoMuted, currentSceneIndex, language, currentScene]);

  // Stop audio on tab switch or unmount
  useEffect(() => {
    if (viewMode !== "video") {
      stopSpeaking();
      setIsVideoPlaying(false);
    }
  }, [viewMode]);

  if (!isModalVisible) return null;

  const currentSlide = TUTORIAL_SLIDES[activeSlide];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl border-2 border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-base sm:text-lg">
                  Welcome to MediKiosk
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold uppercase">
                  SIH26047
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                AI-Assisted Multilingual Clinical Intake &amp; Triage Kiosk
              </p>
            </div>
          </div>

          {/* Mode Switcher (Slides vs Video) & Close */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-200 p-1 rounded-xl flex items-center text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setIsVideoPlaying(false);
                  setViewMode("slides");
                }}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === "slides"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Interactive Tour
              </button>
              <button
                type="button"
                onClick={() => {
                  playAudioTone("start");
                  setViewMode("video");
                  setIsVideoPlaying(true);
                }}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === "video"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Video Player</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Slide Content or Video */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {viewMode === "slides" ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Badge & Title */}
              <div className="text-center space-y-1.5">
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
                  {currentSlide.badge}
                </span>
                <h4 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {currentSlide.title}
                </h4>
                <p className="text-sm font-semibold text-blue-600">
                  {currentSlide.subtitle}
                </p>
              </div>

              {/* Animated Visual Card */}
              <div className={`p-6 rounded-3xl border-2 ${currentSlide.bgLight} transition-all`}>
                {currentSlide.visual}
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-slate-600 text-center leading-relaxed max-w-lg mx-auto">
                {currentSlide.description}
              </p>
            </div>
          ) : (
            /* Interactive Video Simulation Player */
            <div className="space-y-3 animate-in fade-in duration-200">
              {/* Video Monitor Frame */}
              <div className="relative aspect-video rounded-3xl bg-slate-950 overflow-hidden border-3 border-slate-800 shadow-2xl flex flex-col justify-between">
                {/* Scene Presentation */}
                <div className="flex-1 relative">
                  {currentScene.renderScene()}

                  {/* Center Play Button Overlay (when paused) */}
                  {!isVideoPlaying && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          playAudioTone("start");
                          setIsVideoPlaying(true);
                        }}
                        className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-xl transform hover:scale-105 transition-all cursor-pointer"
                      >
                        <Play className="w-8 h-8 fill-current translate-x-0.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Video HUD Control Bar */}
                <div className="bg-slate-900/95 border-t border-slate-800 p-3 flex flex-col gap-2">
                  {/* Timeline Scrubber */}
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-slate-400 font-bold w-10">
                      00:{Math.floor(videoCurrentTime).toString().padStart(2, "0")}
                    </span>

                    <input
                      type="range"
                      min={0}
                      max={45}
                      step={1}
                      value={videoCurrentTime}
                      onChange={(e) => {
                        setVideoCurrentTime(Number(e.target.value));
                      }}
                      className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />

                    <span className="text-[11px] font-mono text-slate-400 font-bold w-10 text-right">
                      00:45
                    </span>
                  </div>

                  {/* Playback Controls & Chapter Chips */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                        className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer"
                        title={isVideoPlaying ? "Pause Video" : "Play Video"}
                      >
                        {isVideoPlaying ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current translate-x-0.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setVideoCurrentTime(0);
                          setIsVideoPlaying(true);
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                        title="Restart from Beginning"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const nextMuted = !isVideoMuted;
                          setIsVideoMuted(nextMuted);
                          if (!nextMuted) {
                            playAudioTone("success");
                            speakText(currentScene.narration, language);
                          } else {
                            stopSpeaking();
                          }
                        }}
                        className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
                          isVideoMuted
                            ? "bg-slate-800 border-slate-700 text-slate-400"
                            : "bg-emerald-950/60 border-emerald-500 text-emerald-300"
                        }`}
                        title={isVideoMuted ? "Unmute Voiceover" : "Mute Voiceover"}
                      >
                        {isVideoMuted ? (
                          <VolumeX className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-emerald-400" />
                        )}
                        <span className="text-[10px] hidden sm:inline">
                          {isVideoMuted ? "Muted" : "Voice On"}
                        </span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPlaybackRate(playbackRate === 1 ? 1.5 : 1)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold transition-all cursor-pointer"
                        title="Toggle Speed"
                      >
                        {playbackRate}x
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chapter Jump Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1">
                {VIDEO_SCENES.map((scene, idx) => (
                  <button
                    key={scene.id}
                    type="button"
                    onClick={() => {
                      setVideoCurrentTime(scene.timeStart);
                      setIsVideoPlaying(true);
                    }}
                    className={`p-2 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer ${
                      currentSceneIndex === idx
                        ? "bg-blue-50 border-blue-500 text-blue-900 shadow-xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="text-[9px] font-mono uppercase text-slate-400">
                      00:{scene.timeStart.toString().padStart(2, "0")}
                    </div>
                    <div className="truncate font-black">{scene.tag}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer: Dots & Next/Prev Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          {/* Progress Dots */}
          <div className="flex items-center gap-1.5">
            {TUTORIAL_SLIDES.map((s, idx) => (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  setViewMode("slides");
                  setActiveSlide(idx);
                }}
                className={`transition-all rounded-full cursor-pointer ${
                  viewMode === "slides" && activeSlide === idx
                    ? "w-7 h-2.5 bg-blue-600"
                    : "w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400"
                }`}
                title={`Go to step ${s.step}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              Close
            </button>

            {viewMode === "slides" && activeSlide > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-black shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <span>{activeSlide === TUTORIAL_SLIDES.length - 1 ? "Start Using MediKiosk" : "Next Step"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
