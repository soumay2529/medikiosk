"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Stethoscope, ShieldAlert, ArrowRight, Sparkles, CheckCircle2, FileText, Globe2, Mic } from "lucide-react";
import { useKioskStore } from "@/store/useKioskStore";
import { getTranslation } from "@/lib/i18n";
import { AudioPromptButton } from "@/components/common/AudioPromptButton";

export default function LandingPage() {
  const router = useRouter();
  const language = useKioskStore((state) => state.encounter.language);
  const setLanguage = useKioskStore((state) => state.setLanguage);
  const t = getTranslation(language);

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
      {/* Title & Welcome Section */}
      <div className="text-center space-y-4 mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-sm font-semibold">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>National Digital Health Mission (ABDM) • Integrated Terminal</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          {t.landingHeading}
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal">
          {t.landingSubheading}
        </p>

        {/* Audio helper button */}
        <div className="pt-2 flex justify-center">
          <AudioPromptButton
            textToSpeak={`${t.landingHeading}. ${t.landingSubheading}. ${t.standardOpdTitle} or ${t.emergencyTitle}.`}
            label={t.audioPrompt}
            size="md"
          />
        </div>
      </div>

      {/* Two Large Cards: Standard OPD vs Emergency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-10">
        {/* Card 1: Standard OPD Flow */}
        <div
          onClick={() => router.push("/opd/onboarding")}
          className="group relative bg-white rounded-3xl border-3 border-blue-200 hover:border-blue-600 shadow-lg hover:shadow-2xl transition-all cursor-pointer p-8 flex flex-col justify-between overflow-hidden active:scale-[0.99]"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-blue-50 rounded-bl-full -z-0 group-hover:scale-110 transition-transform" />

          <div className="relative z-10 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Stethoscope className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
                Routine Consultation
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                {t.standardOpdTitle}
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                {t.standardOpdDesc}
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="pt-3 space-y-2 text-sm text-slate-700 font-medium">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-emerald-600" />
                <span>Voice input in English, हिन्दी, & தமிழ்</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Digitise prior paper prescriptions (AI OCR)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Ayurveda (AYUSH) Dashavidha Pariksha option</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8">
            <button
              type="button"
              className="w-full kiosk-btn bg-blue-600 hover:bg-blue-700 text-white shadow-md text-lg group-hover:bg-blue-700"
            >
              <span>{t.standardOpdAction}</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Card 2: Emergency (Unidentified Patient) Break-Glass Flow */}
        <div
          onClick={() => router.push("/emergency")}
          className="group relative bg-white rounded-3xl border-3 border-red-200 hover:border-red-600 shadow-lg hover:shadow-2xl transition-all cursor-pointer p-8 flex flex-col justify-between overflow-hidden active:scale-[0.99]"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-red-50 rounded-bl-full -z-0 group-hover:scale-110 transition-transform" />

          <div className="relative z-10 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider animate-pulse">
                Emergency Break-Glass
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                {t.emergencyTitle}
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                {t.emergencyDesc}
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="pt-3 space-y-2 text-sm text-slate-700 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-600" />
                <span>Instant Emergency Triage Token (no ABHA needed)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-600" />
                <span>Rapid AVPU consciousness & trauma check</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-600" />
                <span>Legal break-glass consent override with audit logging</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8">
            <button
              type="button"
              className="w-full kiosk-btn bg-red-600 hover:bg-red-700 text-white shadow-md text-lg group-hover:bg-red-700"
            >
              <span>{t.emergencyAction}</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Language Quick-Select Strip */}
      <div className="flex flex-wrap items-center justify-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm text-sm">
        <span className="text-slate-500 font-semibold flex items-center gap-1.5">
          <Globe2 className="w-4 h-4 text-blue-600" />
          {t.selectLanguage}:
        </span>
        <button
          type="button"
          onClick={() => setLanguage("en")}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            language === "en" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          English
        </button>
        <button
          type="button"
          onClick={() => setLanguage("hi")}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            language === "hi" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          हिन्दी (Hindi)
        </button>
        <button
          type="button"
          onClick={() => setLanguage("ta")}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            language === "ta" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          தமிழ் (Tamil)
        </button>
      </div>
    </div>
  );
}
