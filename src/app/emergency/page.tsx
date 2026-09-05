"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  MapPin,
  User,
  HeartPulse,
  Activity,
  UserCheck,
  FileText,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Sparkles,
  Camera,
  Scan,
  XCircle,
  AlertCircle,
  RefreshCw,
  Zap,
  Phone,
  Pill,
  ShieldCheck
} from "lucide-react";
import { useKioskStore } from "@/store/useKioskStore";
import { getTranslation } from "@/lib/i18n";
import { EmergencyIntake } from "@/types/kiosk";
import { MOCK_HOSPITAL_FACE_REGISTRY, EnrolledPatient } from "@/lib/mock-registry";

export default function EmergencyPage() {
  const router = useRouter();
  const language = useKioskStore((state) => state.encounter.language);
  const setEmergencyIntake = useKioskStore((state) => state.setEmergencyIntake);
  const addAuditLog = useKioskStore((state) => state.addAuditLog);
  const updatePatient = useKioskStore((state) => state.updatePatient);

  const t = getTranslation(language);

  // Flow Step: "biometric_scan" -> "intake_form"
  const [emergencyStep, setEmergencyStep] = useState<"biometric_scan" | "intake_form">("biometric_scan");

  // Biometric Scan State
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "matched" | "no_match">("idle");
  const [matchedPatient, setMatchedPatient] = useState<EnrolledPatient | null>(null);
  const [matchConfidence, setMatchConfidence] = useState<number>(92);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Auto-generated temporary emergency ID
  const [emergencyId] = useState(() => `EMG-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [locationFound, setLocationFound] = useState("Ring Road Flyover near Gate 2");
  const [estimatedAge, setEstimatedAge] = useState(40);
  const [apparentSex, setApparentSex] = useState<"male" | "female" | "undetermined">("male");
  const [responsiveness, setResponsiveness] = useState<"alert" | "verbal" | "pain" | "unresponsive">("pain");
  const [breathingStatus, setBreathingStatus] = useState<"normal" | "distressed" | "absent" | "shallow">("distressed");
  const [visibleInjuries, setVisibleInjuries] = useState("Head laceration, blunt chest trauma, left arm deformity");
  const [bystanderName, setBystanderName] = useState("Constable Virender Singh (Delhi PCR #14)");
  const [bystanderContact, setBystanderContact] = useState("+91 98110 22334");

  const [activatedBy, setActivatedBy] = useState("Nurse Incharge Anita Roy (Staff ID: NS-9042)");
  const [reasonCode, setReasonCode] = useState<
    "UNCONSCIOUS_TRAUMA" | "ACUTE_CARDIAC_ARREST" | "ALTERED_MENTAL_STATUS_NO_SURROGATE" | "MASS_CASUALTY_TRIAGE"
  >("UNCONSCIOUS_TRAUMA");
  const [responsibleClinicianId, setResponsibleClinicianId] = useState("REG-DOC-2026-9048");
  const [responsibleClinicianName, setResponsibleClinicianName] = useState(
    "Dr. Vikramaditya Rathore (Emergency Medicine)"
  );
  const [consentBypassReason, setConsentBypassReason] = useState(
    "Patient incapacitated (AVPU: Pain only, GCS < 10); no legal surrogate available at time of acute trauma admission."
  );
  const [scheduledIdentityLinking] = useState(
    "Biometric & photo capture initiated; cross-referenced with national missing persons and ABHA registry at Triage Desk within 24 hours."
  );
  const [formError, setFormError] = useState<string | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startFaceScan = async (forcedResult?: "match" | "no_match") => {
    setScanStatus("scanning");
    try {
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 480, height: 480, facingMode: "user" },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }
    } catch (err) {
      console.warn("Camera hardware unavailable; running simulated sensor recognition", err);
    }

    // Simulate match processing delay ~2.5s
    setTimeout(() => {
      stopCamera();
      const isMatch = forcedResult
        ? forcedResult === "match"
        : Math.random() < 0.7; // ~70% match, ~30% no match

      if (isMatch) {
        const selected = MOCK_HOSPITAL_FACE_REGISTRY[0]; // Rameshwar Prasad Patel
        setMatchedPatient(selected);
        setMatchConfidence(Math.floor(selected.confidenceScore * 100));
        setScanStatus("matched");
        addAuditLog("BIOMETRIC_MATCH_FOUND", "Emergency Kiosk Face Gate #1", {
          patientId: selected.id,
          patientName: selected.name,
          confidence: selected.confidenceScore,
        });
      } else {
        setMatchedPatient(null);
        setScanStatus("no_match");
        addAuditLog("BIOMETRIC_NO_MATCH", "Emergency Kiosk Face Gate #1", {
          searchSpace: MOCK_HOSPITAL_FACE_REGISTRY.length,
          reason: "No hash template similarity > 80% threshold",
        });
      }
    }, 2500);
  };

  const handleApplyMatchedPatient = () => {
    if (matchedPatient) {
      updatePatient({
        name: matchedPatient.name,
        age: matchedPatient.age,
        sex: matchedPatient.sex,
        abha_id: matchedPatient.abha_id,
        hospital_id: matchedPatient.id,
        phone: matchedPatient.phone,
        faceEnrolled: true,
      });
      setEstimatedAge(matchedPatient.age);
      setApparentSex(matchedPatient.sex === "other" ? "undetermined" : matchedPatient.sex);
      setBystanderName(matchedPatient.emergencyContact.split(" - ")[0] || "Registered Emergency Contact");
      setBystanderContact(matchedPatient.emergencyContact.split(" - ")[1] || matchedPatient.phone);
    }
    setEmergencyStep("intake_form");
  };

  const handleSkipFaceScan = () => {
    stopCamera();
    setScanStatus("idle");
    setMatchedPatient(null);
    setEmergencyStep("intake_form");
  };

  const handleSubmitEmergency = (e: React.FormEvent) => {
    e.preventDefault();

    if (!responsibleClinicianId.trim()) {
      setFormError("Responsible Clinician Registration ID is mandatory for legal Break-Glass activation.");
      return;
    }
    if (!activatedBy.trim()) {
      setFormError("Staff ID of the activating clinical nurse/officer is mandatory.");
      return;
    }

    setFormError(null);

    const emergencyData: EmergencyIntake = {
      emergencyId,
      arrivalTime: new Date().toISOString(),
      locationFound,
      estimatedAge,
      apparentSex,
      responsiveness,
      breathingStatus,
      visibleInjuries,
      emergencyIndicators: [
        "Altered Mental Status (AVPU: " + responsiveness.toUpperCase() + ")",
        "Breathing: " + breathingStatus.toUpperCase(),
        "Blunt Trauma / Acute Injuries",
      ],
      accompanyingPerson: {
        name: bystanderName,
        relationship: matchedPatient ? "Registered Family Emergency Contact" : "PCR Bystander",
        contactNumber: bystanderContact,
      },
      biometricMatch: matchedPatient
        ? {
            matched: true,
            patientId: matchedPatient.id,
            patientName: matchedPatient.name,
            confidenceScore: matchConfidence / 100,
            allergies: matchedPatient.allergies,
            chronicConditions: matchedPatient.chronicConditions,
          }
        : {
            matched: false,
          },
      breakGlassAudit: {
        reasonCode,
        activatedBy,
        responsibleClinicianId,
        responsibleClinicianName,
        justification:
          "Acute life-threatening presentation requiring immediate emergency resuscitation (DPDP Act 2023 §7(d) Exemption).",
        consentBypassReason,
        scheduledIdentityLinking,
      },
    };

    setEmergencyIntake(emergencyData);
    addAuditLog("EMERGENCY_ACTIVATED", activatedBy, {
      emergencyId,
      reasonCode,
      responsibleClinicianId,
      responsibleClinicianName,
      responsiveness,
      breathingStatus,
      bypassReason: consentBypassReason,
      biometricMatched: !!matchedPatient,
    });

    router.push(`/doctor/summary/${emergencyId}`);
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Emergency Header Warning */}
      <div className="bg-red-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-2xl animate-bounce">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <div>
            <span className="px-3 py-0.5 rounded-full bg-white text-red-700 text-xs font-black uppercase tracking-wider">
              Legal Break-Glass Override
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight mt-1">
              {t.emergencyKioskTitle}
            </h1>
          </div>
        </div>
        <p className="text-red-100 text-sm sm:text-base leading-relaxed">
          {t.emergencyWarning}
        </p>
      </div>

      {/* STEP 1: Opt-in Facial Match */}
      {emergencyStep === "biometric_scan" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="kiosk-card p-6 sm:p-8 space-y-6 bg-white border-2 border-slate-200 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 text-indigo-700 rounded-2xl shrink-0">
                  <Scan className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    Opt-in Facial Match
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Rapid biometric identification for incapacitated or unconscious emergency patients.
                  </p>
                </div>
              </div>

              {/* Mandatory Privacy Boundary Notice */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold shadow-xs">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Opt-in local hospital registry only. Not a national or Aadhaar database lookup.</span>
              </div>
            </div>

            {/* Camera / HUD Scanner Area */}
            <div className="relative w-full max-w-lg mx-auto aspect-4/3 bg-slate-950 rounded-3xl overflow-hidden flex flex-col items-center justify-center border-4 border-slate-800 shadow-2xl">
              {scanStatus === "scanning" && (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* High-tech scanning overlay */}
                  <div className="absolute inset-0 bg-indigo-950/40 backdrop-brightness-110 flex flex-col items-center justify-between p-5 z-10 pointer-events-none">
                    <div className="w-full flex justify-between items-center text-indigo-300 font-mono text-xs">
                      <span className="flex items-center gap-1.5 font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                        FACIAL SCANNER ENGAGED
                      </span>
                      <span className="bg-black/60 px-2 py-0.5 rounded">LOCAL REGISTRY v2.4</span>
                    </div>

                    {/* Scanning Reticle & Radar Line */}
                    <div className="relative w-56 h-56 border-2 border-indigo-400/70 rounded-3xl flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce top-1/2 -translate-y-1/2" />
                      <div className="w-44 h-44 border border-dashed border-indigo-300/60 rounded-full animate-spin" />
                      <div className="absolute text-[10px] font-mono text-indigo-200 bg-black/60 px-2 py-0.5 rounded bottom-2">
                        MATCHING ENCRYPTED HASHES...
                      </div>
                    </div>

                    <div className="bg-slate-950/90 px-5 py-2.5 rounded-xl text-white text-sm font-bold flex items-center gap-2.5 border border-indigo-500/50 shadow-lg">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="tracking-wide">Scanning against hospital registry...</span>
                    </div>
                  </div>
                </>
              )}

              {scanStatus === "matched" && matchedPatient && (
                <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center space-y-3 animate-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-black uppercase tracking-wider">
                      ✓ {matchConfidence}% Match Confidence
                    </span>
                    <h3 className="text-2xl font-black text-white">{matchedPatient.name}</h3>
                    <p className="text-slate-300 font-mono text-xs">
                      UHID: {matchedPatient.id} • ABHA: {matchedPatient.masked_abha}
                    </p>
                  </div>
                  <div className="px-3.5 py-1 bg-slate-800 rounded-lg text-emerald-400 text-xs font-mono border border-slate-700">
                    Biometric Hash Matched: Registry Entry #{matchedPatient.id}
                  </div>
                </div>
              )}

              {scanStatus === "no_match" && (
                <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center space-y-3 animate-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/40">
                    <XCircle className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white">No match found in registry</h3>
                    <p className="text-slate-400 text-xs sm:text-sm max-w-xs">
                      No matching opt-in biometric reference found in the hospital local database.
                    </p>
                  </div>
                  <span className="text-[11px] text-amber-300 bg-amber-950/60 border border-amber-600/40 px-3 py-1 rounded-full">
                    Protocol: Fallback to Temporary Record (EMG-...)
                  </span>
                </div>
              )}

              {scanStatus === "idle" && (
                <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-20 h-20 rounded-3xl bg-slate-900 border-2 border-slate-800 text-indigo-400 flex items-center justify-center shadow-inner">
                    <Camera className="w-10 h-10 opacity-80" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-white font-black text-lg">Hospital Biometric Registry Search</p>
                    <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
                      Captures live camera feed and compares against opt-in facial templates of registered patients.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Matched Details Panel */}
            {scanStatus === "matched" && matchedPatient && (
              <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2.5">
                  <div className="flex items-center gap-2 text-emerald-950 font-black text-base">
                    <UserCheck className="w-5 h-5 text-emerald-700" />
                    <span>Matched Patient Clinical Profile</span>
                  </div>
                  <span className="px-3 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-black font-mono">
                    {matchConfidence}% MATCH
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-1">
                    <span className="text-slate-500 font-bold block">Patient Demographics</span>
                    <p className="text-slate-900 font-black text-sm">
                      {matchedPatient.name} ({matchedPatient.age}y, {matchedPatient.sex.toUpperCase()})
                    </p>
                    <p className="font-mono text-slate-600 text-[11px]">
                      ABHA: {matchedPatient.abha_id}
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-1">
                    <span className="text-slate-500 font-bold block flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-700" />
                      Emergency Contact on File
                    </span>
                    <p className="text-slate-900 font-bold text-sm">
                      {matchedPatient.emergencyContact}
                    </p>
                  </div>

                  {/* Critical Allergies Warning */}
                  <div className="p-3 bg-red-50 rounded-xl border border-red-200 sm:col-span-2 space-y-1">
                    <span className="text-red-800 font-black flex items-center gap-1.5 text-xs">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      CRITICAL ALLERGIES / CONTRAINDICATIONS ON RECORD:
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {matchedPatient.allergies.map((allg, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-red-600 text-white rounded-lg font-bold text-xs shadow-xs">
                          ⚠️ {allg}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Chronic Conditions & Medications */}
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 sm:col-span-2 space-y-1">
                    <span className="text-slate-500 font-bold block flex items-center gap-1">
                      <Pill className="w-3.5 h-3.5 text-indigo-600" />
                      Known Chronic Conditions &amp; Active Medications
                    </span>
                    <p className="text-slate-800 font-semibold text-xs">
                      <strong>Conditions:</strong> {matchedPatient.chronicConditions.join(", ")}
                    </p>
                    <p className="text-slate-600 text-xs font-mono">
                      <strong>Medications:</strong> {matchedPatient.medications.join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Scan Controls / Action Buttons */}
            <div className="space-y-3 pt-2">
              {scanStatus === "idle" && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => startFaceScan()}
                    className="flex-1 py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <Scan className="w-6 h-6" />
                    <span>Start Face Match</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSkipFaceScan}
                    className="py-4 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base transition-all text-center cursor-pointer"
                  >
                    Skip to Temporary Record (EMG-...)
                  </button>
                </div>
              )}

              {scanStatus === "matched" && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleApplyMatchedPatient}
                    className="flex-1 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base sm:text-lg shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                    <span>Proceed with Matched Profile to Break-Glass Authorization →</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => startFaceScan()}
                    className="py-4 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Re-scan</span>
                  </button>
                </div>
              )}

              {scanStatus === "no_match" && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleSkipFaceScan}
                    className="flex-1 py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-base sm:text-lg shadow-lg hover:shadow-red-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Create Temporary Emergency Record (EMG-...) →</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => startFaceScan()}
                    className="py-4 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retry Scan</span>
                  </button>
                </div>
              )}

              {/* Hackathon Demo Shortcuts */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span className="font-bold flex items-center gap-1 text-slate-600">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Hackathon Live Demo Testing:
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startFaceScan("match")}
                    className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[11px] transition-all cursor-pointer"
                  >
                    ⚡ Force 92% Match (Rameshwar Patel)
                  </button>
                  <button
                    type="button"
                    onClick={() => startFaceScan("no_match")}
                    className="px-3 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 border border-red-300 font-bold text-[11px] transition-all cursor-pointer"
                  >
                    ⚡ Force No Match (Unidentified)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Full Emergency Intake & Legal Break-Glass Authorization Form */}
      {emergencyStep === "intake_form" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Identity Status Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              {matchedPatient ? (
                <>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-base">{matchedPatient.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                        ✓ Biometric Matched ({matchConfidence}%)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono">
                      UHID: {matchedPatient.id} • ABHA: {matchedPatient.masked_abha}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-base">Unidentified Patient</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase">
                        Temporary Record Assigned
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono">
                      Tracking ID: {emergencyId}
                    </p>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setScanStatus("idle");
                setEmergencyStep("biometric_scan");
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-run Facial Scan</span>
            </button>
          </div>

          <form onSubmit={handleSubmitEmergency} className="space-y-6">
            {/* Rapid Identification & Vital Status */}
            <div className="kiosk-card p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-xl font-black text-slate-900">
                  Rapid Patient &amp; Triage Profile
                </h2>
                <span className="font-mono text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                  {matchedPatient ? matchedPatient.id : emergencyId}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    {matchedPatient ? "Patient Age" : "Estimated Age"}
                  </label>
                  <input
                    type="number"
                    value={estimatedAge}
                    onChange={(e) => setEstimatedAge(Number(e.target.value))}
                    className="w-full p-3.5 rounded-xl border-2 border-slate-200 focus:border-red-500 focus:outline-none text-base font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    {matchedPatient ? "Sex on Record" : "Apparent Sex"}
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(["male", "female", "undetermined"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setApparentSex(s)}
                        className={`py-3 rounded-xl text-xs font-bold capitalize transition-all border ${
                          apparentSex === s
                            ? "bg-red-600 border-red-600 text-white shadow-sm"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {s === "undetermined" ? "Unclear" : s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Location Found / Brought From
                  </label>
                  <input
                    type="text"
                    value={locationFound}
                    onChange={(e) => setLocationFound(e.target.value)}
                    className="w-full p-3.5 rounded-xl border-2 border-slate-200 focus:border-red-500 focus:outline-none text-sm font-semibold"
                  />
                </div>
              </div>

              {/* AVPU Scale */}
              <div className="space-y-3 pt-2">
                <label className="block text-base font-bold text-slate-900">
                  {t.consciousnessLevel}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {[
                    { val: "alert", label: t.avpuAlert, bg: "hover:border-blue-400" },
                    { val: "verbal", label: t.avpuVerbal, bg: "hover:border-amber-400" },
                    { val: "pain", label: t.avpuPain, bg: "hover:border-red-400" },
                    { val: "unresponsive", label: t.avpuUnresponsive, bg: "hover:border-red-600" },
                  ].map((avpu) => {
                    const isSelected = responsiveness === avpu.val;
                    return (
                      <button
                        key={avpu.val}
                        type="button"
                        onClick={() => setResponsiveness(avpu.val as any)}
                        className={`p-4 rounded-2xl border-2 text-left font-bold transition-all ${
                          isSelected
                            ? "bg-red-600 border-red-600 text-white shadow-md"
                            : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-sm sm:text-base">{avpu.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Breathing & Airway */}
              <div className="space-y-3 pt-2">
                <label className="block text-base font-bold text-slate-900">
                  {t.breathingEvaluation}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { val: "normal", label: "Normal / Unlaboured" },
                    { val: "distressed", label: "Severe Respiratory Distress" },
                    { val: "shallow", label: "Shallow / Gasping" },
                    { val: "absent", label: "Absent (Apnea)" },
                  ].map((b) => (
                    <button
                      key={b.val}
                      type="button"
                      onClick={() => setBreathingStatus(b.val as any)}
                      className={`p-3.5 rounded-2xl border-2 text-left font-bold transition-all ${
                        breathingStatus === b.val
                          ? "bg-slate-900 border-slate-900 text-white shadow-md"
                          : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-xs sm:text-sm">{b.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Visible injuries */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t.injuriesObserved}
                </label>
                <textarea
                  rows={2}
                  value={visibleInjuries}
                  onChange={(e) => setVisibleInjuries(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-red-500 focus:outline-none text-sm font-semibold"
                />
              </div>
            </div>

            {/* Accompanying Person / Bystander Info */}
            <div className="kiosk-card p-6 sm:p-8 space-y-4">
              <h2 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-3">
                {matchedPatient ? "Emergency Contact / Bystander Information" : t.accompanyingPerson}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    {matchedPatient ? "Contact / Relation Name" : "Bystander / Police / EMS Officer Name"}
                  </label>
                  <input
                    type="text"
                    value={bystanderName}
                    onChange={(e) => setBystanderName(e.target.value)}
                    className="w-full p-3.5 rounded-xl border-2 border-slate-200 focus:border-red-500 focus:outline-none text-sm font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={bystanderContact}
                    onChange={(e) => setBystanderContact(e.target.value)}
                    className="w-full p-3.5 rounded-xl border-2 border-slate-200 focus:border-red-500 focus:outline-none text-sm font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Break-Glass Audit Trail Details */}
            <div className="kiosk-card p-6 sm:p-8 space-y-4 bg-slate-900 text-white">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-400" />
                  <h2 className="text-xl font-black text-white">
                    Break-Glass Legal Audit Credentials
                  </h2>
                </div>
                <span className="px-2.5 py-1 bg-red-900/60 border border-red-500/50 rounded-full text-red-300 text-[10px] font-black uppercase tracking-wider">
                  Statutory Exemption §7(d)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Reason Code Dropdown */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block font-bold text-slate-300">
                    Mandatory Emergency Reason Code: <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={reasonCode}
                    onChange={(e) => setReasonCode(e.target.value as any)}
                    className="w-full p-3 rounded-xl bg-slate-800 border-2 border-slate-700 text-white font-semibold text-xs sm:text-sm focus:border-red-500 focus:outline-none"
                  >
                    <option value="UNCONSCIOUS_TRAUMA">
                      UNCONSCIOUS_TRAUMA: Unconscious Acute Trauma / Road Traffic Accident
                    </option>
                    <option value="ACUTE_CARDIAC_ARREST">
                      ACUTE_CARDIAC_ARREST: Acute Cardiac Arrest / In-Transit CPR
                    </option>
                    <option value="ALTERED_MENTAL_STATUS_NO_SURROGATE">
                      ALTERED_MENTAL_STATUS_NO_SURROGATE: Altered Mental Status (GCS &lt; 10) with No Legally Authorized Surrogate
                    </option>
                    <option value="MASS_CASUALTY_TRIAGE">
                      MASS_CASUALTY_TRIAGE: Mass Casualty / Disaster Emergency Triage
                    </option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-400">
                    Activating Clinical Staff ID: <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={activatedBy}
                    onChange={(e) => setActivatedBy(e.target.value)}
                    placeholder="e.g. Nurse Incharge Anita Roy (Staff ID: NS-9042)"
                    className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-400">
                    Responsible Clinician Registration ID (MCI/NMC): <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={responsibleClinicianId}
                    onChange={(e) => setResponsibleClinicianId(e.target.value)}
                    placeholder="e.g. REG-DOC-2026-9048 or MCI-88492"
                    className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-semibold text-amber-300 font-mono"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block font-bold text-slate-400">
                    Responsible Attending Clinician Name &amp; Dept:
                  </label>
                  <input
                    type="text"
                    value={responsibleClinicianName}
                    onChange={(e) => setResponsibleClinicianName(e.target.value)}
                    placeholder="e.g. Dr. Vikramaditya Rathore, MS (Emergency Medicine)"
                    className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-semibold"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block font-bold text-slate-400">
                    {t.breakGlassJustification} (DPDP Act 2023 §7(d) Exemption):
                  </label>
                  <textarea
                    rows={2}
                    value={consentBypassReason}
                    onChange={(e) => setConsentBypassReason(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Next Steps: 24-Hour Identity Linkage Protocol */}
            <div className="kiosk-card p-6 sm:p-8 space-y-4 bg-amber-50 border-2 border-amber-300">
              <div className="flex items-center gap-2.5 border-b border-amber-200 pb-3">
                <div className="p-2 bg-amber-500 text-white rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200 px-2 py-0.5 rounded">
                    Statutory SOP Protocol
                  </span>
                  <h2 className="text-lg font-black text-amber-950 mt-0.5">
                    Next Steps: 24-Hour Identity Linkage Protocol
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-white p-4 rounded-2xl border border-amber-200 space-y-1.5 shadow-xs">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-black">1</span>
                    <span>{matchedPatient ? "UHID Matched" : "Temporary ID Assigned"}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {matchedPatient ? (
                      <>Patient verified as <strong className="text-emerald-800">{matchedPatient.name}</strong> ({matchedPatient.id}). Encounter indexed with known chronic history.</>
                    ) : (
                      <>Patient indexed under temporary ID <code className="font-mono font-bold text-red-700">{emergencyId}</code>. Clinical orders and OT bookings link directly to this encounter.</>
                    )}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-amber-200 space-y-1.5 shadow-xs">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-black">2</span>
                    <span>24-Hour Biometric Linkage</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Hospital Medical Records Department (MRD) validates biometric references and cross-references missing persons &amp; ABHA databases within the statutory 24-hour window.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-amber-200 space-y-1.5 shadow-xs">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-black">3</span>
                    <span>DPDP Act 2023 §7(d) Protection</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Consent requirement is legally bypassed under Section 7(d) of DPDP Act 2023 for acute medical emergencies. Clinician ID <code className="font-mono text-slate-800 font-bold">{responsibleClinicianId}</code> is permanently logged.
                  </p>
                </div>
              </div>
            </div>

            {/* Validation Error Banner */}
            {formError && (
              <div className="p-4 bg-red-100 border-2 border-red-400 rounded-2xl text-red-900 font-bold text-sm flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={() => setEmergencyStep("biometric_scan")}
                className="kiosk-btn bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Face Match</span>
              </button>

              <button
                type="submit"
                className="kiosk-btn bg-red-600 hover:bg-red-700 text-white shadow-2xl text-xl font-black cursor-pointer"
              >
                <span>{t.confirmEmergencySubmit}</span>
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
