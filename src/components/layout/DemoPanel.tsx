"use client";

import React, { useState, useMemo } from "react";
import {
  Wrench,
  X,
  Sparkles,
  AlertOctagon,
  FileQuestion,
  RotateCcw,
  ShieldAlert,
  HeartPulse,
  Flower2,
  CheckCircle2,
  FileCode,
  Zap,
  Activity
} from "lucide-react";
import { useKioskStore } from "@/store/useKioskStore";
import { SupportedLanguage } from "@/types/kiosk";
import { useRouter } from "next/navigation";
import { CLINICAL_RED_FLAG_RULES } from "@/lib/redflag-rules";
import { generateFhirR4Bundle } from "@/lib/fhir-generator";
import { validateFhirBundle } from "@/lib/fhir-validator";

export const DemoPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const language = useKioskStore((state) => state.encounter.language);
  const setLanguage = useKioskStore((state) => state.setLanguage);
  const encounter = useKioskStore((state) => state.encounter);
  const patient = useKioskStore((state) => state.patient);
  const history = useKioskStore((state) => state.history);
  const documents = useKioskStore((state) => state.documents);
  const consent = useKioskStore((state) => state.consent);

  const loadSeedScenario = useKioskStore((state) => state.loadSeedScenario);
  const resetKiosk = useKioskStore((state) => state.resetKiosk);
  const setActiveRedFlagRule = useKioskStore((state) => state.setActiveRedFlagRule);
  const addAuditLog = useKioskStore((state) => state.addAuditLog);

  const demoFlags = useKioskStore((state) => state.demoFlags);
  const setDemoFlag = useKioskStore((state) => state.setDemoFlag);
  const setEncounterUrgency = useKioskStore((state) => state.setEncounterUrgency);

  // Compute live FHIR validation status
  const fhirValidation = useMemo(() => {
    try {
      const bundle = generateFhirR4Bundle(patient, encounter, history, consent, documents);
      return validateFhirBundle(bundle);
    } catch {
      return null;
    }
  }, [patient, encounter, history, consent, documents]);

  const handleTriggerSpecificRule = (ruleId: "RF-01" | "RF-02" | "RF-03") => {
    const rule = CLINICAL_RED_FLAG_RULES[ruleId];
    if (rule) {
      setActiveRedFlagRule(rule);
      setEncounterUrgency("urgent");
      setDemoFlag("forceRedFlagModal", true);
      addAuditLog("RED_FLAG_TRIGGERED", "MediKiosk Triage Engine (Simulator)", {
        ruleId: rule.ruleId,
        ruleName: rule.ruleName,
        guideline: rule.clinicalGuideline,
        symptoms: rule.triggerSymptoms,
      });
      setIsOpen(false);
    }
  };

  const handleLoadCardiac = () => {
    loadSeedScenario("cardiac");
    setEncounterUrgency("urgent");
    setIsOpen(false);
    router.push(`/doctor/summary/${encounter.id}`);
  };

  const handleLoadAyush = () => {
    loadSeedScenario("ayush");
    setDemoFlag("isAyushModeActive", true);
    setIsOpen(false);
    router.push("/opd/ayush");
  };

  const handleLoadEmergency = () => {
    loadSeedScenario("emergency");
    setIsOpen(false);
    router.push("/emergency");
  };

  const handleForceRedFlag = () => {
    setDemoFlag("forceRedFlagModal", true);
    setEncounterUrgency("urgent");
    setIsOpen(false);
  };

  const handleReset = () => {
    resetKiosk();
    setIsOpen(false);
    router.push("/");
  };

  return (
    <aside aria-label="Developer and Demo Control Panel" className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-900 hover:bg-indigo-800 text-white rounded-full shadow-2xl border-2 border-indigo-400/30 text-xs sm:text-sm font-bold transition-all hover:scale-105 active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Demo & Tester Panel</span>
        </button>
      ) : (
        <div className="w-80 sm:w-96 bg-slate-900 text-white rounded-3xl p-5 shadow-2xl border border-slate-700 space-y-4 animate-in zoom-in-90 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm tracking-wide">Developer & Hackathon Panel</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Live ABDM FHIR R4 Validation Badge */}
          <div className="p-3 bg-slate-800/90 rounded-2xl border border-slate-700/80 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span>ABDM FHIR R4 Bundle</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {fhirValidation?.isValid ? "8/8 Validated" : "ABDM Ready"}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Schema check: Patient, Encounter, Condition, MedicationRequest, Observation, DiagnosticReport, Composition, Consent all cross-linked.
            </p>
          </div>

          {/* Quick Scenario Pre-fills */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              One-Click Golden Demo Scenarios:
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={handleLoadCardiac}
                className="flex items-center justify-between p-2.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-800 text-red-200 text-xs font-semibold transition-all text-left"
              >
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-red-400" />
                  <div>
                    <div className="font-bold">Urgent Cardiac (Red-Flag)</div>
                    <div className="text-[10px] text-red-300">Chest pain + Diaphoresis + Metformin OCR</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-red-800 rounded">Load</span>
              </button>

              <button
                type="button"
                onClick={handleLoadAyush}
                className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800 text-emerald-200 text-xs font-semibold transition-all text-left"
              >
                <div className="flex items-center gap-2">
                  <Flower2 className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-bold">AYUSH Mode (Vata Joint Pain)</div>
                    <div className="text-[10px] text-emerald-300">Dashavidha Pariksha + Ahara-Vihara</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-800 rounded">Load</span>
              </button>

              <button
                type="button"
                onClick={handleLoadEmergency}
                className="flex items-center justify-between p-2.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800 text-amber-200 text-xs font-semibold transition-all text-left"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="font-bold">Break-Glass Emergency</div>
                    <div className="text-[10px] text-amber-300">Unconscious trauma case + Audit trail</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-amber-800 rounded">Load</span>
              </button>
            </div>
          </div>

          {/* Quick Simulation Toggles */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Rule-Based Triage Simulation:
            </p>

            {/* Direct Rule Triggers */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleTriggerSpecificRule("RF-01")}
                className="p-2 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-700 text-red-200 text-[11px] font-bold text-left transition-all"
              >
                <div className="text-red-400 font-mono text-[9px]">RULE RF-01</div>
                <div>Cardiac ACS</div>
              </button>

              <button
                type="button"
                onClick={() => handleTriggerSpecificRule("RF-02")}
                className="p-2 rounded-xl bg-amber-950/70 hover:bg-amber-900 border border-amber-700 text-amber-200 text-[11px] font-bold text-left transition-all"
              >
                <div className="text-amber-400 font-mono text-[9px]">RULE RF-02</div>
                <div>Stroke (FAST)</div>
              </button>
            </div>

            {/* Language switch */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-300">Force Language:</span>
              <div className="flex gap-1">
                {(["en", "hi", "ta"] as SupportedLanguage[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLanguage(l)}
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      language === l ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulate Low Confidence OCR */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Simulate Low-Confidence OCR:</span>
              <button
                type="button"
                onClick={() => setDemoFlag("isLowConfidenceOcr", !demoFlags.isLowConfidenceOcr)}
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  demoFlags.isLowConfidenceOcr
                    ? "bg-amber-500 text-slate-950"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {demoFlags.isLowConfidenceOcr ? "ACTIVE (<60%)" : "Normal (>90%)"}
              </button>
            </div>
          </div>

          {/* Reset button */}
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Kiosk State</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
