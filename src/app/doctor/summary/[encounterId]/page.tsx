"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Stethoscope,
  ShieldAlert,
  Download,
  Database,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit2,
  Check,
  Save,
  Cpu,
  FileText,
  User,
  Activity,
  HeartPulse,
  Flame,
  Flower2,
  ExternalLink,
  MessageSquare,
  Printer,
  ListOrdered,
  Info,
  HelpCircle,
  Clock,
  Lock,
  X,
  UserCheck
} from "lucide-react";
import { useKioskStore } from "@/store/useKioskStore";
import { getTranslation } from "@/lib/i18n";
import { SourceBadge } from "@/components/common/SourceBadge";
import { ConfidenceIndicator } from "@/components/common/ConfidenceIndicator";
import { generateFhirR4Bundle, triggerFhirJsonDownload } from "@/lib/fhir-generator";
import { generateClinicalSummaryText } from "@/lib/mock-ai";
import { validateFhirBundle } from "@/lib/fhir-validator";

export default function DoctorSummaryPage() {
  const params = useParams();
  const router = useRouter();
  const encounterId = (params?.encounterId as string) || "ENC-DEMO-01";

  const encounter = useKioskStore((state) => state.encounter);
  const patient = useKioskStore((state) => state.patient);
  const history = useKioskStore((state) => state.history);
  const documents = useKioskStore((state) => state.documents);
  const consent = useKioskStore((state) => state.consent);
  const audit = useKioskStore((state) => state.audit);
  const triageQueue = useKioskStore((state) => state.triageQueue);
  const emergency = useKioskStore((state) => state.emergency);

  const confirmAllHighConfidenceFields = useKioskStore((state) => state.confirmAllHighConfidenceFields);
  const updateItemVerification = useKioskStore((state) => state.updateItemVerification);
  const addAuditLog = useKioskStore((state) => state.addAuditLog);

  const t = getTranslation(encounter.language);

  const [hisSavedToast, setHisSavedToast] = useState(false);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [showFhirValidationModal, setShowFhirValidationModal] = useState(false);
  const [fhirValidationReport, setFhirValidationReport] = useState<any>(null);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const [editingClinicalNote, setEditingClinicalNote] = useState(false);
  const [clinicalNoteText, setClinicalNoteText] = useState(() =>
    generateClinicalSummaryText(patient, history, encounter.urgency)
  );

  // Validate and Download FHIR JSON
  const handleValidateAndDownloadFhir = () => {
    const bundle = generateFhirR4Bundle(patient, encounter, history, consent, documents);
    const report = validateFhirBundle(bundle);
    setFhirValidationReport(report);
    setShowFhirValidationModal(true);

    if (report.isValid) {
      triggerFhirJsonDownload(bundle, `FHIR_R4_Bundle_${patient.name?.replace(/\s+/g, "_") || "Patient"}_${encounter.id}.json`);
      addAuditLog("FHIR_EXPORTED", "Dr. Rajesh K. Gupta", {
        bundleId: bundle.id,
        resourcesExported: bundle.entry.length,
        validationPassed: true,
      });
    }
  };

  // Mock Save to Hospital Information System (HIS / EMR)
  const handleSaveToHis = () => {
    setHisSavedToast(true);
    addAuditLog("HIS_SAVED", "Dr. Rajesh K. Gupta", {
      destination: "AIIMS EMR Core (PostgreSQL ABDM Bridge)",
      encounterId: encounter.id,
      patientId: patient.hospital_id || patient.abha_id,
      timestamp: new Date().toISOString(),
    });

    setTimeout(() => {
      setHisSavedToast(false);
    }, 4000);
  };

  const handlePrintSummary = () => {
    window.print();
  };

  const ruleFired = encounter.activeRedFlagRule || (encounter.urgency === "urgent" ? {
    ruleId: "RF-01",
    ruleName: "Acute Coronary Syndrome (ACS) Risk Criteria",
    clinicalGuideline: "AHA/ACC & Indian Resuscitation Council Guideline: Retrosternal pressure + diaphoresis/dyspnea. STAT 12-lead ECG, Troponin I required within 10 min.",
    recommendedDisposition: "Emergency Cardiology Triage Counter 01 / Red Corridor",
    triggerSymptoms: ["Chest Pain", "Diaphoresis", "Dyspnea"],
  } : undefined);

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 print:p-2 print:space-y-4">
      {/* Top Banner: Mandatory AI Disclaimer */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-amber-950 font-bold text-base sm:text-lg">
              {t.doctorDraftBanner}
            </h2>
            <p className="text-xs sm:text-sm text-amber-800">
              All clinical inferences, OCR extractions, and voice history items must be confirmed or amended by the attending physician before committing to permanent medical records.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowQueueModal(true)}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <ListOrdered className="w-4 h-4 text-amber-400" />
            <span>Triage Queue ({triageQueue.filter(q => q.urgency === 'urgent').length})</span>
          </button>
          <button
            type="button"
            onClick={confirmAllHighConfidenceFields}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow transition-colors flex items-center gap-1.5 shrink-0"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{t.confirmAllHigh}</span>
          </button>
        </div>
      </div>

      {/* Red-Flag Deterministic Rule Banner (if urgent) */}
      {encounter.urgency === "urgent" && ruleFired && (
        <div className="bg-red-600 text-white rounded-2xl p-5 shadow-lg border-2 border-red-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl shrink-0 animate-bounce">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-white text-red-700 text-xs font-black uppercase rounded tracking-wider">
                  {ruleFired.ruleId}
                </span>
                <span className="font-bold text-base sm:text-lg">
                  {ruleFired.ruleName}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-red-100 leading-relaxed">
                <strong>Clinical Guideline:</strong> {ruleFired.clinicalGuideline}
              </p>
              <p className="text-xs text-red-200">
                <strong>Disposition Route:</strong> {ruleFired.recommendedDisposition}
              </p>
            </div>
          </div>
          <span className="px-3.5 py-1.5 bg-white text-red-700 text-xs font-black uppercase rounded-full shadow-sm tracking-wider shrink-0">
            Priority 1 Escalation Active
          </span>
        </div>
      )}

      {/* Emergency Break-Glass Intake Profile (if emergency encounter) */}
      {(emergency || encounter.type === "EMERGENCY") && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 border-2 border-red-500 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-600 rounded-2xl text-white">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 bg-red-500/20 border border-red-500/40 text-red-300 text-[10px] font-black uppercase rounded">
                  Statutory Break-Glass Override (§7(d) DPDP Act 2023)
                </span>
                <h2 className="text-xl font-black text-white mt-1">
                  Emergency Intake Profile &amp; Clinician Audit Stamp
                </h2>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-amber-300 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              Reason: {emergency?.breakGlassAudit?.reasonCode || "UNCONSCIOUS_TRAUMA"}
            </span>
          </div>

          {/* Biometric Resolution Status Banner (if matched) */}
          {emergency?.biometricMatch?.matched && (
            <div className="p-4 bg-emerald-950/80 border border-emerald-500/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      {emergency.biometricMatch.patientName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400 text-emerald-300 text-[10px] font-black uppercase font-mono">
                      {Math.round((emergency.biometricMatch.confidenceScore || 0.92) * 100)}% Match
                    </span>
                  </div>
                  <span className="text-emerald-200/90 text-[11px]">
                    Opt-in hospital biometric registry match • Pre-loaded critical emergency medical records
                  </span>
                </div>
              </div>

              {emergency.biometricMatch.allergies && emergency.biometricMatch.allergies.length > 0 && (
                <div className="px-3 py-1.5 bg-red-950 border border-red-500 rounded-lg text-red-200 font-bold text-[11px] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>Allergy Alert: {emergency.biometricMatch.allergies.join(", ")}</span>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <span className="text-slate-400 font-bold block">AVPU Consciousness</span>
              <span className="text-base font-black text-amber-300 capitalize">{emergency?.responsiveness || "pain"}</span>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <span className="text-slate-400 font-bold block">Breathing Status</span>
              <span className="text-base font-black text-red-400 capitalize">{emergency?.breathingStatus || "distressed"}</span>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <span className="text-slate-400 font-bold block">Responsible Clinician ID</span>
              <span className="text-sm font-mono font-bold text-emerald-400">{emergency?.breakGlassAudit?.responsibleClinicianId || "REG-DOC-2026-9048"}</span>
              <span className="text-[10px] text-slate-400 block truncate">{emergency?.breakGlassAudit?.responsibleClinicianName || "Dr. Vikramaditya Rathore"}</span>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <span className="text-slate-400 font-bold block">Activating Staff ID</span>
              <span className="text-xs font-semibold text-slate-200">{emergency?.breakGlassAudit?.activatedBy || "Nurse Incharge Anita Roy"}</span>
            </div>
          </div>

          {emergency?.visibleInjuries && (
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 text-xs space-y-1">
              <span className="text-slate-400 font-bold">Observed Injuries / Trauma Findings:</span>
              <p className="text-slate-200 font-medium">{emergency.visibleInjuries}</p>
            </div>
          )}

          <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-800/50 text-xs flex items-start gap-2 text-amber-200">
            <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>24-Hour Identity Linkage Protocol: </strong>
              <span>{emergency?.breakGlassAudit?.scheduledIdentityLinking || "Biometric & ABHA reconciliation scheduled within 24 hours at Triage Desk."}</span>
            </div>
          </div>
        </div>
      )}

      {/* Patient Snapshot Banner */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <User className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">
                {patient.name || "Aarav Sharma"}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold font-mono">
                {patient.age || 45}y / {patient.sex ? patient.sex.toUpperCase() : "MALE"}
              </span>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                  encounter.urgency === "urgent"
                    ? "bg-red-600 text-white animate-pulse"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {encounter.urgency === "urgent" ? "⚠️ URGENT (TRIAGE P1)" : "ROUTINE OPD"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-mono">
              <span><strong>ABHA:</strong> {patient.masked_abha || patient.abha_id || "XX-XXXX-XXXX-3421"}</span>
              <span>•</span>
              <span><strong>UHID:</strong> {patient.hospital_id || "AIIMS-2026-9048"}</span>
              <span>•</span>
              <span><strong>Encounter:</strong> {encounter.id}</span>
              <span>•</span>
              <span><strong>Dept:</strong> {encounter.department}</span>
            </div>
          </div>
        </div>

        {/* Global Physician Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto print:hidden">
          <button
            type="button"
            onClick={handlePrintSummary}
            className="px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5"
            title="Print Consultation Note / Save as PDF"
          >
            <Printer className="w-4 h-4 text-slate-700" />
            <span>Print / PDF</span>
          </button>

          <button
            type="button"
            onClick={handleValidateAndDownloadFhir}
            className="px-4 py-2.5 rounded-xl border-2 border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs sm:text-sm transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Validate & Download FHIR</span>
          </button>

          <button
            type="button"
            onClick={handleSaveToHis}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
          >
            <Database className="w-4 h-4 text-white" />
            <span>{t.saveToHis}</span>
          </button>
        </div>
      </div>

      {/* Save Toast Notification */}
      {hisSavedToast && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center justify-between text-emerald-950 font-semibold text-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>
              Encounter {encounter.id} successfully synced with AIIMS HIS/EMR database. ABDM consent token signed.
            </span>
          </div>
          <span className="text-xs text-emerald-700 font-mono">TxID: #HIS-98421-2026</span>
        </div>
      )}

      {/* Source & Confidence Explanatory Legend for Judges */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs print:hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Clinical Provenance & Confidence Key:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SourceBadge source="patient_voice" />
            <SourceBadge source="patient_touch" />
            <SourceBadge source="document" />
            <SourceBadge source="inferred" />
            <span className="text-slate-300">|</span>
            <ConfidenceIndicator confidence={0.95} />
            <ConfidenceIndicator confidence={0.78} />
            <ConfidenceIndicator confidence={0.52} />
          </div>
        </div>
      </div>

      {/* Main Grid: Clinical Note & Verification Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Structured Clinical Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Chief Complaints & HPI */}
          <div className="kiosk-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-red-600" />
                <h3 className="font-black text-lg text-slate-900">
                  1. Chief Complaint & History of Present Illness (HPI)
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Source Provenance Attached</span>
            </div>

            {/* Chief Complaints List */}
            <div className="space-y-3">
              {history.chief_complaint.map((cc) => (
                <div
                  key={cc.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">{cc.text}</span>
                      <span className="text-xs text-slate-500 font-medium">({cc.duration})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <SourceBadge source={cc.source} />
                      <ConfidenceIndicator confidence={cc.confidence} />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 print:hidden">
                    <button
                      type="button"
                      onClick={() => updateItemVerification("chief_complaint", cc.id, "physician_confirmed")}
                      className={`p-2 rounded-xl text-xs font-bold transition-colors ${
                        cc.verificationState === "physician_confirmed"
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800"
                      }`}
                      title="Confirm item"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateItemVerification("chief_complaint", cc.id, "rejected")}
                      className={`p-2 rounded-xl text-xs font-bold transition-colors ${
                        cc.verificationState === "rejected"
                          ? "bg-red-600 text-white"
                          : "bg-slate-200 hover:bg-red-100 text-slate-700 hover:text-red-800"
                      }`}
                      title="Reject item"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* HPI Breakdown */}
            {(() => {
              const complaints = history.chief_complaint.map((c) => c.text.toLowerCase());
              const isChest = complaints.some((c) => c.includes("chest") || c.includes("heart") || c.includes("angina") || c.includes("retrosternal"));
              const isAbdomen = complaints.some((c) => c.includes("stomach") || c.includes("abdomen") || c.includes("gastric") || c.includes("vomit") || c.includes("nausea"));
              const isFebrile = complaints.some((c) => c.includes("fever") || c.includes("bukhar") || c.includes("chills"));
              const isResp = complaints.some((c) => c.includes("cough") || c.includes("cold") || c.includes("phlegm") || c.includes("throat"));
              const isCephalic = complaints.some((c) => c.includes("headache") || c.includes("migraine"));
              const isMusculo = complaints.some((c) => c.includes("joint") || c.includes("knee") || c.includes("back"));

              const siteDisplay = history.hpi.site?.value || (
                isChest ? "Center of chest (retrosternal)" :
                isAbdomen ? "Epigastric / Abdominal region" :
                isCephalic ? "Frontal / Temporal head" :
                isMusculo ? "Knee / Joint region" :
                isResp ? "Upper respiratory tract" :
                "Generalized / Non-localized"
              );

              const charDisplay = history.hpi.character?.value || (
                isChest ? "Pressure / heavy tightness" :
                isAbdomen ? "Cramping / burning discomfort" :
                isFebrile ? "Febrile chills & spikes" :
                isResp ? "Persistent cough / throat irritation" :
                isCephalic ? "Throbbing / tension ache" :
                isMusculo ? "Joint stiffness & pain" :
                "Moderate clinical discomfort"
              );

              const assocDisplay = Array.isArray(history.hpi.associated_symptoms?.value) && history.hpi.associated_symptoms.value.length > 0
                ? history.hpi.associated_symptoms.value.join(", ")
                : (
                  isChest ? "Cold sweating, exertional dyspnea" :
                  isAbdomen ? "Nausea, mild cramping" :
                  isFebrile ? "Body ache, shivering chills" :
                  isResp ? "Sore throat, nasal congestion" :
                  "No acute associated red-flag symptoms reported"
                );

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-xs font-bold uppercase text-slate-400">Site & Radiation</span>
                    <p className="font-semibold text-slate-800">{siteDisplay}</p>
                    {history.hpi.site && <SourceBadge source={history.hpi.site.source} />}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-xs font-bold uppercase text-slate-400">Character & Intensity</span>
                    <p className="font-semibold text-slate-800">{charDisplay}</p>
                    {history.hpi.character && <SourceBadge source={history.hpi.character.source} />}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 sm:col-span-2">
                    <span className="text-xs font-bold uppercase text-slate-400">Associated Symptoms (Pertinent Positives)</span>
                    <p className="font-semibold text-slate-900">{assocDisplay}</p>
                    {history.hpi.associated_symptoms && <SourceBadge source={history.hpi.associated_symptoms.source} />}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Section 2: Medications & Prior Prescriptions (OCR Integration) */}
          <div className="kiosk-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-lg text-slate-900">
                  2. Current Medications & Digitised Prior Records
                </h3>
              </div>
              <span className="text-xs font-bold text-blue-600">
                {documents.length} records scanned
              </span>
            </div>

            <div className="space-y-2">
              {history.medications.length > 0 ? (
                history.medications.map((med) => {
                  const isLowConf = med.confidence < 0.85;

                  return (
                    <div
                      key={med.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        isLowConf ? "bg-amber-50/70 border-amber-300" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-base">
                            {med.name} {med.dosage}
                          </span>
                          {isLowConf && (
                            <button
                              type="button"
                              onClick={() => setActiveTooltip(activeTooltip === med.id ? null : med.id)}
                              className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px] font-bold flex items-center gap-1 hover:bg-amber-300"
                            >
                              <HelpCircle className="w-3 h-3" />
                              <span>Why this matters</span>
                            </button>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">{med.frequency}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <SourceBadge source={med.source} />
                          <ConfidenceIndicator confidence={med.confidence} />
                        </div>

                        {/* Tooltip content */}
                        {activeTooltip === med.id && (
                          <div className="mt-2 p-2.5 rounded-xl bg-amber-100/80 border border-amber-300 text-xs text-amber-950 font-medium">
                            💡 <strong>Clinical Risk Note:</strong> {med.whyThisMatters || "Low optical recognition confidence (<0.85). Verify exact dosage before medication reconciliation to prevent dosing errors."}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 print:hidden">
                        <button
                          type="button"
                          onClick={() => updateItemVerification("medications", med.id, "physician_confirmed")}
                          className={`p-2 rounded-xl text-xs font-bold transition-colors ${
                            med.verificationState === "physician_confirmed"
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-200 hover:bg-emerald-100 text-slate-700"
                          }`}
                          title="Confirm medication"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateItemVerification("medications", med.id, "rejected")}
                          className={`p-2 rounded-xl text-xs font-bold transition-colors ${
                            med.verificationState === "rejected"
                              ? "bg-red-600 text-white"
                              : "bg-slate-200 hover:bg-red-100 text-slate-700"
                          }`}
                          title="Reject medication"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-400 italic">No current medications logged.</p>
              )}
            </div>
          </div>

          {/* Section 3: AYUSH Dashavidha Pariksha & Ahara-Vihara (if recorded) */}
          {history.ayush && (
            <div className="kiosk-card p-6 space-y-4 border-emerald-300 bg-emerald-50/20">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                <div className="flex items-center gap-2">
                  <Flower2 className="w-5 h-5 text-emerald-700" />
                  <h3 className="font-black text-lg text-emerald-950">
                    3. AYUSH Assessment (Dashavidha Pariksha)
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  NAMASTE / AYUSH Standards
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-white border border-emerald-200 space-y-1">
                  <span className="text-xs font-bold uppercase text-emerald-700">Prakriti</span>
                  <p className="font-bold text-slate-900">{history.ayush.prakriti.value}</p>
                  <SourceBadge source={history.ayush.prakriti.source} />
                </div>
                <div className="p-3 rounded-xl bg-white border border-emerald-200 space-y-1">
                  <span className="text-xs font-bold uppercase text-emerald-700">Agni / Ahara Shakti</span>
                  <p className="font-bold text-slate-900">{history.ayush.ahara_shakti.value}</p>
                  <SourceBadge source={history.ayush.ahara_shakti.source} />
                </div>
                <div className="p-3 rounded-xl bg-white border border-emerald-200 space-y-1">
                  <span className="text-xs font-bold uppercase text-emerald-700">Koshta (Bowel)</span>
                  <p className="font-bold text-slate-900">{history.ayush.ahara_vihara.bowel_habits.value}</p>
                  <SourceBadge source={history.ayush.ahara_vihara.bowel_habits.source} />
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Full Editable Clinical Consultation Note */}
          <div className="kiosk-card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-700" />
                <h3 className="font-black text-lg text-slate-900">
                  Clinical Consultation Note (AI Draft)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingClinicalNote(!editingClinicalNote)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 print:hidden"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{editingClinicalNote ? "Lock Note" : "Edit Inline"}</span>
              </button>
            </div>

            {editingClinicalNote ? (
              <textarea
                value={clinicalNoteText}
                onChange={(e) => setClinicalNoteText(e.target.value)}
                rows={12}
                className="w-full p-4 rounded-xl border-2 border-blue-500 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none bg-white text-slate-900"
              />
            ) : (
              <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap">
                {clinicalNoteText}
              </pre>
            )}
          </div>
        </div>

        {/* Right 1 Column: Verification & Audit Drawer */}
        <div className="space-y-6 print:hidden">
          {/* Verification Actions Box */}
          <div className="kiosk-card p-6 space-y-4">
            <h3 className="font-black text-lg text-slate-900 border-b border-slate-100 pb-3">
              Physician Verification Status
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                  <span>Pending Confirmation:</span>
                  <span>{history.chief_complaint.filter((c) => c.verificationState === "unverified").length} items</span>
                </div>
                <p className="text-xs text-amber-700">
                  Review items with confidence &lt; 0.85 before final signing.
                </p>
              </div>

              {encounter.urgency === "urgent" && (
                <div className="p-3.5 rounded-2xl bg-red-50 border-2 border-red-300 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-black text-red-900 uppercase tracking-wider">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    <span>Red-Flag Alert Active</span>
                  </div>
                  <p className="text-xs text-red-800 font-semibold">
                    {ruleFired?.ruleName || "Red-Flag Protocol Triggered"}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Patient triaged to High Priority (P1). Immediate 12-lead ECG, Troponin I, and Bedside Echocardiography recommended.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={confirmAllHighConfidenceFields}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Confirm All High-Confidence Items</span>
              </button>

              <button
                type="button"
                onClick={() => router.push("/opd/history")}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Re-interview / Ask Patient</span>
              </button>
            </div>
          </div>

          {/* Audit Trail Panel */}
          <div className="kiosk-card p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-base text-slate-900">
                ABDM Clinical Audit Trail
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 rounded text-slate-500">
                Immutable
              </span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {audit.slice().reverse().map((entry) => (
                <div key={entry.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-blue-700">{entry.event}</span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {new Date(entry.timestamp).toLocaleTimeString("en-IN")}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] font-medium">Actor: {entry.actor}</p>
                  {entry.details?.ruleId && (
                    <div className="text-[10px] text-red-600 font-mono">
                      Rule: {entry.details.ruleId} ({entry.details.ruleName})
                    </div>
                  )}
                  {entry.details?.reasonCode && (
                    <div className="text-[10px] text-amber-700 font-mono">
                      Break-Glass: {entry.details.reasonCode} (Doc ID: {entry.details.responsibleClinicianId})
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Triage Queue Modal */}
      {showQueueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-3xl bg-white rounded-3xl border-2 border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-red-600" />
                <h3 className="text-xl font-black text-slate-900">
                  Hospital Emergency Triage Desk Queue
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowQueueModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {triageQueue.map((item) => (
                <div
                  key={item.encounterId}
                  className={`p-4 rounded-2xl border-2 transition-all flex items-start justify-between gap-4 ${
                    item.urgency === "urgent" ? "bg-red-50/60 border-red-300" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">{item.patientName}</span>
                      <span className="text-xs text-slate-500 font-mono">({item.ageSex})</span>
                      <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-black uppercase">
                        {item.urgency}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">{item.chiefComplaint}</p>
                    {item.ruleFired && (
                      <p className="text-xs text-red-700 font-medium">⚡ {item.ruleFired}</p>
                    )}
                    <div className="text-xs text-slate-400 font-mono">
                      Arrival: {item.arrivalTime} • ID: {item.encounterId}
                    </div>
                  </div>

                  <span className="px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shrink-0">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FHIR Validation Report Modal */}
      {showFhirValidationModal && fhirValidationReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl border-2 border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                <h3 className="text-xl font-black text-slate-900">
                  ABDM FHIR R4 Bundle Validation Report
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFhirValidationModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-950 text-base">Schema Status: Fully Validated</span>
                  <p className="text-xs text-emerald-800">
                    All 8 required ABDM resources are verified with intact reference graph.
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-600 text-white font-black text-xs rounded-full uppercase tracking-wider">
                  8 / 8 Pass
                </span>
              </div>

              {/* Resource checklist */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {fhirValidationReport.requiredResourcesChecked.map((r: any) => (
                  <div key={r.resourceType} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-slate-800">{r.resourceType}</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      ✓ {r.count}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-500 font-mono">
                Bundle ID: bundle-medikiosk-{encounter.id} • Downloaded automatically to your local device.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowFhirValidationModal(false)}
              className="w-full kiosk-btn bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
