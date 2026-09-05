import {
  ClinicalHistory,
  PatientInfo,
  EncounterState,
  ConsentState,
  DocumentRecord,
  EmergencyIntake,
} from "@/types/kiosk";

export interface ScenarioSeed {
  patient: PatientInfo;
  encounter: EncounterState;
  consent: ConsentState;
  history: ClinicalHistory;
  documents: DocumentRecord[];
}

export const cardiacUrgentSeed: ScenarioSeed = {
  patient: {
    name: "Rameshwar Prasad Patel",
    age: 56,
    sex: "male",
    abha_id: "14-8842-9011-3421",
    hospital_id: "UHID-AIIMS-78210",
    phone: "+91 98231 44556",
    address: "B-42, Vikas Marg, Preet Vihar, Delhi",
    emergencyContact: "Sunita Patel (Wife) - +91 98231 44557",
  },
  encounter: {
    id: "ENC-CAR-20260904-01",
    type: "OPD",
    department: "Cardiology / Acute Chest Pain Unit",
    language: "en",
    urgency: "urgent",
    startTime: new Date().toISOString(),
    status: "pending_review",
  },
  consent: {
    history_capture: true,
    document_processing: true,
    share_with_hospital: true,
    purpose: "Acute Cardiology Clinical Intake & Triage Evaluation",
    recipients: ["Attending Cardiologist", "Emergency Triage Nurse", "Hospital EHR Core"],
    retention: "24 hours on kiosk local terminal memory, permanent in hospital EHR post-signing",
    accessControlNotice: "Access strictly restricted to consulting cardiology clinical care team and linked ABHA account under DPDP Act 2023.",
    grantedBy: "patient",
    timestamp: new Date().toISOString(),
    expiry: new Date(Date.now() + 86400000).toISOString(),
  },
  history: {
    chief_complaint: [
      {
        id: "cc-1",
        text: "Chest Pain / Heavy Pressure",
        duration: "3 hours (acute onset)",
        severity: "severe",
        source: "patient_voice",
        confidence: 0.96,
        verificationState: "patient_confirmed",
      },
    ],
    hpi: {
      onset: { field: "onset", value: "Started 3 hours ago during mild physical activity", source: "patient_voice", confidence: 0.94, verificationState: "patient_confirmed" },
      site: { field: "site", value: "Center of chest (retrosternal) radiating to left arm and jaw", source: "patient_touch", confidence: 0.98, verificationState: "patient_confirmed" },
      character: { field: "character", value: "Crushing / squeezing / heavy elephant sitting on chest", source: "patient_voice", confidence: 0.95, verificationState: "patient_confirmed" },
      radiation: { field: "radiation", value: "Left shoulder, inner aspect of left arm, and mandible", source: "patient_touch", confidence: 0.92, verificationState: "patient_confirmed" },
      aggravating_relieving: { field: "aggravating_relieving", value: "Worsens on walking; rest has not provided complete relief", source: "patient_voice", confidence: 0.91, verificationState: "patient_confirmed" },
      associated_symptoms: {
        field: "associated_symptoms",
        value: ["Shortness of breath (Dyspnea)", "Cold sweating / Diaphoresis", "Mild nausea"],
        source: "patient_voice",
        confidence: 0.97,
        verificationState: "patient_confirmed",
      },
      progression: { field: "progression", value: "Persistent high intensity for past 90 minutes", source: "inferred", confidence: 0.89, verificationState: "unverified" },
    },
    past_history: {
      field: "past_history",
      value: ["Type 2 Diabetes Mellitus (8 years)", "Essential Systemic Hypertension (12 years)", "Dyslipidemia"],
      source: "patient_touch",
      confidence: 0.95,
      verificationState: "patient_confirmed",
    },
    medications: [
      { id: "med-1", name: "Telmisartan", dosage: "40 mg", frequency: "Once daily morning", source: "patient_touch", confidence: 0.95, verificationState: "patient_confirmed" },
      { id: "med-2", name: "Metformin", dosage: "500 mg", frequency: "Twice daily after meals", source: "document", confidence: 0.92, verificationState: "patient_confirmed" },
      { id: "med-3", name: "Atorvastatin", dosage: "20 mg", frequency: "Once daily at bedtime", source: "document", confidence: 0.90, verificationState: "unverified" },
    ],
    allergies: [
      { id: "alg-1", allergen: "Penicillin", reaction: "Urticarial rash & itching", severity: "moderate", source: "patient_touch", confidence: 0.95, verificationState: "patient_confirmed" },
    ],
    family_history: {
      field: "family_history",
      value: ["Father had Coronary Artery Disease (CAD) at age 52"],
      source: "patient_touch",
      confidence: 0.88,
      verificationState: "patient_confirmed",
    },
    personal_history: {
      diet: { field: "diet", value: "Non-vegetarian, high salt", source: "patient_touch", confidence: 0.9, verificationState: "patient_confirmed" },
      smoking: { field: "smoking", value: "Former smoker (10 pack-years, quit 4 years ago)", source: "patient_voice", confidence: 0.92, verificationState: "patient_confirmed" },
      alcohol: { field: "alcohol", value: "Occasional social use", source: "patient_touch", confidence: 0.9, verificationState: "patient_confirmed" },
      physical_activity: { field: "physical_activity", value: "Sedentary", source: "patient_touch", confidence: 0.9, verificationState: "patient_confirmed" },
      occupation: { field: "occupation", value: "Accountant", source: "patient_touch", confidence: 0.95, verificationState: "patient_confirmed" },
    },
    review_of_systems: {
      cardiovascular: { field: "cardiovascular", value: "Positive for angina, diaphoresis, palpitation", source: "inferred", confidence: 0.94, verificationState: "patient_confirmed" },
      respiratory: { field: "respiratory", value: "Positive for acute exertional dyspnea", source: "inferred", confidence: 0.93, verificationState: "patient_confirmed" },
      gastrointestinal: { field: "gastrointestinal", value: "Epigastric discomfort and mild nausea", source: "patient_voice", confidence: 0.91, verificationState: "patient_confirmed" },
    },
  },
  documents: [
    {
      id: "doc-sample-1",
      type: "prescription",
      title: "Previous OPD Card - Max Heart Institute (2025)",
      uploadTimestamp: new Date(Date.now() - 3600000).toISOString(),
      rawText: "Rx: Tab Telmisartan 40mg OD, Tab Metformin 500mg BD, Tab Atorvastatin 20mg HS. BP: 142/90. Review with lipid profile.",
      extractedFields: [
        { field: "Medicine 1", value: "Telmisartan 40 mg", confidence: 0.97, verificationState: "patient_confirmed" },
        { field: "Medicine 2", value: "Metformin 500 mg", confidence: 0.93, verificationState: "patient_confirmed" },
        { field: "Medicine 3", value: "Atorvastatin 20 mg", confidence: 0.89, verificationState: "unverified" },
        { field: "Recorded BP", value: "142/90 mmHg", confidence: 0.94, verificationState: "patient_confirmed" },
      ],
    },
  ],
};

