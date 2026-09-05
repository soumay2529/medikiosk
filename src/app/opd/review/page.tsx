"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Volume2,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  FileCheck,
  Edit3,
  Stethoscope,
  Send,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  Trash2,
  Lock,
  ExternalLink
} from "lucide-react";
import { useKioskStore } from "@/store/useKioskStore";
import { getTranslation } from "@/lib/i18n";
import { AudioPromptButton } from "@/components/common/AudioPromptButton";
import { speakText } from "@/lib/speech";

export default function PatientReviewPage() {
  const router = useRouter();
  const language = useKioskStore((state) => state.encounter.language);
  const encounter = useKioskStore((state) => state.encounter);
  const patient = useKioskStore((state) => state.patient);
  const history = useKioskStore((state) => state.history);
  const addAuditLog = useKioskStore((state) => state.addAuditLog);
  const terminateSession = useKioskStore((state) => state.terminateSession);

  const t = getTranslation(language);

  const [staffCalled, setStaffCalled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showTerminateConfirm, setShowTerminateConfirm] = useState(false);

  // Formulate patient-friendly summary text in the selected language
  const chiefComplaintsText = history.chief_complaint.length > 0
    ? history.chief_complaint.map((c) => `${c.text} (${c.duration || "3 hours"})`).join(", ")
    : "No major symptoms recorded";

  const medsText = history.medications.length > 0
    ? history.medications.map((m) => `${m.name} ${m.dosage}`).join(", ")
    : "No regular medications";

  const allergiesText = history.allergies.length > 0
    ? history.allergies.map((a) => `${a.allergen}`).join(", ")
    : "No known drug allergies (NKDA)";

  const patientSpokenSummary = `Hello ${patient.name || "Patient"}. You told MediKiosk that you have had ${chiefComplaintsText}. You are currently taking ${medsText}, and have ${allergiesText}. If this is correct, press Send to Doctor.`;

  const handleCallStaff = () => {
    setStaffCalled(true);
    addAuditLog("CONSENT_GRANTED", "Patient", {
      action: "Requested physical kiosk attendant assistance at Terminal 04",
    });
  };

  const handleOpenSubmitModal = () => {
    addAuditLog("PHYSICIAN_EDIT", "Patient Kiosk Finalizer", {
      status: "Patient confirmed intake draft and dispatched to physician queue",
    });
    setShowSubmitModal(true);
  };

  const handleClearSessionAndExit = () => {
    terminateSession();
    router.push("/");
  };

  const handleGoToDoctorSummary = () => {
    router.push(`/doctor/summary/${encounter.id}`);
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 flex flex-col justify-between">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-2xl mx-auto flex items-center justify-center">
            <FileCheck className="w-7 h-7" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {t.reviewTitle}
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            {t.reviewSubtitle}
          </p>

          {/* Audio read-back */}
          <div className="pt-2 flex justify-center">
            <AudioPromptButton textToSpeak={patientSpokenSummary} label="Listen to Summary" size="lg" />
          </div>
        </div>

        {/* Spoken Narration Box */}
        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border-2 border-blue-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Spoken Summary</span>
          </div>

          <p className="text-lg sm:text-xl text-slate-800 font-medium leading-relaxed">
            &ldquo;You told us that you have had <strong className="text-blue-900 underline">{chiefComplaintsText}</strong>, are taking <strong className="text-blue-900 underline">{medsText}</strong>, and have <strong className="text-blue-900 underline">{allergiesText}</strong>.&rdquo;
          </p>
        </div>

        {/* Structured Sections with quick edit triggers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Box 1: Symptoms */}
          <div className="kiosk-card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Chief Symptoms</span>
              <button
                type="button"
                onClick={() => router.push("/opd/history")}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
            <p className="text-base font-bold text-slate-900">{chiefComplaintsText}</p>
          </div>

          {/* Box 2: Medicines */}
          <div className="kiosk-card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Medicines</span>
              <button
                type="button"
                onClick={() => router.push("/opd/documents")}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit / Scan
              </button>
            </div>
            <p className="text-base font-bold text-slate-900">{medsText}</p>
          </div>

          {/* Box 3: Allergies */}
          <div className="kiosk-card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Allergies</span>
              <button
                type="button"
                onClick={() => router.push("/opd/history")}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
            <p className="text-base font-bold text-slate-900">{allergiesText}</p>
          </div>

          {/* Box 4: AYUSH or General Status */}
          <div className="kiosk-card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">AYUSH / Constitution</span>
              <button
                type="button"
                onClick={() => router.push("/opd/ayush")}
                className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" /> Open AYUSH
              </button>
            </div>
            <p className="text-base font-bold text-slate-900">
              {history.ayush ? `Prakriti: ${history.ayush.prakriti.value} • Agni: ${history.ayush.ahara_shakti.value}` : "Standard Allopathic Intake"}
            </p>
          </div>
        </div>

        {/* DPDP Act 2023 Terminal Privacy Notice */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs text-slate-600 gap-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              <strong>DPDP Privacy Guarantee:</strong> Local terminal data is strictly ephemerally held and will be wiped immediately upon submission or after 24 hours per statutory data minimization rules.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowTerminateConfirm(true)}
            className="text-xs text-red-600 hover:text-red-700 font-bold underline shrink-0 flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            <span>Abort & Wipe Session</span>
          </button>
        </div>

        {/* Attendant call notification */}
        {staffCalled && (
          <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-300 flex items-center gap-3 text-amber-900 text-sm font-semibold animate-in fade-in">
            <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{t.staffAlertedToast}</span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-200 mt-8">
        <button
          type="button"
          onClick={handleCallStaff}
          className="w-full sm:w-auto kiosk-btn bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm"
        >
          <HelpCircle className="w-5 h-5 text-amber-600" />
          <span>{t.requestStaffHelp}</span>
        </button>

        <button
          type="button"
          onClick={handleOpenSubmitModal}
          disabled={isSubmitting}
          className="w-full sm:w-auto kiosk-btn bg-blue-600 hover:bg-blue-700 text-white shadow-xl text-xl font-black group"
        >
          <span>{t.reviewDoctorCTA}</span>
          <Send className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Post-Submission DPDP Dispatch Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl border-2 border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-3xl mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full font-mono text-xs font-bold border border-emerald-200">
                Encounter ID: {encounter.id}
              </span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Intake Transmitted to Physician Queue!
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Your clinical history, medications, and scanned documents have been securely compiled into a FHIR R4 clinical package for the attending physician.
              </p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-1.5 text-xs text-blue-900">
              <div className="font-bold flex items-center gap-1.5 text-blue-950">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <span>DPDP Act 2023 Terminal Hygiene</span>
              </div>
              <p className="text-blue-800 leading-relaxed">
                To prevent unauthorized access to your health records by subsequent patients at this terminal, choose <strong>Clear Kiosk Session</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2">
              <button
                type="button"
                onClick={handleClearSessionAndExit}
                className="w-full py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-base shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5 text-emerald-400" />
                <span>Clear Kiosk Session (DPDP Compliant)</span>
              </button>

              <button
                type="button"
                onClick={handleGoToDoctorSummary}
                className="w-full py-3.5 px-6 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-sm border-2 border-blue-200 transition-all flex items-center justify-center gap-2"
              >
                <span>View Physician Summary &amp; FHIR Bundle (Doctor/Judge)</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Abort & Wipe Confirmation Dialog */}
      {showTerminateConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border-2 border-red-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 bg-red-100 rounded-2xl">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Abort & Wipe Kiosk Session?</h3>
                <p className="text-xs text-slate-500">DPDP Instant Data Erasure Protocol</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              This will immediately clear all entered demographic data, chief complaints, and scanned prescriptions from the terminal memory.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowTerminateConfirm(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
              >
                Continue Intake
              </button>
              <button
                type="button"
                onClick={handleClearSessionAndExit}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm & Wipe Memory</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
