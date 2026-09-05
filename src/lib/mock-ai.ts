import { ExtractedDocumentField, SupportedLanguage, ClinicalHistory, PatientInfo } from "@/types/kiosk";

/**
 * Deterministic ASR responses simulating natural Indian clinical intake speech
 */
export const cannedAsrResponses: Record<string, Record<SupportedLanguage, { text: string; inferredValue: any }>> = {
  chief_complaint: {
    en: {
      text: "I am having severe heavy pressure in my chest since morning and also feeling some nausea.",
      inferredValue: "Chest Pain / Heavy Pressure",
    },
    hi: {
      text: "मुझे आज सुबह से छाती में तेज भारीपन और दर्द हो रहा है और बेचैनी लग रही है।",
      inferredValue: "छाती में दर्द या भारीपन",
    },
    ta: {
      text: "இன்று காலையிலிருந்து நெஞ்சில் கடுமையான பாரமும் வலியும் உள்ளது மற்றும் குமட்டலாக உள்ளது.",
      inferredValue: "நெஞ்சு வலி / பாரமாக இருத்தல்",
    },
  },
  duration: {
    en: {
      text: "It started around 3 hours ago while climbing stairs and has not gone away.",
      inferredValue: "3 hours (acute onset)",
    },
    hi: {
      text: "यह करीब तीन घंटे पहले सीढ़ियां चढ़ते समय शुरू हुआ और लगातार बना हुआ है।",
      inferredValue: "3 घंटे (अचानक शुरू)",
    },
    ta: {
      text: "சுமார் 3 மணி நேரத்திற்கு முன்பு படிக்கட்டுகளில் ஏறும்போது தொடங்கியது.",
      inferredValue: "3 மணி நேரம் (திடீரெனத் தொடங்கியது)",
    },
  },
  associated_symptoms: {
    en: {
      text: "Yes, I am sweating a lot even with the AC on, and feeling quite breathless.",
      inferredValue: ["Shortness of breath (Dyspnea)", "Cold sweating / Diaphoresis"],
    },
    hi: {
      text: "हाँ, मुझे बहुत ठंडा पसीना आ रहा है और सांस लेने में काफी तकलीफ हो रही है।",
      inferredValue: ["सांस लेने में अत्यधिक कठिनाई", "ठंडा पसीना आना"],
    },
    ta: {
      text: "ஆம், அதிக குளிர்ந்த வியர்வை வெளியேறுகிறது மற்றும் மூச்சு விடுவதில் சிரமம் உள்ளது.",
      inferredValue: ["மூச்சு விடுவதில் கடுமையான சிரமம்", "குளிர்ந்த வியர்வை வெளியேறுதல்"],
    },
  },
  fever_pattern: {
    en: {
      text: "The fever comes every evening with intense shivering and body ache for 4 days.",
      inferredValue: "Comes and goes with shivering/chills",
    },
    hi: {
      text: "पिछले 4 दिनों से हर शाम को तेज कंपकंपी और बदन दर्द के साथ बुखार आ रहा है।",
      inferredValue: "कंपकंपी के साथ आता-जाता है",
    },
    ta: {
      text: "கடந்த 4 நாட்களாக தினமும் மாலையில் நடுக்கத்துடன் காய்ச்சல் வருகிறது.",
      inferredValue: "நடுக்கத்துடன் வந்து போகும் காய்ச்சல்",
    },
  },
  joint_location: {
    en: {
      text: "Both my knee joints are swollen and stiff for the past 6 months, worse in the morning.",
      inferredValue: ["Knee joints", "Morning stiffness lasting more than 30 minutes"],
    },
    hi: {
      text: "पिछले 6 महीनों से मेरे दोनों घुटनों में सूजन और दर्द है, सुबह बहुत ज्यादा जकड़न रहती है।",
      inferredValue: ["घुटनों में दर्द", "सुबह उठने पर 30 मिनट से अधिक जकड़न"],
    },
    ta: {
      text: "கடந்த 6 மாதங்களாக இரு முழங்கால் மூட்டுகளிலும் வீக்கமும் வலியும் உள்ளது, காலையில் அதிகம்.",
      inferredValue: ["முழங்கால் மூட்டுகள்", "காலையில் எழும்போது 30 நிமிடத்திற்கு மேல் விறைப்பு"],
    },
  }
};

/**
 * Mock OCR entity extractor with simulated confidence levels
 */
export function simulateOcrExtraction(isLowConfidence: boolean = false): ExtractedDocumentField[] {
  if (isLowConfidence) {
    return [
      { field: "Medicine", value: "Metformin (unclear: Mel...?)", confidence: 0.52, verificationState: "unverified" },
      { field: "Dose", value: "500 mg", confidence: 0.61, verificationState: "unverified" },
      { field: "Frequency", value: "TDS or BD?", confidence: 0.44, verificationState: "unverified" },
      { field: "Medicine 2", value: "Atorvastatin (?)", confidence: 0.48, verificationState: "unverified" },
      { field: "Prescription Date", value: "14/02/2025 (?)", confidence: 0.58, verificationState: "unverified" },
      { field: "Doctor Stamp", value: "Dr. R. K. Sharma (Cardiology)", confidence: 0.72, verificationState: "unverified" },
    ];
  }

  return [
    { field: "Medicine", value: "Metformin Hydrochloride", confidence: 0.96, verificationState: "unverified" },
    { field: "Dose", value: "500 mg", confidence: 0.93, verificationState: "unverified" },
    { field: "Frequency", value: "Twice daily after meals", confidence: 0.88, verificationState: "unverified" },
    { field: "Medicine 2", value: "Telmisartan", confidence: 0.94, verificationState: "unverified" },
    { field: "Dose 2", value: "40 mg", confidence: 0.91, verificationState: "unverified" },
    { field: "Frequency 2", value: "Once daily morning", confidence: 0.74, verificationState: "unverified" },
    { field: "Prescription Date", value: "12/08/2026", confidence: 0.98, verificationState: "patient_confirmed" },
    { field: "Doctor Stamp", value: "Dr. Sunita Verma, MD (Internal Medicine)", confidence: 0.95, verificationState: "patient_confirmed" },
  ];
}