export const ayushJointPainSeed: ScenarioSeed = {
  patient: {
    name: "Kalyani Meenakshi Sundaram",
    age: 62,
    sex: "female",
    abha_id: "22-4512-8874-9912",
    hospital_id: "UHID-AYUSH-10492",
    phone: "+91 94441 23456",
    address: "Mylapore, Chennai, Tamil Nadu",
    emergencyContact: "Sundaram (Son) - +91 94441 23457",
  },
  encounter: {
    id: "ENC-AYU-20260904-02",
    type: "OPD",
    department: "Ayurveda Kayachikitsa & Panchakarma",
    language: "ta",
    urgency: "routine",
    startTime: new Date().toISOString(),
    status: "pending_review",
  },
  consent: {
    history_capture: true,
    document_processing: true,
    share_with_hospital: true,
    purpose: "Ayurvedic Kayachikitsa Consultation & Prakriti Assessment",
    recipients: ["Attending Ayurvedic Vaidya", "AYUSH OPD Staff", "Hospital EHR Core"],
    retention: "24 hours on kiosk local terminal memory, permanent in hospital EHR post-signing",
    accessControlNotice: "Access strictly restricted to consulting AYUSH care team and linked ABHA account under DPDP Act 2023.",
    grantedBy: "patient",
    timestamp: new Date().toISOString(),
    expiry: new Date(Date.now() + 86400000).toISOString(),
  },
  history: {
    chief_complaint: [
      {
        id: "cc-2",
        text: "Joint / Back Pain (Sandhivata - Osteoarthritis)",
        duration: "8 months (chronic gradual progression)",
        severity: "moderate",
        source: "patient_touch",
        confidence: 0.98,
        verificationState: "patient_confirmed",
      },
    ],
    hpi: {
      onset: { field: "onset", value: "Gradual onset over 8 months", source: "patient_touch", confidence: 0.95, verificationState: "patient_confirmed" },
      site: { field: "site", value: "Bilateral knee joints and lower lumbar spine", source: "patient_touch", confidence: 0.96, verificationState: "patient_confirmed" },
      character: { field: "character", value: "Aching, crepitus on folding knees, morning stiffness", source: "patient_voice", confidence: 0.92, verificationState: "patient_confirmed" },
      aggravating_relieving: { field: "aggravating_relieving", value: "Aggravated by cold weather and walking; relieved by hot fomentation", source: "patient_voice", confidence: 0.94, verificationState: "patient_confirmed" },
      associated_symptoms: { field: "associated_symptoms", value: ["Joint crepitus", "Mild joint swelling after exertion"], source: "patient_touch", confidence: 0.93, verificationState: "patient_confirmed" },
    },
    past_history: {
      field: "past_history",
      value: ["Osteoarthritis knee (Grade II)", "Mild Osteopenia"],
      source: "patient_touch",
      confidence: 0.94,
      verificationState: "patient_confirmed",
    },
    medications: [
      { id: "med-ay-1", name: "Yograj Guggulu", dosage: "2 tablets (500mg)", frequency: "Twice daily with warm water", source: "patient_touch", confidence: 0.96, verificationState: "patient_confirmed" },
      { id: "med-ay-2", name: "Ksheerabala Taila 101", dosage: "10 drops", frequency: "Nightly with warm milk", source: "patient_voice", confidence: 0.91, verificationState: "patient_confirmed" },
    ],
    allergies: [],
    family_history: {
      field: "family_history",
      value: ["Mother had severe Sandhigata Vata (rheumatoid/osteoarthritis)"],
      source: "patient_touch",
      confidence: 0.9,
      verificationState: "patient_confirmed",
    },
    personal_history: {
      diet: { field: "diet", value: "Vegetarian, preference for dry/cold foods", source: "patient_touch", confidence: 0.95, verificationState: "patient_confirmed" },
      smoking: { field: "smoking", value: "Never", source: "patient_touch", confidence: 0.99, verificationState: "patient_confirmed" },
      alcohol: { field: "alcohol", value: "Never", source: "patient_touch", confidence: 0.99, verificationState: "patient_confirmed" },
      physical_activity: { field: "physical_activity", value: "Mild walking limited by pain", source: "patient_touch", confidence: 0.92, verificationState: "patient_confirmed" },
      occupation: { field: "occupation", value: "Homemaker", source: "patient_touch", confidence: 0.95, verificationState: "patient_confirmed" },
    },
    review_of_systems: {
      musculoskeletal: { field: "musculoskeletal", value: "Pain and crepitus in bilateral knees, restricted flexion", source: "patient_touch", confidence: 0.95, verificationState: "patient_confirmed" },
    },
    ayush: {
      prakriti: { field: "prakriti", value: "Vata-Pitta Pradhana", source: "patient_touch", confidence: 0.92, verificationState: "patient_confirmed" },
      vikriti: { field: "vikriti", value: "Vata Dosha Vriddhi with Asthi-Majja Dhatu Kshaya", source: "inferred", confidence: 0.88, verificationState: "unverified" },
      sara: { field: "sara", value: "Madhyama Sara (Moderate tissue excellence)", source: "inferred", confidence: 0.85, verificationState: "unverified" },
      samhanana: { field: "samhanana", value: "Madhyama (Moderate compact build)", source: "patient_touch", confidence: 0.9, verificationState: "patient_confirmed" },
      pramana: { field: "pramana", value: "Sama Pramana (Normal body proportions)", source: "patient_touch", confidence: 0.92, verificationState: "patient_confirmed" },
      satmya: { field: "satmya", value: "Madhura-Tikta Satmya (Habituated to sweet/bitter)", source: "patient_touch", confidence: 0.86, verificationState: "patient_confirmed" },
      sattva: { field: "sattva", value: "Madhyama Sattva (Moderate mental resilience)", source: "patient_touch", confidence: 0.89, verificationState: "patient_confirmed" },
      ahara_shakti: { field: "ahara_shakti", value: "Vishamagni (Irregular digestive fire & appetite)", source: "patient_touch", confidence: 0.94, verificationState: "patient_confirmed" },
      vyayama_shakti: { field: "vyayama_shakti", value: "Avara Vyayama Shakti (Low exercise endurance)", source: "patient_touch", confidence: 0.91, verificationState: "patient_confirmed" },
      vaya: { field: "vaya", value: "Vriddha / Parani (Elderly, >60 years)", source: "patient_touch", confidence: 0.98, verificationState: "patient_confirmed" },
      ahara_vihara: {
        meal_timing: { field: "meal_timing", value: "Irregular, skips morning breakfast", source: "patient_touch", confidence: 0.92, verificationState: "patient_confirmed" },
        appetite: { field: "appetite", value: "Fluctuating / Vishama", source: "patient_touch", confidence: 0.94, verificationState: "patient_confirmed" },
        digestion: { field: "digestion", value: "Prone to bloating and flatulence (Adhmana)", source: "patient_voice", confidence: 0.93, verificationState: "patient_confirmed" },
        bowel_habits: { field: "bowel_habits", value: "Krura Koshta (Tendency for hard stool/constipation)", source: "patient_touch", confidence: 0.95, verificationState: "patient_confirmed" },
        sleep_pattern: { field: "sleep_pattern", value: "Alpanidra (Fragmented sleep, early awakening)", source: "patient_touch", confidence: 0.93, verificationState: "patient_confirmed" },
        physical_activity: { field: "physical_activity", value: "Very low due to joint stiffness", source: "patient_touch", confidence: 0.9, verificationState: "patient_confirmed" },
        stress_level: { field: "stress_level", value: "Moderate worry regarding mobility loss", source: "patient_voice", confidence: 0.89, verificationState: "patient_confirmed" },
        substance_use: { field: "substance_use", value: "None", source: "patient_touch", confidence: 0.98, verificationState: "patient_confirmed" },
        seasonal_triggers: { field: "seasonal_triggers", value: "Marked aggravation during cold / rainy season (Sheetakala)", source: "patient_voice", confidence: 0.96, verificationState: "patient_confirmed" },
      },
    },
  },
  documents: [],
};

