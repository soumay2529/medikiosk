"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Flower2,
  Sparkles,
  Flame,
  Moon,
  Utensils,
  Smile,
  Activity,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Info
} from "lucide-react";
import { useKioskStore } from "@/store/useKioskStore";
import { getTranslation } from "@/lib/i18n";
import { AudioPromptButton } from "@/components/common/AudioPromptButton";
import { ClinicalValue } from "@/types/kiosk";

export default function AyushPage() {
  const router = useRouter();
  const language = useKioskStore((state) => state.encounter.language);
  const history = useKioskStore((state) => state.history);
  const setAyushField = useKioskStore((state) => state.setAyushField);
  const setAyushAharaViharaField = useKioskStore((state) => state.setAyushAharaViharaField);

  const t = getTranslation(language);

  // Tab view: 0 = Dashavidha Pariksha (10-fold clinical exam), 1 = Ahara-Vihara (Diet & Routine)
  const [activeTab, setActiveTab] = useState<0 | 1>(0);

  const ayush = history.ayush;

  const handlePrakritiSelect = (val: string) => {
    setAyushField("prakriti", {
      field: "prakriti",
      value: val,
      source: "patient_touch",
      confidence: 0.95,
      verificationState: "patient_confirmed",
    });
  };

  const handleAgniSelect = (val: string) => {
    setAyushField("ahara_shakti", {
      field: "ahara_shakti",
      value: val,
      source: "patient_touch",
      confidence: 0.94,
      verificationState: "patient_confirmed",
    });
  };

  const handleSleepSelect = (val: string) => {
    setAyushAharaViharaField("sleep_pattern", {
      field: "sleep_pattern",
      value: val,
      source: "patient_touch",
      confidence: 0.95,
      verificationState: "patient_confirmed",
    });
  };

  const handleBowelSelect = (val: string) => {
    setAyushAharaViharaField("bowel_habits", {
      field: "bowel_habits",
      value: val,
      source: "patient_touch",
      confidence: 0.96,
      verificationState: "patient_confirmed",
    });
  };

  const handleAppetiteSelect = (val: string) => {
    setAyushAharaViharaField("appetite", {
      field: "appetite",
      value: val,
      source: "patient_touch",
      confidence: 0.93,
      verificationState: "patient_confirmed",
    });
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col justify-between">
      <div className="space-y-6">
        {/* Title & AYUSH Disclaimer */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <Flower2 className="w-4 h-4 text-emerald-700" />
              <span>Ayurveda & Traditional Systems of Medicine</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {t.ayushTitle}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              {t.ayushSubtitle}
            </p>
          </div>
          <AudioPromptButton textToSpeak={t.ayushDisclaimer} size="md" />
        </div>

        {/* Informational Banner */}
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-start gap-3 text-emerald-900 text-sm">
          <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <p className="font-medium leading-relaxed">{t.ayushDisclaimer}</p>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab(0)}
            className={`py-3 px-4 rounded-xl font-bold text-sm sm:text-base transition-all ${
              activeTab === 0
                ? "bg-white text-emerald-800 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            1. Dashavidha Pariksha (दशविध परीक्षा)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab(1)}
            className={`py-3 px-4 rounded-xl font-bold text-sm sm:text-base transition-all ${
              activeTab === 1
                ? "bg-white text-emerald-800 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            2. Ahara-Vihara (आहार एवं दिनचर्या)
          </button>
        </div>

        {/* TAB 0: DASHAVIDHA PARIKSHA */}
        {activeTab === 0 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 1. Prakriti (Constitution) */}
            <div className="kiosk-card space-y-3">
              <label className="block text-base font-bold text-slate-900">
                1. Prakriti (प्रकृति - Body Constitution & Thermal Preference)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { key: "vata", title: "Vata (वात)", desc: "Lean build, dry skin, sensitive to cold, active mind" },
                  { key: "pitta", title: "Pitta (पित्त)", desc: "Moderate build, warm body, intolerant to heat, sharp hunger" },
                  { key: "kapha", title: "Kapha (कफ)", desc: "Solid/heavy build, cool smooth skin, calm temperament, slow digestion" },
                ].map((p) => {
                  const isSelected = ayush?.prakriti?.value?.toLowerCase().includes(p.key);
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => handlePrakritiSelect(p.title)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        isSelected
                          ? "bg-emerald-50 border-emerald-600 shadow-md ring-2 ring-emerald-300"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="font-bold text-base text-slate-900">{p.title}</div>
                      <div className="text-xs text-slate-500 mt-1">{p.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Ahara Shakti & Agni (Digestive Fire) */}
            <div className="kiosk-card space-y-3">
              <label className="block text-base font-bold text-slate-900">
                2. Agni & Ahara Shakti (अग्नि - Digestive Strength)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {[
                  { title: "Samagni (समग्नि)", desc: "Balanced digestion, predictable hunger" },
                  { title: "Vishamagni (विषमाग्नि)", desc: "Irregular digestion, bloating, gas" },
                  { title: "Tikshnagni (तीक्ष्णाग्नि)", desc: "Intense hunger, acid reflux, heartburn" },
                  { title: "Mandagni (मन्दाग्नि)", desc: "Sluggish digestion, heaviness after food" },
                ].map((a) => {
                  const isSelected = ayush?.ahara_shakti?.value === a.title;
                  return (
                    <button
                      key={a.title}
                      type="button"
                      onClick={() => handleAgniSelect(a.title)}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                        isSelected
                          ? "bg-emerald-50 border-emerald-600 shadow-md ring-2 ring-emerald-300"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="font-bold text-sm text-slate-900">{a.title}</div>
                      <div className="text-xs text-slate-500 mt-1">{a.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Sara & Samhanana (Tissue Compactness & Resilience) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="kiosk-card space-y-2">
                <label className="block text-sm font-bold text-slate-800">
                  Vyayama Shakti (व्यायाम शक्ति - Physical Stamina)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Pravara (High)", "Madhyama (Moderate)", "Avara (Low)"].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() =>
                        setAyushField("vyayama_shakti", {
                          field: "vyayama_shakti",
                          value: v,
                          source: "patient_touch",
                          confidence: 0.95,
                          verificationState: "patient_confirmed",
                        })
                      }
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        ayush?.vyayama_shakti?.value === v
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="kiosk-card space-y-2">
                <label className="block text-sm font-bold text-slate-800">
                  Sattva (सत्त्व - Mental Resilience / Temperament)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Pravara (Calm/Strong)", "Madhyama (Balanced)", "Avara (Easily Anxious)"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() =>
                        setAyushField("sattva", {
                          field: "sattva",
                          value: s,
                          source: "patient_touch",
                          confidence: 0.95,
                          verificationState: "patient_confirmed",
                        })
                      }
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        ayush?.sattva?.value === s
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: AHARA-VIHARA */}
        {activeTab === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Nidra (Sleep) */}
            <div className="kiosk-card space-y-3">
              <label className="block text-base font-bold text-slate-900 flex items-center gap-2">
                <Moon className="w-5 h-5 text-indigo-600" />
                Nidra (निद्रा - Sleep Pattern & Quality)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  "Samyak Nidra (Sound sleep, 7-8 hours)",
                  "Alpanidra (Fragmented sleep / Insomnia)",
                  "Atinidra (Excessive sleepiness / Lethargy)",
                ].map((sl) => {
                  const isSelected = ayush?.ahara_vihara?.sleep_pattern?.value === sl;
                  return (
                    <button
                      key={sl}
                      type="button"
                      onClick={() => handleSleepSelect(sl)}
                      className={`p-4 rounded-2xl border-2 text-left font-bold transition-all ${
                        isSelected
                          ? "bg-emerald-50 border-emerald-600 text-emerald-900 shadow-md"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {sl}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Koshta (Bowel Habits) */}
            <div className="kiosk-card space-y-3">
              <label className="block text-base font-bold text-slate-900">
                Koshta (कोष्ठ - Bowel Nature & Evacuation)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { title: "Madhya Koshta (मध्य)", desc: "Regular daily bowel movement" },
                  { title: "Krura Koshta (क्रूर)", desc: "Tendency for hard stool & constipation" },
                  { title: "Mridu Koshta (मृदु)", desc: "Loose stools, sensitive to milk/ghee" },
                ].map((k) => {
                  const isSelected = ayush?.ahara_vihara?.bowel_habits?.value?.includes(k.title);
                  return (
                    <button
                      key={k.title}
                      type="button"
                      onClick={() => handleBowelSelect(k.title)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        isSelected
                          ? "bg-emerald-50 border-emerald-600 text-emerald-900 shadow-md"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="font-bold text-base text-slate-900">{k.title}</div>
                      <div className="text-xs text-slate-500 mt-1">{k.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Meal Timing & Routine */}
            <div className="kiosk-card space-y-3">
              <label className="block text-base font-bold text-slate-900 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-amber-600" />
                Ahara Vidhi (भोजन समय - Dietary Regularity)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  "Regular meal times everyday",
                  "Irregular / Skips morning breakfast",
                  "Late night eating / Heavy dinners",
                ].map((mt) => {
                  const isSelected = ayush?.ahara_vihara?.meal_timing?.value === mt;
                  return (
                    <button
                      key={mt}
                      type="button"
                      onClick={() =>
                        setAyushAharaViharaField("meal_timing", {
                          field: "meal_timing",
                          value: mt,
                          source: "patient_touch",
                          confidence: 0.95,
                          verificationState: "patient_confirmed",
                        })
                      }
                      className={`p-3.5 rounded-2xl border-2 text-left font-bold transition-all ${
                        isSelected
                          ? "bg-emerald-50 border-emerald-600 text-emerald-900 shadow-md"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {mt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-8 border-t border-slate-200 mt-8">
        <button
          type="button"
          onClick={() => router.push("/opd/documents")}
          className="kiosk-btn bg-slate-100 hover:bg-slate-200 text-slate-700"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t.back}</span>
        </button>

        <button
          type="button"
          onClick={() => router.push("/opd/review")}
          className="kiosk-btn bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg text-lg"
        >
          <span>Continue to Patient Review</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
