"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  Clock,
  HeartPulse,
  Flame,
  Activity,
  Plus,
  Trash2,
  AlertTriangle,
  Flower2,
  CheckCircle2
} from "lucide-react";
import { useKioskStore } from "@/store/useKioskStore";
import { getTranslation } from "@/lib/i18n";
import { AudioPromptButton } from "@/components/common/AudioPromptButton";
import { VoiceInputButton } from "@/components/common/VoiceInputButton";
import { ProgressBar } from "@/components/common/ProgressBar";
import { RedFlagModal } from "@/components/common/RedFlagModal";
import { ChiefComplaintItem, ClinicalValue, RedFlagRule } from "@/types/kiosk";
import { evaluateRedFlagRules } from "@/lib/redflag-rules";

export default function HistoryPage() {
  const router = useRouter();
  const language = useKioskStore((state) => state.encounter.language);
  const encounterId = useKioskStore((state) => state.encounter.id);
  const history = useKioskStore((state) => state.history);
  const addChiefComplaint = useKioskStore((state) => state.addChiefComplaint);
  const removeChiefComplaint = useKioskStore((state) => state.removeChiefComplaint);
  const setHpiField = useKioskStore((state) => state.setHpiField);
  const addMedication = useKioskStore((state) => state.addMedication);
  const addAllergy = useKioskStore((state) => state.addAllergy);
  const setPastHistory = useKioskStore((state) => state.setPastHistory);
  const setEncounterUrgency = useKioskStore((state) => state.setEncounterUrgency);
  const callStaffAssist = useKioskStore((state) => state.callStaffAssist);

  const t = getTranslation(language);

  // Flow steps:
  // 0: Chief Complaints
  // 1: Branching HPI (Chest Pain / Fever / Stomach / Cough / Headache / Joint)
  // 2: Past History & Chronic Conditions
  // 3: Medications & Allergies
  const [stepIndex, setStepIndex] = useState(0);

  // Red flag modal state
  const [showRedFlagModal, setShowRedFlagModal] = useState(false);
  const [matchedRedFlagRule, setMatchedRedFlagRule] = useState<RedFlagRule | undefined>();
  const [redFlagReason, setRedFlagReason] = useState("");

  // Branching evaluation: strict and specific
  const selectedComplaints = history.chief_complaint.map((c) => c.text);

  const isChestPain = selectedComplaints.some((c) =>
    /chest|retrosternal|seena|chhati|heart|angina|நெஞ்சு/i.test(c)
  );
  const isAbdominal = selectedComplaints.some((c) =>
    /stomach|abdomen|abdominal|belly|pet|gastric|acidity|vomit|nausea|cramp|வயிறு/i.test(c)
  );
  const isRespiratory = selectedComplaints.some((c) =>
    /cough|cold|khansi|phlegm|sputum|throat|respiratory|இருமல்|சளி/i.test(c)
  );
  const isFever = selectedComplaints.some((c) =>
    /fever|bukhar|ताप|காய்ச்சல்|chills|shiver/i.test(c)
  );
  const isHeadache = selectedComplaints.some((c) =>
    /headache|head|sir dard|sar dard|migraine|தலைவலி/i.test(c)
  );
  const isJointPain = selectedComplaints.some((c) =>
    /joint|knee|back|kamar|spine|arthritis|जोड़ों|घुटने|மூட்டு/i.test(c)
  );

  // Calculate active clinical branch tabs
  interface BranchTab {
    id: string;
    label: string;
    icon: any;
  }
  const activeBranches: BranchTab[] = [];
  if (isChestPain) activeBranches.push({ id: "chest", label: "🫀 Chest Discomfort", icon: HeartPulse });
  if (isAbdominal) activeBranches.push({ id: "abdominal", label: "🤢 Stomach & Digestion", icon: Activity });
  if (isRespiratory) activeBranches.push({ id: "respiratory", label: "😷 Cough & Respiratory", icon: Activity });
  if (isFever) activeBranches.push({ id: "fever", label: "🌡️ Fever & Chills", icon: Flame });
  if (isHeadache) activeBranches.push({ id: "headache", label: "🧠 Headache & Neuro", icon: Activity });
  if (isJointPain) activeBranches.push({ id: "joint", label: "🦴 Joint & Spine", icon: Activity });
  if (activeBranches.length === 0) {
    activeBranches.push({ id: "general", label: "🩺 Clinical Characteristics", icon: Activity });
  }

  const [selectedBranchId, setSelectedBranchId] = useState<string>("");

  // Default to first active branch if not set or invalid
  const currentBranchId = activeBranches.some((b) => b.id === selectedBranchId)
    ? selectedBranchId
    : activeBranches[0]?.id || "general";

  // Step names for progress bar
  const progressSteps = [
    { id: "symptoms", label: t.progressSymptoms },
    { id: "hpi", label: t.progressHpi },
    { id: "past", label: t.progressPast },
    { id: "meds", label: t.progressMeds },
  ];

  // Helper to check red flag deterministically
  const checkRedFlagCriteria = (assocSymptoms: string[], neuroDeficits: string[] = []) => {
    const result = evaluateRedFlagRules(selectedComplaints, assocSymptoms, neuroDeficits);
    if (result.hasRedFlag && result.matchedRule) {
      setMatchedRedFlagRule(result.matchedRule);
      setRedFlagReason(result.triggerReason || "Red-Flag criteria triggered.");
      setShowRedFlagModal(true);
      setEncounterUrgency("urgent");
    }
  };

  const handleSelectComplaint = (complaintText: string, duration: string = "few hours") => {
    if (!selectedComplaints.includes(complaintText)) {
      addChiefComplaint({
        text: complaintText,
        duration: duration,
        severity: "moderate",
        source: "patient_touch",
        confidence: 0.96,
        verificationState: "patient_confirmed",
      });
    }
  };

  const handleVoiceTranscript = (questionKey: string, transcript: string, inferredValue?: any) => {
    if (questionKey === "chief_complaint") {
      const symptomsToAdd: string[] = Array.isArray(inferredValue)
        ? inferredValue
        : typeof inferredValue === "string" && inferredValue.length > 0
        ? [inferredValue]
        : [transcript];

      symptomsToAdd.forEach((symptomText) => {
        const cleanText = symptomText.trim();
        if (cleanText && !selectedComplaints.includes(cleanText)) {
          addChiefComplaint({
            text: cleanText,
            duration: "3 hours",
            severity: "moderate",
            source: "patient_voice",
            confidence: 0.95,
            verificationState: "patient_confirmed",
          });
        }
      });

      setHpiField("onset", {
        field: "onset",
        value: "Symptoms reported via clinical voice intake",
        source: "patient_voice",
        confidence: 0.93,
        verificationState: "patient_confirmed",
      });
    } else if (questionKey === "associated_symptoms") {
      const symptoms = Array.isArray(inferredValue) ? inferredValue : [transcript];
      setHpiField("associated_symptoms", {
        field: "associated_symptoms",
        value: symptoms,
        source: "patient_voice",
        confidence: 0.95,
        verificationState: "patient_confirmed",
      });
      checkRedFlagCriteria(symptoms);
    }
  };

  const handleNextStep = () => {
    if (stepIndex < 3) {
      setStepIndex(stepIndex + 1);
    } else {
      router.push("/opd/documents");
    }
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col justify-between">
      {/* Top Progress Tracker */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Step {stepIndex + 1} of 4 • {progressSteps[stepIndex].label}
          </span>
          <button
            type="button"
            onClick={() => callStaffAssist(`History Screen - ${progressSteps[stepIndex].label}`)}
            className="px-3.5 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>Call Staff Assist (सहायता)</span>
          </button>
        </div>
        <ProgressBar currentStepIndex={stepIndex} steps={progressSteps} />
      </div>

      {/* STEP 0: CHIEF COMPLAINTS */}
      {stepIndex === 0 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {t.chiefComplaintQuestion}
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                {t.chiefComplaintSub}
              </p>
            </div>
            <AudioPromptButton
              textToSpeak={`${t.chiefComplaintQuestion}. ${t.chiefComplaintSub}`}
              size="md"
            />
          </div>

          {/* Voice Input Card with Multi-Symptom Conclusion */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl border-2 border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Voice Assistive Intake (ASR)
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                Speak your symptoms in your native tongue
              </h3>
              <p className="text-sm text-slate-600">
                Speaks Hindi, Tamil, or Indian English. Multiple symptoms are automatically extracted and concluded.
              </p>
            </div>
            <VoiceInputButton
              questionKey="chief_complaint"
              onTranscriptComplete={(transcript, inferred) =>
                handleVoiceTranscript("chief_complaint", transcript, inferred)
              }
            />
          </div>

          {/* Quick-Select Common Symptoms Chips */}
          <div className="space-y-3">
            <label className="block text-sm font-bold uppercase tracking-wider text-slate-500">
              Or Tap Common Symptoms:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { key: "fever", label: t.chipFever, icon: Flame, color: "text-amber-600", bg: "hover:border-amber-400" },
                { key: "stomach", label: t.chipStomachPain, icon: Activity, color: "text-emerald-600", bg: "hover:border-emerald-400" },
                { key: "cough", label: t.chipCough, icon: Activity, color: "text-blue-600", bg: "hover:border-blue-400" },
                { key: "headache", label: t.chipHeadache, icon: Activity, color: "text-purple-600", bg: "hover:border-purple-400" },
                { key: "joint", label: t.chipJointPain, icon: Activity, color: "text-teal-600", bg: "hover:border-teal-400" },
                { key: "cp", label: t.chipChestPain, icon: HeartPulse, color: "text-red-600", bg: "hover:border-red-400" },
                { key: "breath", label: "Shortness of Breath", icon: Activity, color: "text-sky-600", bg: "hover:border-sky-400" },
                { key: "stroke", label: "Face Droop / Arm Weakness (Stroke Risk)", icon: AlertTriangle, color: "text-red-600", bg: "hover:border-red-500 bg-red-50/40" },
              ].map((chip) => {
                const isSelected = selectedComplaints.includes(chip.label);
                const Icon = chip.icon;
                return (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => {
                      handleSelectComplaint(chip.label);
                      if (chip.key === "stroke") {
                        checkRedFlagCriteria([], ["Face Droop", "Arm Weakness"]);
                      }
                    }}
                    className={`kiosk-card p-3.5 flex items-center gap-3 text-left transition-all ${chip.bg} ${
                      isSelected ? "border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-300" : "border-slate-200"
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${chip.color}`} />
                    <span className="font-bold text-sm text-slate-900 leading-snug">{chip.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Chief Complaints List */}
          {history.chief_complaint.length > 0 && (
            <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Recorded Chief Complaints ({history.chief_complaint.length}):
                </span>
                <span className="text-xs text-blue-600 font-bold">
                  Step 2 will adapt to each symptom below
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {history.chief_complaint.map((cc) => (
                  <div
                    key={cc.id}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-100 text-blue-900 font-semibold text-sm border border-blue-200 shadow-2xs"
                  >
                    <span>{cc.text}</span>
                    <button
                      type="button"
                      onClick={() => removeChiefComplaint(cc.id)}
                      className="p-1 hover:text-red-600 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Universal Bypass Options */}
          <div className="flex flex-wrap gap-3 pt-2 text-xs text-slate-500">
            <button
              type="button"
              onClick={() => handleSelectComplaint(t.dontKnow)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-medium"
            >
              {t.dontKnow}
            </button>
            <button
              type="button"
              onClick={() => handleSelectComplaint(t.notApplicable)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-medium"
            >
              {t.notApplicable}
            </button>
            <button
              type="button"
              onClick={() => handleSelectComplaint(t.preferNotToAnswer)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-medium"
            >
              {t.preferNotToAnswer}
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: DYNAMIC ADAPTIVE BRANCHING HPI */}
      {stepIndex === 1 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
                Adaptive Clinical Examination
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                {currentBranchId === "chest"
                  ? "Chest Discomfort Characteristics"
                  : currentBranchId === "abdominal"
                  ? "Abdominal & Digestive Inquiry"
                  : currentBranchId === "respiratory"
                  ? "Cough & Respiratory Evaluation"
                  : currentBranchId === "fever"
                  ? "Fever & Associated Patterns"
                  : currentBranchId === "headache"
                  ? "Headache & Neurological Patterns"
                  : currentBranchId === "joint"
                  ? "Joint & Musculoskeletal Symptoms"
                  : "Clinical Symptom Characteristics"}
              </h2>
            </div>
            <AudioPromptButton
              textToSpeak="Please describe the characteristics and duration of your symptoms."
              size="md"
            />
          </div>

          {/* Multi-Symptom Tabs (if patient has multiple symptoms) */}
          {activeBranches.length > 1 && (
            <div className="p-2 bg-slate-100 rounded-2xl flex flex-wrap gap-1.5 border border-slate-200">
              {activeBranches.map((branch) => {
                const isSelected = currentBranchId === branch.id;
                return (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => setSelectedBranchId(branch.id)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <span>{branch.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 1. CHEST PAIN BRANCH */}
          {currentBranchId === "chest" && (
            <div className="space-y-6 animate-in fade-in">
              {/* Site of Chest Pain */}
              <div className="kiosk-card space-y-3">
                <label className="block text-base font-bold text-slate-800">
                  {t.cpSiteQuestion}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: t.cpSiteCenter, val: "Center of chest (retrosternal)" },
                    { label: t.cpSiteLeft, val: "Radiating to left shoulder / arm" },
                    { label: t.cpSiteJaw, val: "Radiating to neck and jaw" },
                    { label: t.cpSiteBack, val: "Upper back between shoulder blades" },
                  ].map((s) => {
                    const isSelected = history.hpi.site?.value === s.val;
                    return (
                      <button
                        key={s.val}
                        type="button"
                        onClick={() =>
                          setHpiField("site", {
                            field: "site",
                            value: s.val,
                            source: "patient_touch",
                            confidence: 0.98,
                            verificationState: "patient_confirmed",
                          })
                        }
                        className={`p-4 rounded-2xl border-2 text-left font-bold transition-all ${
                          isSelected
                            ? "bg-blue-50 border-blue-600 text-blue-900 shadow-sm"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Character of Pain */}
              <div className="kiosk-card space-y-3">
                <label className="block text-base font-bold text-slate-800">
                  {t.cpCharacterQuestion}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: t.cpCharCrushing, val: "Crushing / squeezing / heavy weight" },
                    { label: t.cpCharSharp, val: "Sharp / stabbing" },
                    { label: t.cpCharBurning, val: "Burning / heartburn sensation" },
                  ].map((c) => {
                    const isSelected = history.hpi.character?.value === c.val;
                    return (
                      <button
                        key={c.val}
                        type="button"
                        onClick={() =>
                          setHpiField("character", {
                            field: "character",
                            value: c.val,
                            source: "patient_touch",
                            confidence: 0.95,
                            verificationState: "patient_confirmed",
                          })
                        }
                        className={`p-4 rounded-2xl border-2 text-left font-bold transition-all ${
                          isSelected
                            ? "bg-blue-50 border-blue-600 text-blue-900 shadow-sm"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Associated Symptoms & Red-Flag Triggers */}
              <div className="kiosk-card space-y-3 bg-red-50/40 border-red-200">
                <div className="flex items-center justify-between">
                  <label className="block text-base font-bold text-red-950 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    {t.cpAssociatedQuestion}
                  </label>
                  <VoiceInputButton
                    questionKey="associated_symptoms"
                    onTranscriptComplete={(transcript, inferred) =>
                      handleVoiceTranscript("associated_symptoms", transcript, inferred)
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: t.cpAssocBreathlessness, val: "Shortness of breath (Dyspnea)", red: true },
                    { label: t.cpAssocSweating, val: "Cold sweating / Diaphoresis", red: true },
                    { label: t.cpAssocNausea, val: "Nausea or vomiting", red: false },
                    { label: t.cpAssocDizziness, val: "Dizziness / feeling faint", red: false },
                  ].map((a) => {
                    const currentAssoc = (history.hpi.associated_symptoms?.value as string[]) || [];
                    const isSelected = currentAssoc.includes(a.val);

                    return (
                      <button
                        key={a.val}
                        type="button"
                        onClick={() => {
                          const updated = isSelected
                            ? currentAssoc.filter((item) => item !== a.val)
                            : [...currentAssoc, a.val];

                          setHpiField("associated_symptoms", {
                            field: "associated_symptoms",
                            value: updated,
                            source: "patient_touch",
                            confidence: 0.98,
                            verificationState: "patient_confirmed",
                          });

                          checkRedFlagCriteria(updated);
                        }}
                        className={`p-4 rounded-2xl border-2 text-left font-bold transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-red-600 border-red-600 text-white shadow-md"
                            : "bg-white border-red-200 text-red-950 hover:bg-red-50"
                        }`}
                      >
                        <span>{a.label}</span>
                        {a.red && (
                          <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-wider ${isSelected ? "bg-white text-red-700" : "bg-red-100 text-red-800"}`}>
                            Red-Flag
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 2. ABDOMINAL & STOMACH BRANCH */}
          {currentBranchId === "abdominal" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="kiosk-card space-y-3">
                <label className="block text-base font-bold text-slate-800">
                  Where is the abdominal discomfort located?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: "Upper Center (Epigastric / Acidity area)", val: "Upper center (Epigastrium)" },
                    { label: "Lower Abdomen / Pelvic region", val: "Lower abdomen / Pelvis" },
                    { label: "Around the Navel / Cramping everywhere", val: "Periumbilical / Diffuse cramps" },
                    { label: "Right Lower Side (Appendix area)", val: "Right iliac fossa / appendix" },
                  ].map((loc) => {
                    const isSelected = history.hpi.site?.value === loc.val;
                    return (
                      <button
                        key={loc.val}
                        type="button"
                        onClick={() =>
                          setHpiField("site", {
                            field: "site",
                            value: loc.val,
                            source: "patient_touch",
                            confidence: 0.96,
                            verificationState: "patient_confirmed",
                          })
                        }
                        className={`p-4 rounded-2xl border-2 text-left font-bold transition-all ${
                          isSelected
                            ? "bg-emerald-50 border-emerald-600 text-emerald-950 shadow-sm"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {loc.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="kiosk-card space-y-3">
                <label className="block text-base font-bold text-slate-800">
                  What does the pain feel like?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Burning / Acid Reflux / Indigestion", val: "Burning / Hyperacidity" },
                    { label: "Colicky / Sharp twisting cramps", val: "Colicky spasmodic cramps" },
                    { label: "Constant dull ache / Heavy fullness", val: "Dull aching fullness" },
                  ].map((char) => {
                    const isSelected = history.hpi.character?.value === char.val;
                    return (
                      <button
                        key={char.val}
                        type="button"
                        onClick={() =>
                          setHpiField("character", {
                            field: "character",
                            value: char.val,
                            source: "patient_touch",
                            confidence: 0.95,
                            verificationState: "patient_confirmed",
                          })
                        }
                        className={`p-4 rounded-2xl border-2 text-left font-bold transition-all ${
                          isSelected
                            ? "bg-emerald-50 border-emerald-600 text-emerald-950 shadow-sm"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {char.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="kiosk-card space-y-3">
                <label className="block text-base font-bold text-slate-800">
                  Associated Gastrointestinal Symptoms:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Nausea or vomiting",
                    "Loose stools / Diarrhea",
                    "Bloating & excessive gas",
                    "Loss of appetite",
                  ].map((sym) => {
                    const currentAssoc = (history.hpi.associated_symptoms?.value as string[]) || [];
                    const isSelected = currentAssoc.includes(sym);
                    return (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => {
                          const updated = isSelected
                            ? currentAssoc.filter((item) => item !== sym)
                            : [...currentAssoc, sym];
                          setHpiField("associated_symptoms", {
                            field: "associated_symptoms",
                            value: updated,
                            source: "patient_touch",
                            confidence: 0.96,
                            verificationState: "patient_confirmed",
                          });
                        }}
                        className={`p-4 rounded-2xl border-2 text-left font-bold transition-all ${
                          isSelected
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                            : "bg-white border-slate-200 text-slate-800 hover:border-slate-300"
                        }`}
                      >
                        {sym}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 3. RESPIRATORY & COUGH BRANCH */}
          {currentBranchId === "respiratory" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="kiosk-card space-y-3">
                <label className="block text-base font-bold text-slate-800">
                  What kind of cough are you experiencing?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Dry irritating / persistent cough", val: "Dry non-productive cough" },
                    { label: "Wet cough with thick phlegm/sputum", val: "Productive cough with phlegm" },
                    { label: "Wheezing / tight whistling breath", val: "Wheezing and chest tightness" },
                  ].map((ct) => {
                    const isSelected = history.hpi.character?.value === ct.val;
                    return (
                      <button
                        key={ct.val}
                        type="button"
                        onClick={() =>
                          setHpiField("character", {
                            field: "character",
                            value: ct.val,
                            source: "patient_touch",
                            confidence: 0.95,
                            verificationState: "patient_confirmed",
                          })
                        }
                        className={`p-4 rounded-2xl border-2 text-left font-bold transition-all ${
                          isSelected
                            ? "bg-blue-50 border-blue-600 text-blue-900 shadow-sm"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {ct.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="kiosk-card space-y-3">
                <label className="block text-base font-bold text-slate-800">
                  Associated Upper Respiratory Symptoms:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Sore throat & painful swallowing",
                    "Runny nose & sinus congestion",
                    "Mild fever & chills",
                    "Shortness of breath on walking",
                  ].map((sym) => {
                    const currentAssoc = (history.hpi.associated_symptoms?.value as string[]) || [];
                    const isSelected = currentAssoc.includes(sym);
                    return (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => {
                          const updated = isSelected
                            ? currentAssoc.filter((item) => item !== sym)
                            : [...currentAssoc, sym];
                          setHpiField("associated_symptoms", {
                            field: "associated_symptoms",
                            value: updated,
                            source: "patient_touch",
                            confidence: 0.95,
                            verificationState: "patient_confirmed",
                          });
                        }}
                        className={`p-4 rounded-2xl border-2 text-left font-bold transition-all ${
                          isSelected
                            ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                            : "bg-white border-slate-200 text-slate-800 hover:border-slate-300"
                        }`}
                      >
                        {sym}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 4. FEVER BRANCH */}
          {currentBranchId === "fever" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="kiosk-card space-y-3">
                <label className="block text-base font-bold text-slate-800">
                  {t.feverPatternQuestion}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: t.feverHighContinuous, val: "High continuous fever (>102°F)" },
                    { label: t.feverIntermittent, val: "Comes and goes with shivering/chills" },
                    { label: t.feverEveningRise, val: "Rises in the evening / night sweats" },
                  ].map((f) => {
                    const isSelected = history.hpi.fever_pattern?.value === f.val;
                    return (
                      <button
                        key={f.val}
                        type="button"
                        onClick={() =>
                          setHpiField("fever_pattern", {
                            field: "fever_pattern",
                            value: f.val,
                            source: "patient_touch",
                            confidence: 0.94,
                            verificationState: "patient_confirmed",
                          })
                        }
                        className={`p-4 rounded-2xl border-2 text-left font-bold transition-all ${
                          isSelected ? "bg-amber-50 border-amber-600 text-amber-950 shadow-sm" : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="kiosk-card space-y-3">
                <label className="block text-base font-bold text-slate-800">
                  Associated Symptoms with Fever:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Severe body ache & weakness",
                    "Intense chills and rigors",
                    "Throbbing frontal headache",
                    "Burning sensation while urinating",
                  ].map((sym) => {
                    const currentAssoc = (history.hpi.associated_symptoms?.value as string[]) || [];
                    const isSelected = currentAssoc.includes(sym);
                    return (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => {
                          const updated = isSelected
                            ? currentAssoc.filter((item) => item !== sym)
                            : [...currentAssoc, sym];
                          setHpiField("associated_symptoms", {
                            field: "associated_symptoms",
                            value: updated,
                            source: "patient_touch",
                            confidence: 0.95,
                            verificationState: "patient_confirmed",
                          });
                        }}
                        className={`p-4 rounded-2xl border-2 text-left font-bold transition-all ${
                          isSelected
                            ? "bg-amber-600 border-amber-600 text-white shadow-sm"
                            : "bg-white border-slate-200 text-slate-800 hover:border-slate-300"
                        }`}
                      >
                        {sym}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 5. HEADACHE BRANCH */}
          {currentBranchId === "headache" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="kiosk-card space-y-3">
                <label className="block text-base font-bold text-slate-800">
                  Describe your headache pattern:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Throbbing / Pulsating (One-sided / Migraine)", val: "Throbbing one-sided migraine" },
                    { label: "Tight band-like pressure across forehead", val: "Tension headache" },
                    { label: "Sudden explosive / severe thunderclap", val: "Sudden thunderclap headache" },
                  ].map((h) => {
                    const isSelected = history.hpi.character?.value === h.val;
                    return (
                      <button
                        key={h.val}
                        type="button"
                        onClick={() =>
                          setHpiField("character", {
                            field: "character",
                            value: h.val,
                            source: "patient_touch",
                            confidence: 0.95,
                            verificationState: "patient_confirmed",
                          })
                        }
                        className={`p-4 rounded-2xl border-2 text-left font-bold transition-all ${
                          isSelected
                            ? "bg-purple-50 border-purple-600 text-purple-950 shadow-sm"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {h.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="kiosk-card space-y-3">
                <label className="block text-base font-bold text-slate-800">
                  Associated Neurological &amp; Visual Symptoms:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Sensitivity to bright light & sound (Photophobia)",
                    "Nausea or vomiting",
                    "Neck stiffness & discomfort",
                    "Dizziness or visual blurring",
                  ].map((sym) => {
                    const currentAssoc = (history.hpi.associated_symptoms?.value as string[]) || [];
                    const isSelected = currentAssoc.includes(sym);
                    return (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => {
                          const updated = isSelected
                            ? currentAssoc.filter((item) => item !== sym)
                            : [...currentAssoc, sym];
                          setHpiField("associated_symptoms", {
                            field: "associated_symptoms",
                            value: updated,
                            source: "patient_touch",
                            confidence: 0.95,
                            verificationState: "patient_confirmed",
                          });
                        }}
                        className={`p-4 rounded-2xl border-2 text-left font-bold transition-all ${
                          isSelected
                            ? "bg-purple-600 border-purple-600 text-white shadow-sm"
                            : "bg-white border-slate-200 text-slate-800 hover:border-slate-300"
                        }`}
                      >
                        {sym}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 6. JOINT & MUSCULOSKELETAL BRANCH */}
          {currentBranchId === "joint" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="kiosk-card space-y-3">
                <label className="block text-base font-bold text-slate-800">
                  {t.jointLocationQuestion}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: t.jointKnee, val: "Knee joints (bilateral)" },
                    { label: t.jointLowerBack, val: "Lower back (Lumbar spine)" },
                    { label: t.jointSmall, val: "Small joints of fingers & wrists" },
                    { label: t.jointMorningStiffness, val: "Morning stiffness lasting >30 min" },
                  ].map((j) => {
                    const isSelected = history.hpi.joint_stiffness?.value === j.val;
                    return (
                      <button
                        key={j.val}
                        type="button"
                        onClick={() =>
                          setHpiField("joint_stiffness", {
                            field: "joint_stiffness",
                            value: j.val,
                            source: "patient_touch",
                            confidence: 0.95,
                            verificationState: "patient_confirmed",
                          })
                        }
                        className={`p-4 rounded-2xl border-2 text-left font-bold transition-all ${
                          isSelected ? "bg-teal-50 border-teal-600 text-teal-950 shadow-sm" : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {j.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 7. GENERAL CLINICAL CHARACTERISTICS (Fallback if no specialized branch) */}
          {currentBranchId === "general" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="kiosk-card space-y-3">
                <label className="block text-base font-bold text-slate-800">
                  How severe is the discomfort right now?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Mild (Noticeable but doesn't stop daily tasks)", val: "Mild" },
                    { label: "Moderate (Difficult to concentrate / work)", val: "Moderate" },
                    { label: "Severe (Cannot perform routine activities)", val: "Severe" },
                  ].map((sev) => {
                    const isSelected = history.hpi.character?.value === sev.val;
                    return (
                      <button
                        key={sev.val}
                        type="button"
                        onClick={() =>
                          setHpiField("character", {
                            field: "character",
                            value: sev.val,
                            source: "patient_touch",
                            confidence: 0.95,
                            verificationState: "patient_confirmed",
                          })
                        }
                        className={`p-4 rounded-2xl border-2 text-left font-bold transition-all ${
                          isSelected ? "bg-blue-50 border-blue-600 text-blue-900 shadow-sm" : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {sev.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: PAST MEDICAL HISTORY */}
      {stepIndex === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Do you have any existing chronic illnesses?
              </h2>
              <p className="text-slate-600 text-base">
                Tap all conditions you have been diagnosed with in the past.
              </p>
            </div>
            <AudioPromptButton
              textToSpeak="Do you have any existing chronic illnesses? Please select Diabetes, High Blood Pressure, Heart Disease, Asthma, or None."
              size="md"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              "Type 2 Diabetes Mellitus",
              "Systemic Hypertension (High BP)",
              "Heart Attack / Angina",
              "Asthma / Breathing issue",
              "Thyroid Disorder",
              "None / No Chronic Disease",
            ].map((cond) => {
              const currentList = (history.past_history.value as string[]) || [];
              const isSelected = currentList.includes(cond);

              return (
                <button
                  key={cond}
                  type="button"
                  onClick={() => {
                    const updated = isSelected
                      ? currentList.filter((c) => c !== cond)
                      : [...currentList, cond];
                    setPastHistory(updated);
                  }}
                  className={`kiosk-card p-4 text-left font-bold transition-all ${
                    isSelected
                      ? "bg-blue-50 border-blue-600 text-blue-900 shadow-md ring-2 ring-blue-300"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className="text-base">{cond}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: MEDICATIONS & ALLERGIES */}
      {stepIndex === 3 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Current Medications &amp; Drug Allergies
              </h2>
              <p className="text-slate-600 text-base">
                Select your regular medicines. In the next step, you can also scan past paper prescriptions.
              </p>
            </div>
            <AudioPromptButton
              textToSpeak="Current medications and drug allergies. Select your regular medicines or scan past paper records in the next step."
              size="md"
            />
          </div>

          <div className="space-y-4">
            <div className="kiosk-card space-y-3">
              <label className="block text-sm font-bold uppercase tracking-wider text-slate-600">
                Common Regular Medicines:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: "Metformin", dosage: "500 mg", freq: "Twice daily" },
                  { name: "Telmisartan", dosage: "40 mg", freq: "Once daily" },
                  { name: "Atorvastatin", dosage: "20 mg", freq: "Once daily night" },
                  { name: "Amlodipine", dosage: "5 mg", freq: "Once daily" },
                ].map((med) => {
                  const isPresent = history.medications.some((m) => m.name === med.name);
                  return (
                    <button
                      key={med.name}
                      type="button"
                      onClick={() => {
                        if (!isPresent) {
                          addMedication({
                            name: med.name,
                            dosage: med.dosage,
                            frequency: med.freq,
                            source: "patient_touch",
                            confidence: 0.95,
                            verificationState: "patient_confirmed",
                          });
                        }
                      }}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        isPresent
                          ? "bg-blue-50 border-blue-600 text-blue-900 shadow-sm"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="font-bold text-base">{med.name} {med.dosage}</div>
                      <div className="text-xs text-slate-500 font-medium">{med.freq}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drug Allergies */}
            <div className="kiosk-card space-y-3">
              <label className="block text-sm font-bold uppercase tracking-wider text-slate-600">
                Drug Allergies:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { allergen: "Penicillin", rxn: "Skin rash & swelling" },
                  { allergen: "Sulfa drugs", rxn: "Severe itching" },
                  { allergen: "No known drug allergies (NKDA)", rxn: "None" },
                ].map((alg) => {
                  const isPresent = history.allergies.some((a) => a.allergen === alg.allergen);
                  return (
                    <button
                      key={alg.allergen}
                      type="button"
                      onClick={() => {
                        if (!isPresent) {
                          addAllergy({
                            allergen: alg.allergen,
                            reaction: alg.rxn,
                            severity: "moderate",
                            source: "patient_touch",
                            confidence: 0.96,
                            verificationState: "patient_confirmed",
                          });
                        }
                      }}
                      className={`p-3.5 rounded-2xl border-2 text-left font-bold transition-all ${
                        isPresent ? "bg-red-50 border-red-500 text-red-900 shadow-sm" : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-sm">{alg.allergen}</div>
                      <div className="text-xs text-slate-500 font-normal">{alg.rxn}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-8 border-t border-slate-200 mt-6">
        <button
          type="button"
          onClick={() => {
            if (stepIndex > 0) setStepIndex(stepIndex - 1);
            else router.push("/opd/onboarding");
          }}
          className="kiosk-btn bg-slate-100 hover:bg-slate-200 text-slate-700"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t.back}</span>
        </button>

        <div className="flex items-center gap-3">
          {/* Quick link to AYUSH mode */}
          <button
            type="button"
            onClick={() => router.push("/opd/ayush")}
            className="hidden sm:flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-emerald-300 bg-emerald-50 text-emerald-800 font-bold text-sm hover:bg-emerald-100 transition-colors"
          >
            <Flower2 className="w-4 h-4 text-emerald-600" />
            <span>Ayurveda (AYUSH) Mode</span>
          </button>

          <button
            type="button"
            onClick={handleNextStep}
            className="kiosk-btn bg-blue-600 hover:bg-blue-700 text-white shadow-lg text-lg"
          >
            <span>{stepIndex === 3 ? "Scan Documents" : t.next}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Real-time Red Flag Triage Modal */}
      <RedFlagModal
        isOpen={showRedFlagModal}
        onClose={() => setShowRedFlagModal(false)}
        rule={matchedRedFlagRule}
        reason={redFlagReason}
      />
    </div>
  );
}