export const emergencyBreakGlassSeed: EmergencyIntake = {
  emergencyId: "EMG-20260904-8841",
  arrivalTime: new Date().toISOString(),
  locationFound: "Ring Road Flyover near AIIMS Gate 2 (Road Traffic Incident)",
  estimatedAge: 42,
  apparentSex: "male",
  responsiveness: "pain",
  breathingStatus: "distressed",
  visibleInjuries: "Active laceration over right parietal scalp (3cm); deformity of left forearm; abrasions over chest wall.",
  emergencyIndicators: [
    "Altered mental status (GCS ~9: E2V2M5)",
    "Hypotension (estimated systolic <90 mmHg, thready pulse)",
    "Significant blunt trauma mechanism",
  ],
  accompanyingPerson: {
    name: "Constable Virender Singh",
    relationship: "Delhi Traffic Police PCR Unit 14",
    contactNumber: "+91 11 2341 2233",
  },
  breakGlassAudit: {
    reasonCode: "UNCONSCIOUS_TRAUMA",
    activatedBy: "Nurse Incharge Anita Roy (Staff ID: NS-9042)",
    responsibleClinicianId: "REG-DOC-2026-9048",
    responsibleClinicianName: "Dr. Vikramaditya Rathore, MS (Senior Resident, Emergency Medicine)",
    justification: "Unconscious trauma victim with suspected intracranial bleed and shock. Immediate intervention required; legal next of kin unavailable.",
    consentBypassReason: "Patient incapacitated (AVPU: Pain only, GCS < 10); no surrogate available at time of admission.",
    scheduledIdentityLinking: "Facial photo captured; police verification initiated; bio-fingerprint check scheduled at stabilization within 24 hours.",
  },
};
