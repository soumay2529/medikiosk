"use client";

import React, { useEffect } from "react";
import { AlertTriangle, BellRing, ArrowRight, ShieldCheck, FileText } from "lucide-react";
import { playAudioTone } from "@/lib/speech";
import { useKioskStore } from "@/store/useKioskStore";
import { getTranslation } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import { RedFlagRule } from "@/types/kiosk";

interface RedFlagModalProps {
  isOpen: boolean;
  onClose?: () => void;
  rule?: RedFlagRule;
  reason?: string;
}

export const RedFlagModal: React.FC<RedFlagModalProps> = ({
  isOpen,
  onClose,
  rule,
  reason = "Chest pain accompanied by cold sweating / breathlessness detected.",
}) => {
  const router = useRouter();
  const language = useKioskStore((state) => state.encounter.language);
  const encounterId = useKioskStore((state) => state.encounter.id);
  const setEncounterUrgency = useKioskStore((state) => state.setEncounterUrgency);
  const setActiveRedFlagRule = useKioskStore((state) => state.setActiveRedFlagRule);
  const addAuditLog = useKioskStore((state) => state.addAuditLog);
  const t = getTranslation(language);

  useEffect(() => {
    if (isOpen) {
      playAudioTone("alert");
      setEncounterUrgency("urgent");
      if (rule) {
        setActiveRedFlagRule(rule);
      }
      addAuditLog("RED_FLAG_TRIGGERED", "MediKiosk Clinical Rules Engine", {
        ruleId: rule?.ruleId || "RF-01",
        ruleName: rule?.ruleName || "Acute Coronary Syndrome Risk Criteria",
        triggerReason: reason,
        guideline: rule?.clinicalGuideline || "Standard Critical Triage Protocol",
        automatedAction: "Encounter urgency upgraded to URGENT, Nursing Desk alerted, Token #ET-09 issued",
      });
    }
  }, [isOpen, setEncounterUrgency, setActiveRedFlagRule, addAuditLog, rule, reason]);

  if (!isOpen) return null;

  const handleProceedToSummary = () => {
    onClose?.();
    router.push(`/doctor/summary/${encounterId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl border-4 border-red-600 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Urgent Header Banner */}
        <div className="bg-red-600 px-8 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full animate-bounce">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-white text-red-700 text-xs font-black uppercase rounded tracking-wider">
                  {rule?.ruleId || "Rule RF-01"}
                </span>
                <span className="text-red-100 text-xs font-mono">Deterministic Safety Gate</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-0.5">
                {rule?.ruleName || t.redFlagTitle}
              </h2>
            </div>
          </div>
          <span className="px-3 py-1 bg-white text-red-700 text-xs font-black uppercase rounded-full tracking-wider animate-pulse">
            Priority 1
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-8 space-y-5">
          <div className="p-5 rounded-2xl bg-red-50 border-2 border-red-200 flex items-start gap-4">
            <BellRing className="w-8 h-8 text-red-600 shrink-0 mt-0.5 animate-emergency-flash" />
            <div className="space-y-2">
              <p className="text-red-950 font-bold text-lg leading-snug">
                {t.redFlagAlertMsg}
              </p>
              <div className="p-2.5 rounded-lg bg-white border border-red-200 text-xs text-red-900 font-mono">
                <strong>Trigger Match:</strong> {reason}
              </div>
            </div>
          </div>

          {/* Guideline Citation */}
          {rule?.clinicalGuideline && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs text-slate-700">
              <div className="font-bold flex items-center gap-1.5 text-slate-900">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Clinical Triage Protocol Guideline:</span>
              </div>
              <p className="leading-relaxed">{rule.clinicalGuideline}</p>
              <p className="font-semibold text-blue-700 pt-1">
                📍 Assigned Route: {rule.recommendedDisposition}
              </p>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <p className="font-bold mb-1">🏥 Automated Safety Actions Logged to Audit Trail:</p>
            <ul className="list-disc list-inside space-y-0.5 text-slate-700">
              <li>{t.redFlagTriageNotified}</li>
              <li>Encounter urgency upgraded from <strong>Routine</strong> to <strong>URGENT (P1)</strong>.</li>
              <li>Encounter broadcasted to the Hospital Emergency Triage Desk queue.</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={handleProceedToSummary}
              className="flex-1 kiosk-btn bg-red-600 hover:bg-red-700 text-white shadow-lg text-lg"
            >
              <span>{t.redFlagAction}</span>
              <ArrowRight className="w-6 h-6" />
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-4 rounded-xl font-medium border-2 border-slate-300 text-slate-700 hover:bg-slate-100 text-base"
              >
                Review Symptoms First
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