/**
 * Generates an editable, structured clinical summary note for the physician
 */
export function generateClinicalSummaryText(
  patient: PatientInfo,
  history: ClinicalHistory,
  urgency: "routine" | "urgent"
): string {
  const ccList = history.chief_complaint.map((c) => `${c.text} (duration: ${c.duration || "unspecified"}, severity: ${c.severity})`).join(", ");
  const meds = history.medications.map((m) => `${m.name} ${m.dosage} (${m.frequency}) [source: ${m.source}]`).join("; ");
  const allergies = history.allergies.length > 0
    ? history.allergies.map((a) => `${a.allergen} causing ${a.reaction}`).join(", ")
    : "No known drug allergies (NKDA) reported";
  
  const isChest = history.chief_complaint.some((c) => /chest|heart|angina|retrosternal/i.test(c.text));
  const isAbdomen = history.chief_complaint.some((c) => /stomach|abdomen|gastric|vomit|nausea/i.test(c.text));
  const isFebrile = history.chief_complaint.some((c) => /fever|bukhar|chills/i.test(c.text));
  const isResp = history.chief_complaint.some((c) => /cough|cold|phlegm|throat/i.test(c.text));

  const hpiOnset = history.hpi.onset?.value || "Recent acute onset";
  const hpiSite = history.hpi.site?.value || (
    isChest ? "Retrosternal (Center of chest)" :
    isAbdomen ? "Abdominal / Epigastric" :
    isFebrile ? "Systemic / Febrile" :
    isResp ? "Upper respiratory tract" :
    "Localized symptom site"
  );
  const hpiChar = history.hpi.character?.value || (
    isChest ? "Tightness / heavy pressure" :
    isAbdomen ? "Cramping / burning distress" :
    isFebrile ? "Chills / febrile rigors" :
    isResp ? "Persistent irritating cough" :
    "Moderate symptom severity"
  );
  const assoc = Array.isArray(history.hpi.associated_symptoms?.value) && history.hpi.associated_symptoms.value.length > 0
    ? history.hpi.associated_symptoms.value.join(", ")
    : "No pertinent secondary symptoms noted";

  const aggRel = isChest
    ? "Exertion worsens symptoms; rest provides partial relief."
    : isAbdomen
    ? "Food intake aggravates nausea/cramps."
    : isResp
    ? "Cold air and lying down aggravates coughing."
    : "Symptom exacerbation noted during physical activity.";

  const ayushText = history.ayush
    ? `AYUSH Dashavidha Assessment: Prakriti: ${history.ayush.prakriti.value}; Agni: ${history.ayush.ahara_shakti.value}; Koshta/Bowel: ${history.ayush.ahara_vihara.bowel_habits.value}; Sleep: ${history.ayush.ahara_vihara.sleep_pattern.value}`
    : "Standard Allopathic Intake (AYUSH not recorded)";

  const redFlagText = urgency === "urgent"
    ? isChest
      ? "⚠️ CRITICAL ALERT: Symptoms meet acute coronary syndrome criteria (retrosternal pain + dyspnea/diaphoresis). Immediate 12-lead ECG and Troponin I recommended."
      : "⚠️ CRITICAL ALERT: Urgent triage escalation criteria met. Priority 1 physician evaluation recommended."
    : "Routine OPD presentation. No immediate hemodynamic compromise detected.";

  return `CLINICAL CONSULTATION NOTE (AI-GENERATED INTAKE DRAFT)
Patient: ${patient.name || "Patient"} | Age/Sex: ${patient.age || "--"}y / ${patient.sex || "--"} | ABHA: ${patient.abha_id || "Unlinked"}
Triage Status: ${urgency.toUpperCase()} | Generated: ${new Date().toLocaleString("en-IN")}

1. CHIEF COMPLAINT(S):
   ${ccList || "No chief complaints logged"}

2. HISTORY OF PRESENT ILLNESS (HPI):
   Patient presented with: ${ccList || "unspecified complaints"}.
   Onset: ${hpiOnset}.
   Primary Site: ${hpiSite}. Character: ${hpiChar}.
   Pertinent Associated Symptoms: ${assoc}.
   Aggravating/Relieving Context: ${aggRel}

3. PRIOR MEDICATIONS & COMPLIANCE:
   ${meds || "No regular medications on file."}

4. ALLERGIES:
   ${allergies}

5. PAST MEDICAL / SURGICAL:
   ${history.past_history?.value?.join(", ") || "No past chronic illnesses declared."}

6. AYUSH / LIFESTYLE PROFILE:
   ${ayushText}

7. RED-FLAG ASSESSMENT:
   ${redFlagText}

[DRAFT GENERATED BY MEDIKIOSK AI INTAKE ENGINE - REQUIRES PHYSICIAN SIGN-OFF]`;
}
