"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, Volume2, VolumeX, Eye, ShieldAlert, Stethoscope, ChevronDown, HelpCircle, Camera } from "lucide-react";
import { useKioskStore } from "@/store/useKioskStore";
import { getTranslation } from "@/lib/i18n";
import { SupportedLanguage } from "@/types/kiosk";

export const KioskHeader: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const language = useKioskStore((state) => state.encounter.language);
  const setLanguage = useKioskStore((state) => state.setLanguage);
  const encounterId = useKioskStore((state) => state.encounter.id);
  const urgency = useKioskStore((state) => state.encounter.urgency);
  const faceEnrolled = useKioskStore((state) => state.patient.faceEnrolled);

  const fontSize = useKioskStore((state) => state.accessibility.fontSize);
  const setFontSize = useKioskStore((state) => state.setFontSize);
  const ttsEnabled = useKioskStore((state) => state.accessibility.ttsEnabled);
  const toggleTts = useKioskStore((state) => state.toggleTts);
  const slowMode = useKioskStore((state) => state.accessibility.slowMode);
  const toggleSlowMode = useKioskStore((state) => state.toggleSlowMode);

  const setTutorialOpen = useKioskStore((state) => state.setTutorialOpen);
  const setProfileSettingsOpen = useKioskStore((state) => state.setProfileSettingsOpen);

  const t = getTranslation(language);

  const handleFontCycle = () => {
    const sequence: Array<"sm" | "md" | "lg" | "xl"> = ["sm", "md", "lg", "xl"];
    const nextIdx = (sequence.indexOf(fontSize) + 1) % sequence.length;
    setFontSize(sequence[nextIdx]);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand & Kiosk Terminal Tag */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Medi<span className="text-blue-600">Kiosk</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                SIH Edition
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              {t.facilityName}
            </p>
          </div>
        </Link>

        {/* Accessibility & Language Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            {(["en", "hi", "ta"] as SupportedLanguage[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  language === lang
                    ? "bg-white text-blue-700 shadow-sm border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {lang === "en" ? "EN" : lang === "hi" ? "हिन्दी" : "தமிழ்"}
              </button>
            ))}
          </div>

          {/* Font Size Button */}
          <button
            type="button"
            onClick={handleFontCycle}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors"
            title="Adjust text size (A- / A / A+)"
          >
            <span>A</span>
            <span className="text-xs text-slate-400 uppercase">({fontSize})</span>
          </button>

          {/* TTS Toggle */}
          <button
            type="button"
            onClick={toggleTts}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold transition-colors ${
              ttsEnabled
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
            }`}
            title="Toggle Text-to-Speech audio prompts"
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span className="hidden lg:inline">{t.audioPrompt}</span>
          </button>

          {/* Slow Mode Toggle */}
          <button
            type="button"
            onClick={toggleSlowMode}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold transition-colors ${
              slowMode
                ? "bg-amber-50 text-amber-800 border-amber-300"
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
            }`}
            title="Toggle slow audio narration and animation pace"
          >
            <span>🐢</span>
            <span>{t.slowMode}</span>
          </button>

          {/* How it works Button (Persistent) */}
          <button
            type="button"
            onClick={() => setTutorialOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-800 text-xs sm:text-sm font-bold transition-all shadow-xs"
            title="How MediKiosk Works"
          >
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">How it works</span>
          </button>

          {/* Profile & Emergency Face ID Settings */}
          <button
            type="button"
            onClick={() => setProfileSettingsOpen(true)}
            className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
              faceEnrolled
                ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
            title="Profile & Emergency Face ID Settings (DPDP Consent)"
          >
            <Camera className={`w-4 h-4 ${faceEnrolled ? "text-emerald-600" : "text-slate-500"}`} />
            <span>Face ID</span>
            {faceEnrolled ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            ) : null}
          </button>

          {/* Emergency Break-Glass Button */}
          {pathname !== "/emergency" && (
            <Link
              href="/emergency"
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              <ShieldAlert className="w-4 h-4" />
              <span className="hidden sm:inline">Emergency</span>
            </Link>
          )}

          {/* Doctor Portal Quick Link */}
          <Link
            href={`/doctor/summary/${encounterId}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
            title="View Physician Summary & FHIR Export"
          >
            <Stethoscope className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">{t.doctorPortal}</span>
          </Link>
        </div>
      </div>

      {/* Red-Flag Urgent Top Bar if flagged */}
      {urgency === "urgent" && (
        <div className="bg-red-600 text-white px-4 py-1.5 text-center text-xs sm:text-sm font-bold tracking-wide flex items-center justify-center gap-2 animate-pulse">
          <ShieldAlert className="w-4 h-4" />
          <span>TRIAGE ALERT: ENCOUNTER MARKED URGENT — PRIORITY ESCALATION ACTIVE</span>
        </div>
      )}
    </header>
  );
};
