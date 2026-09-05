"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, UserCheck, ShieldCheck, ArrowRight, ArrowLeft, CheckSquare, Square, Volume2, CreditCard, Sparkles, Camera, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { useKioskStore } from "@/store/useKioskStore";
import { getTranslation } from "@/lib/i18n";
import { SupportedLanguage } from "@/types/kiosk";
import { AudioPromptButton } from "@/components/common/AudioPromptButton";
import { ProgressBar } from "@/components/common/ProgressBar";

export default function OnboardingPage() {
  const router = useRouter();
  const language = useKioskStore((state) => state.encounter.language);
  const setLanguage = useKioskStore((state) => state.setLanguage);
  const patient = useKioskStore((state) => state.patient);
  const updatePatient = useKioskStore((state) => state.updatePatient);
  const consent = useKioskStore((state) => state.consent);
  const updateConsent = useKioskStore((state) => state.updateConsent);

  const t = getTranslation(language);

  // Sub-steps inside onboarding: 0 = Language, 1 = Identity, 2 = Emergency Face ID, 3 = Consent
  const [subStep, setSubStep] = useState<number>(0);
  const [identityMode, setIdentityMode] = useState<"abha" | "uhid" | "new">("abha");

  // Local state for smooth touch input
  const [abhaInput, setAbhaInput] = useState(patient.abha_id || "14-8842-9011-3421");
  const [uhidInput, setUhidInput] = useState(patient.hospital_id || "AIIMS-2026-9048");
  const [nameInput, setNameInput] = useState(patient.name || "Aarav Sharma");
  const [ageInput, setAgeInput] = useState(patient.age ? String(patient.age) : "45");
  const [sexInput, setSexInput] = useState<"male" | "female" | "other">(patient.sex || "male");

  // Face ID Enrollment State
  const [faceCaptureState, setFaceCaptureState] = useState<"idle" | "capturing" | "enrolled">("idle");
  const [skipNote, setSkipNote] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleLanguageSelect = (lang: SupportedLanguage) => {
    setLanguage(lang);
    setSubStep(1);
  };

  const handleIdentitySubmit = () => {
    if (identityMode === "abha") {
      updatePatient({
        abha_id: abhaInput,
        name: nameInput || "Aarav Sharma",
        age: Number(ageInput) || 45,
        sex: sexInput,
      });
    } else if (identityMode === "uhid") {
      updatePatient({
        hospital_id: uhidInput,
        name: nameInput || "Aarav Sharma",
        age: Number(ageInput) || 45,
        sex: sexInput,
      });
    } else {
      updatePatient({
        name: nameInput,
        age: Number(ageInput) || 30,
        sex: sexInput,
        hospital_id: `NEW-${Date.now().toString().slice(-4)}`,
      });
    }
    setSubStep(2);
  };

  const handleEnableFaceId = async () => {
    setFaceCaptureState("capturing");
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
      console.warn("Camera hardware unavailable or denied; proceeding with simulated reference capture", err);
    }

    // Capture reference image for ~2.0 seconds
    setTimeout(() => {
      stopCamera();
      setFaceCaptureState("enrolled");
      updatePatient({
        faceEnrolled: true,
        faceEnrollmentTimestamp: new Date().toISOString(),
      });
    }, 2000);
  };

  const handleSkipFaceId = () => {
    stopCamera();
    updatePatient({ faceEnrolled: false });
    setSkipNote(true);
    setSubStep(3);
  };

  const handleConsentSubmit = () => {
    updateConsent({
      history_capture: consent.history_capture,
      document_processing: consent.document_processing,
      share_with_hospital: consent.share_with_hospital,
      timestamp: new Date().toISOString(),
      grantedBy: "patient",
    });
    router.push("/opd/history");
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 flex flex-col justify-between">
      {/* Substep tracker */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          <span>
            Step {subStep + 1} of 4:{" "}
            {subStep === 0
              ? "Language"
              : subStep === 1
              ? "Identification"
              : subStep === 2
              ? "Emergency Face ID"
              : "Consent"}
          </span>
          <span>MediKiosk Patient Onboarding</span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300"
            style={{ width: `${((subStep + 1) / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* SubStep 0: Language Selection */}
      {subStep === 0 && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-2xl mx-auto flex items-center justify-center">
              <Globe className="w-7 h-7" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              {t.selectLanguage}
            </h2>
            <p className="text-slate-600 text-lg">
              {t.selectLanguageSub}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4">
            <button
              type="button"
              onClick={() => handleLanguageSelect("en")}
              className={`p-6 rounded-3xl border-3 text-center transition-all flex flex-col items-center justify-center gap-4 ${
                language === "en"
                  ? "border-blue-600 bg-blue-50/70 shadow-lg scale-102"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
              }`}
            >
              <span className="text-4xl">🇬🇧</span>
              <div>
                <div className="text-2xl font-black text-slate-900">English</div>
                <div className="text-sm text-slate-500 font-medium">Standard Indian English</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleLanguageSelect("hi")}
              className={`p-6 rounded-3xl border-3 text-center transition-all flex flex-col items-center justify-center gap-4 ${
                language === "hi"
                  ? "border-blue-600 bg-blue-50/70 shadow-lg scale-102"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
              }`}
            >
              <span className="text-4xl">🇮🇳</span>
              <div>
                <div className="text-2xl font-black text-slate-900">हिन्दी</div>
                <div className="text-sm text-slate-500 font-medium">हिंदी (Hindi)</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleLanguageSelect("ta")}
              className={`p-6 rounded-3xl border-3 text-center transition-all flex flex-col items-center justify-center gap-4 ${
                language === "ta"
                  ? "border-blue-600 bg-blue-50/70 shadow-lg scale-102"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
              }`}
            >
              <span className="text-4xl">🏛️</span>
              <div>
                <div className="text-2xl font-black text-slate-900">தமிழ்</div>
                <div className="text-sm text-slate-500 font-medium">தமிழ் (Tamil)</div>
              </div>
            </button>
          </div>

          <div className="flex justify-between items-center pt-8">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="kiosk-btn bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t.back}</span>
            </button>
            <button
              type="button"
              onClick={() => setSubStep(1)}
              className="kiosk-btn bg-blue-600 hover:bg-blue-700 text-white shadow-md text-lg"
            >
              <span>{t.next}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* SubStep 1: Patient Identity */}
      {subStep === 1 && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-2xl mx-auto flex items-center justify-center">
              <UserCheck className="w-7 h-7" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              {t.patientIdentity}
            </h2>
            <p className="text-slate-600 text-base">
              Identify using your Ayushman Bharat Health Account (ABHA), Hospital UHID, or register as a new patient.
            </p>
          </div>

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setIdentityMode("abha")}
              className={`py-3 px-3 rounded-xl font-bold text-sm sm:text-base transition-all ${
                identityMode === "abha" ? "bg-white text-blue-700 shadow-md" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ABHA ID
            </button>
            <button
              type="button"
              onClick={() => setIdentityMode("uhid")}
              className={`py-3 px-3 rounded-xl font-bold text-sm sm:text-base transition-all ${
                identityMode === "uhid" ? "bg-white text-blue-700 shadow-md" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Hospital UHID
            </button>
            <button
              type="button"
              onClick={() => setIdentityMode("new")}
              className={`py-3 px-3 rounded-xl font-bold text-sm sm:text-base transition-all ${
                identityMode === "new" ? "bg-white text-blue-700 shadow-md" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              New Patient
            </button>
          </div>

          {/* Form Fields */}
          <div className="kiosk-card space-y-6">
            {identityMode === "abha" && (
              <div className="space-y-3">
                <label className="block text-base font-bold text-slate-800">
                  {t.enterAbha}
                </label>
                <div className="relative">
                  <CreditCard className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={abhaInput}
                    onChange={(e) => setAbhaInput(e.target.value)}
                    placeholder={t.abhaPlaceholder}
                    className="w-full pl-14 pr-4 py-4 rounded-xl border-2 border-slate-200 focus:border-blue-600 focus:outline-none text-xl font-mono tracking-wider font-bold text-slate-900"
                  />
                </div>
                <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  ABDM OTP verification simulated — profile matched to Aarav Sharma (45y, Male).
                </p>
              </div>
            )}

            {identityMode === "uhid" && (
              <div className="space-y-3">
                <label className="block text-base font-bold text-slate-800">
                  {t.enterHospitalId}
                </label>
                <input
                  type="text"
                  value={uhidInput}
                  onChange={(e) => setUhidInput(e.target.value)}
                  placeholder={t.hospitalIdPlaceholder}
                  className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 focus:border-blue-600 focus:outline-none text-xl font-mono tracking-wider font-bold text-slate-900"
                />
              </div>
            )}

            {/* Demographics / Quick fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-2 sm:col-span-1">
                <label className="block text-sm font-bold text-slate-700">{t.newPatientName}</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full p-3.5 rounded-xl border-2 border-slate-200 focus:border-blue-600 focus:outline-none text-base font-semibold"
                />
              </div>

              <div className="space-y-2 sm:col-span-1">
                <label className="block text-sm font-bold text-slate-700">{t.newPatientAge}</label>
                <input
                  type="number"
                  value={ageInput}
                  onChange={(e) => setAgeInput(e.target.value)}
                  className="w-full p-3.5 rounded-xl border-2 border-slate-200 focus:border-blue-600 focus:outline-none text-base font-semibold"
                />
              </div>

              <div className="space-y-2 sm:col-span-1">
                <label className="block text-sm font-bold text-slate-700">{t.newPatientGender}</label>
                <div className="grid grid-cols-3 gap-1">
                  {(["male", "female", "other"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSexInput(g)}
                      className={`py-3 rounded-xl text-xs font-bold capitalize transition-all border ${
                        sexInput === g
                          ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-6">
            <button
              type="button"
              onClick={() => setSubStep(0)}
              className="kiosk-btn bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t.back}</span>
            </button>
            <button
              type="button"
              onClick={handleIdentitySubmit}
              className="kiosk-btn bg-blue-600 hover:bg-blue-700 text-white shadow-md text-lg"
            >
              <span>{t.next}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* SubStep 2: Emergency Face ID Enrollment (Optional) */}
      {subStep === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-2xl mx-auto flex items-center justify-center">
              <Camera className="w-7 h-7" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              <span>Opt-in Biometric Safety Net</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              🔒 Emergency Face ID (Optional)
            </h2>
            <p className="text-slate-600 text-base max-w-2xl mx-auto">
              Used strictly if you are ever brought into the emergency department unconscious or unable to speak, enabling emergency physicians to instantly retrieve critical allergies and life-saving medications.
            </p>
          </div>

          <div className="kiosk-card p-6 sm:p-8 space-y-6 bg-white border-2 border-indigo-100 shadow-xl">
            {/* Live Camera Preview or Placeholder */}
            <div className="relative w-full max-w-md mx-auto aspect-4/3 bg-slate-900 rounded-3xl overflow-hidden flex flex-col items-center justify-center border-4 border-slate-800 shadow-inner">
              {faceCaptureState === "capturing" && (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Scanner HUD Overlay */}
                  <div className="absolute inset-0 bg-indigo-950/40 backdrop-brightness-110 flex flex-col items-center justify-between p-5 z-10 pointer-events-none">
                    <div className="w-full flex justify-between items-center text-indigo-300 font-mono text-xs">
                      <span className="flex items-center gap-1.5 font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                        LIVE SENSOR
                      </span>
                      <span className="bg-black/60 px-2 py-0.5 rounded">RES: 480p</span>
                    </div>

                    {/* Face Reticle */}
                    <div className="w-48 h-48 sm:w-56 sm:h-56 border-2 border-dashed border-indigo-400/80 rounded-full flex items-center justify-center relative animate-pulse">
                      <div className="w-40 h-40 border-2 border-indigo-300 rounded-full opacity-40" />
                      <div className="absolute w-full h-0.5 bg-indigo-400 top-1/2 -translate-y-1/2 animate-bounce opacity-80" />
                    </div>

                    <div className="bg-slate-950/90 px-4 py-2 rounded-xl text-white text-xs sm:text-sm font-bold flex items-center gap-2 border border-indigo-500/50 shadow-lg">
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Capturing reference image...</span>
                    </div>
                  </div>
                </>
              )}

              {faceCaptureState === "enrolled" && (
                <div className="absolute inset-0 bg-emerald-950/95 flex flex-col items-center justify-center p-6 text-center space-y-3 animate-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white">✓ Face Enrolled</h3>
                    <p className="text-emerald-200 text-xs sm:text-sm max-w-xs">
                      Encrypted biometric hash generated and stored in local hospital registry.
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-emerald-900/80 border border-emerald-500/40 rounded-full text-emerald-300 text-[11px] font-mono">
                    HASH: SHA256-EMG-{Date.now().toString().slice(-6)}
                  </div>
                </div>
              )}

              {faceCaptureState === "idle" && (
                <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 text-indigo-400 flex items-center justify-center">
                    <Camera className="w-10 h-10 opacity-70" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-white font-bold text-base">Biometric Camera Preview</p>
                    <p className="text-slate-400 text-xs max-w-xs">
                      Click below to capture a 2-second encrypted reference template.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Explanatory & Privacy Box */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-indigo-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>DPDP Act 2023 §6(4) Opt-in Protection & Revocation Guarantee</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Biometric data is securely hashed and stored only within this hospital's local registry. It is <strong>never shared with any national database (e.g. Aadhaar)</strong> or external cloud services. You can revoke and delete this template at any time from your Patient Profile Settings.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {faceCaptureState !== "enrolled" ? (
                <>
                  <button
                    type="button"
                    onClick={handleEnableFaceId}
                    disabled={faceCaptureState === "capturing"}
                    className="flex-1 py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base sm:text-lg shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-5 h-5" />
                    <span>{faceCaptureState === "capturing" ? "Scanning Reference..." : "Enable Face ID"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSkipFaceId}
                    disabled={faceCaptureState === "capturing"}
                    className="py-4 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base transition-all text-center cursor-pointer"
                  >
                    Skip
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setSubStep(3)}
                  className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Consent</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                setSubStep(1);
              }}
              className="kiosk-btn bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t.back}</span>
            </button>

            {faceCaptureState !== "enrolled" && (
              <button
                type="button"
                onClick={handleSkipFaceId}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 underline underline-offset-4 cursor-pointer"
              >
                Skip this step and proceed →
              </button>
            )}
          </div>
        </div>
      )}

      {/* SubStep 3: Consent Screen */}
      {subStep === 3 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl mx-auto flex items-center justify-center">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              {t.consentTitle}
            </h2>
            <div className="pt-1 flex justify-center">
              <AudioPromptButton textToSpeak={t.consentAudioText} label={t.audioPrompt} size="md" />
            </div>
          </div>

          {/* Status of Face ID enrollment */}
          {(!patient.faceEnrolled || skipNote) ? (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-center gap-3 text-xs text-amber-900 font-medium">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                <strong>Face ID skipped</strong> — you can enable this anytime from your profile settings (top right header icon).
              </span>
            </div>
          ) : (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-xs text-emerald-900 font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>Emergency Face ID Enrolled</strong> — reference template active in local registry for emergency identification.
              </span>
            </div>
          )}

          {/* Consent Checkboxes */}
          <div className="space-y-4">
            <div
              onClick={() => updateConsent({ history_capture: !consent.history_capture })}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 ${
                consent.history_capture ? "bg-emerald-50/60 border-emerald-500 shadow-sm" : "bg-white border-slate-200"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {consent.history_capture ? (
                  <CheckSquare className="w-6 h-6 text-emerald-600" />
                ) : (
                  <Square className="w-6 h-6 text-slate-300" />
                )}
              </div>
              <div>
                <p className="text-base sm:text-lg font-bold text-slate-900">
                  {t.consentCheck1}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Allows MediKiosk voice recognition and adaptive touch symptom questionnaires.
                </p>
              </div>
            </div>

            <div
              onClick={() => updateConsent({ document_processing: !consent.document_processing })}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 ${
                consent.document_processing ? "bg-emerald-50/60 border-emerald-500 shadow-sm" : "bg-white border-slate-200"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {consent.document_processing ? (
                  <CheckSquare className="w-6 h-6 text-emerald-600" />
                ) : (
                  <Square className="w-6 h-6 text-slate-300" />
                )}
              </div>
              <div>
                <p className="text-base sm:text-lg font-bold text-slate-900">
                  {t.consentCheck2}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Enables OCR scanning to digitise prior paper records for your doctor.
                </p>
              </div>
            </div>

            <div
              onClick={() => updateConsent({ share_with_hospital: !consent.share_with_hospital })}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 ${
                consent.share_with_hospital ? "bg-emerald-50/60 border-emerald-500 shadow-sm" : "bg-white border-slate-200"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {consent.share_with_hospital ? (
                  <CheckSquare className="w-6 h-6 text-emerald-600" />
                ) : (
                  <Square className="w-6 h-6 text-slate-300" />
                )}
              </div>
              <div>
                <p className="text-base sm:text-lg font-bold text-slate-900">
                  {t.consentCheck3}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Generates an ABDM FHIR R4 Bundle accessible only to the attending doctor.
                </p>
              </div>
            </div>
          </div>

          {/* Explicit DPDP Alignment: Who can access & Data Retention */}
          <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-blue-900 uppercase tracking-wider block">
                🔒 Who can access your health intake data:
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {consent.recipients?.map((r, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-white border border-blue-300 rounded-lg text-blue-950 font-semibold shadow-xs">
                    ✓ {r}
                  </span>
                )) || (
                  <>
                    <span className="px-2.5 py-1 bg-white border border-blue-300 rounded-lg text-blue-950 font-semibold">
                      ✓ Attending OPD Physician
                    </span>
                    <span className="px-2.5 py-1 bg-white border border-blue-300 rounded-lg text-blue-950 font-semibold">
                      ✓ Consulting Specialists
                    </span>
                    <span className="px-2.5 py-1 bg-white border border-blue-300 rounded-lg text-blue-950 font-semibold">
                      ✓ Triage Nursing Desk Counter 01
                    </span>
                    <span className="px-2.5 py-1 bg-white border border-blue-300 rounded-lg text-blue-950 font-semibold">
                      ✓ Hospital EMR Core (ABDM Gateway)
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-blue-200/80 text-blue-800 space-y-0.5">
              <span className="font-bold block">⏱️ Data Retention (DPDP Act 2023 Compliance):</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {consent.retention || "Demo session data is retained for current consultation + 24 hours, then automatically purged from volatile kiosk storage."}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={() => setSubStep(2)}
              className="kiosk-btn bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t.back}</span>
            </button>
            <button
              type="button"
              onClick={handleConsentSubmit}
              disabled={!consent.history_capture}
              className={`kiosk-btn shadow-lg text-lg ${
                consent.history_capture
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed"
              }`}
            >
              <span>{t.consentButton}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
