import { create } from "zustand";
import {
  EncounterState,
  PatientInfo,
  ClinicalHistory,
  ConsentState,
  DocumentRecord,
  EmergencyIntake,
  AccessibilitySettings,
  AuditLogEntry,
  SupportedLanguage,
  ClinicalValue,
  ChiefComplaintItem,
  MedicationItem,
  AllergyItem,
  VerificationState,
  RedFlagRule,
} from "@/types/kiosk";
import { cardiacUrgentSeed, ayushJointPainSeed, emergencyBreakGlassSeed } from "@/lib/seeds";

export interface TriageQueueItem {
  encounterId: string;
  patientName: string;
  ageSex: string;
  urgency: "urgent" | "routine";
  chiefComplaint: string;
  ruleFired?: string;
  arrivalTime: string;
  status: string;
}

export interface KioskStoreState {
  encounter: EncounterState;
  patient: PatientInfo;
  history: ClinicalHistory;
  documents: DocumentRecord[];
  consent: ConsentState;
  emergency?: EmergencyIntake;
  accessibility: AccessibilitySettings;
  audit: AuditLogEntry[];
  isStaffAssistActive: boolean;
  triageQueue: TriageQueueItem[];
  isTutorialOpen: boolean;
  isProfileSettingsOpen: boolean;
  
  // Developer/Demo flags
  demoFlags: {
    isLowConfidenceOcr: boolean;
    forceRedFlagModal: boolean;
    isAyushModeActive: boolean;
  };

  // Actions
  setLanguage: (lang: SupportedLanguage) => void;
  updatePatient: (patient: Partial<PatientInfo>) => void;
  setFaceEnrolled: (enrolled: boolean) => void;
  setTutorialOpen: (open: boolean) => void;
  setProfileSettingsOpen: (open: boolean) => void;
  updateConsent: (consent: Partial<ConsentState>) => void;
  setEncounterUrgency: (urgency: "routine" | "urgent") => void;
  setActiveRedFlagRule: (rule?: RedFlagRule) => void;
  
  // Staff Assist
  callStaffAssist: (locationContext?: string) => void;
  dismissStaffAssist: () => void;
  terminateSession: () => void;
  
  // History Actions
  addChiefComplaint: (cc: Omit<ChiefComplaintItem, "id">) => void;
  updateChiefComplaint: (id: string, updates: Partial<ChiefComplaintItem>) => void;
  removeChiefComplaint: (id: string) => void;
  setHpiField: (field: keyof ClinicalHistory["hpi"], val: ClinicalValue) => void;
  addMedication: (med: Omit<MedicationItem, "id">) => void;
  updateMedication: (id: string, updates: Partial<MedicationItem>) => void;
  removeMedication: (id: string) => void;
  addAllergy: (alg: Omit<AllergyItem, "id">) => void;
  removeAllergy: (id: string) => void;
  setPastHistory: (items: string[]) => void;
  
  // AYUSH Actions
  setAyushField: (field: keyof NonNullable<ClinicalHistory["ayush"]>, val: ClinicalValue<string>) => void;
  setAyushAharaViharaField: (field: string, val: ClinicalValue<string>) => void;
  
  // Document Actions
  addDocument: (doc: DocumentRecord) => void;
  updateExtractedField: (docId: string, fieldIndex: number, updates: { value?: string; verificationState?: VerificationState }) => void;
  confirmExtractedFieldToMedications: (docId: string, fieldIndex: number) => void;
  
  // Verification / Physician Actions
  confirmAllHighConfidenceFields: () => void;
  updateItemVerification: (category: "chief_complaint" | "medications" | "allergies", id: string, state: VerificationState) => void;
  
  // Emergency Actions
  setEmergencyIntake: (intake: EmergencyIntake) => void;
  updateEmergencyIntake: (updates: Partial<EmergencyIntake>) => void;
  
  // Audit Actions
  addAuditLog: (event: AuditLogEntry["event"], actor: string, details: Record<string, any>) => void;
  
  // Accessibility Actions
  setFontSize: (size: AccessibilitySettings["fontSize"]) => void;
  toggleTts: () => void;
  toggleSlowMode: () => void;
  toggleHighContrast: () => void;
  
  // Demo Panel Actions
  setDemoFlag: <K extends keyof KioskStoreState["demoFlags"]>(key: K, value: KioskStoreState["demoFlags"][K]) => void;
  loadSeedScenario: (scenario: "cardiac" | "ayush" | "emergency") => void;
  resetKiosk: () => void;
}

const defaultAyushAssessment: NonNullable<ClinicalHistory["ayush"]> = {
  prakriti: { field: "prakriti", value: "Vata-Pitta", source: "patient_touch", confidence: 0.9, verificationState: "patient_confirmed" },
  vikriti: { field: "vikriti", value: "Vata Vriddhi", source: "inferred", confidence: 0.85, verificationState: "unverified" },
  sara: { field: "sara", value: "Madhyama Sara", source: "inferred", confidence: 0.85, verificationState: "unverified" },
  samhanana: { field: "samhanana", value: "Madhyama", source: "patient_touch", confidence: 0.9, verificationState: "patient_confirmed" },
  pramana: { field: "pramana", value: "Sama Pramana", source: "patient_touch", confidence: 0.9, verificationState: "patient_confirmed" },
  satmya: { field: "satmya", value: "Sarva Rasa", source: "patient_touch", confidence: 0.9, verificationState: "patient_confirmed" },
  sattva: { field: "sattva", value: "Madhyama", source: "patient_touch", confidence: 0.9, verificationState: "patient_confirmed" },
  ahara_shakti: { field: "ahara_shakti", value: "Samagni", source: "patient_touch", confidence: 0.9, verificationState: "patient_confirmed" },
  vyayama_shakti: { field: "vyayama_shakti", value: "Madhyama", source: "patient_touch", confidence: 0.9, verificationState: "patient_confirmed" },
  vaya: { field: "vaya", value: "Madhyama", source: "patient_touch", confidence: 0.9, verificationState: "patient_confirmed" },
  ahara_vihara: {
    meal_timing: { field: "meal_timing", value: "Regular", source: "patient_touch", confidence: 0.9, verificationState: "patient_confirmed" },
    appetite: { field: "appetite", value: "Moderate", source: "patient_touch", confidence: 0.9, verificationState: "patient_confirmed" },
    digestion: { field: "digestion", value: "Normal", source: "patient_touch", confidence: 0.9, verificationState: "patient_confirmed" },
    bowel_habits: { field: "bowel_habits", value: "Madhya Koshta", source: "patient_touch", confidence: 0.9, verificationState: "patient_confirmed" },
    sleep_pattern: { field: "sleep_pattern", value: "Samyak Nidra (6-8 hours)", source: "patient_touch", confidence: 0.9, verificationState: "patient_confirmed" },
    physical_activity: { field: "physical_activity", value: "Moderate", source: "patient_touch", confidence: 0.9, verificationState: "patient_confirmed" },
    stress_level: { field: "stress_level", value: "Low", source: "patient_touch", confidence: 0.9, verificationState: "patient_confirmed" },
    substance_use: { field: "substance_use", value: "None", source: "patient_touch", confidence: 0.9, verificationState: "patient_confirmed" },
    seasonal_triggers: { field: "seasonal_triggers", value: "None", source: "patient_touch", confidence: 0.9, verificationState: "patient_confirmed" },
  },
};

const initialTriageQueue: TriageQueueItem[] = [
  {
    encounterId: "ENC-CAR-20260904-01",
    patientName: "Rameshwar Prasad Patel",
    ageSex: "56y / M",
    urgency: "urgent",
    chiefComplaint: "Chest Pain / Heavy Pressure",
    ruleFired: "Rule RF-01 (Acute Coronary Syndrome Risk Criteria)",
    arrivalTime: "13:20",
    status: "At Triage Desk Counter 01",
  },
  {
    encounterId: "EMG-20260904-8841",
    patientName: "Unidentified Trauma Case #14",
    ageSex: "42y / M",
    urgency: "urgent",
    chiefComplaint: "Road Traffic Accident (AVPU: Pain)",
    ruleFired: "Break-Glass Trauma Resuscitation Pathway",
    arrivalTime: "13:45",
    status: "Red Corridor Resuscitation Bay",
  },
];

const defaultInitialState: {
  encounter: EncounterState;
  patient: PatientInfo;
  consent: ConsentState;
  history: ClinicalHistory;
  documents: DocumentRecord[];
  accessibility: AccessibilitySettings;
  audit: AuditLogEntry[];
  isStaffAssistActive: boolean;
  triageQueue: TriageQueueItem[];
  demoFlags: {
    isLowConfidenceOcr: boolean;
    forceRedFlagModal: boolean;
    isAyushModeActive: boolean;
  };
  isTutorialOpen: boolean;
  isProfileSettingsOpen: boolean;
} = {
  encounter: {
    id: `ENC-${Date.now().toString().slice(-6)}`,
    type: "OPD",
    department: "General Medicine Outpatient Clinic",
    language: "en",
    urgency: "routine",
    startTime: new Date().toISOString(),
    status: "in_progress",
    activeRedFlagRule: undefined,
  },
  patient: {
    name: "",
    age: undefined,
    sex: undefined,
    abha_id: "",
    masked_abha: "",
    hospital_id: "",
    phone: "",
  },
  consent: {
    history_capture: true,
    document_processing: true,
    share_with_hospital: true,
    purpose: "Current OPD Consultation & Clinical Triage Intake",
    recipients: [
      "Attending OPD Physician",
      "Consulting Clinical Specialists",
      "Triage Nursing Desk Counter 01",
      "Hospital EMR Core (ABDM Gateway)",
    ],
    retention: "Retained for current consultation + 24 hours demo retention, then automatically purged per DPDP Act 2023 guidelines.",
    accessControlNotice: "Access is strictly role-based and cryptographically audited under the ABDM consent framework.",
    grantedBy: "patient",
    timestamp: new Date().toISOString(),
    expiry: new Date(Date.now() + 86400000).toISOString(),
  },
  history: {
    chief_complaint: [],
    hpi: {},
    past_history: {
      field: "past_history",
      value: [],
      source: "patient_touch",
      confidence: 1.0,
      verificationState: "unverified",
    },
    medications: [],
    allergies: [],
    family_history: {
      field: "family_history",
      value: [],
      source: "patient_touch",
      confidence: 1.0,
      verificationState: "unverified",
    },
    personal_history: {
      diet: { field: "diet", value: "Vegetarian", source: "patient_touch", confidence: 1.0, verificationState: "unverified" },
      smoking: { field: "smoking", value: "Never", source: "patient_touch", confidence: 1.0, verificationState: "unverified" },
      alcohol: { field: "alcohol", value: "Never", source: "patient_touch", confidence: 1.0, verificationState: "unverified" },
      physical_activity: { field: "physical_activity", value: "Moderate", source: "patient_touch", confidence: 1.0, verificationState: "unverified" },
      occupation: { field: "occupation", value: "Salaried", source: "patient_touch", confidence: 1.0, verificationState: "unverified" },
    },
    review_of_systems: {},
    ayush: undefined,
  },
  documents: [],
  accessibility: {
    fontSize: "md",
    ttsEnabled: true,
    slowMode: false,
    highContrast: false,
  },
  isStaffAssistActive: false,
  triageQueue: initialTriageQueue,
  audit: [
    {
      id: "aud-0",
      event: "CONSENT_GRANTED",
      timestamp: new Date().toISOString(),
      actor: "Kiosk Terminal 04",
      details: { message: "Kiosk session initiated with DPDP Act 2023 compliance defaults" },
    },
  ],
  demoFlags: {
    isLowConfidenceOcr: false,
    forceRedFlagModal: false,
    isAyushModeActive: false,
  },
  isTutorialOpen: false,
  isProfileSettingsOpen: false,
};

export const useKioskStore = create<KioskStoreState>((set, get) => ({
  ...defaultInitialState,

  setTutorialOpen: (open) => set(() => ({ isTutorialOpen: open })),
  setProfileSettingsOpen: (open) => set(() => ({ isProfileSettingsOpen: open })),

  setFaceEnrolled: (enrolled) =>
    set((state) => ({
      patient: {
        ...state.patient,
        faceEnrolled: enrolled,
        faceEnrollmentTimestamp: enrolled ? new Date().toISOString() : undefined,
      },
      audit: [
        ...state.audit,
        {
          id: `aud-${Date.now()}`,
          event: "CONSENT_GRANTED",
          timestamp: new Date().toISOString(),
          actor: "Patient (Terminal 04)",
          details: {
            action: enrolled ? "EMERGENCY_FACE_ID_ENROLLED" : "EMERGENCY_FACE_ID_REVOKED",
            dpdpCompliance: "Section 6(4) Right to Withdraw Consent",
            timestamp: new Date().toISOString(),
          },
        },
      ],
    })),

  setLanguage: (lang) =>
    set((state) => ({
      encounter: { ...state.encounter, language: lang },
    })),

  updatePatient: (patient) =>
    set((state) => {
      let masked = state.patient.masked_abha;
      if (patient.abha_id) {
        const clean = patient.abha_id.replace(/\D/g, "");
        if (clean.length >= 4) {
          masked = `XX-XXXX-XXXX-${clean.slice(-4)}`;
        } else {
          masked = "XX-XXXX-XXXX-XXXX";
        }
      }
      return {
        patient: { ...state.patient, ...patient, masked_abha: masked },
      };
    }),

  updateConsent: (consent) =>
    set((state) => {
      const updated = { ...state.consent, ...consent };
      return {
        consent: updated,
        audit: [
          ...state.audit,
          {
            id: `aud-${Date.now()}`,
            event: "CONSENT_GRANTED",
            timestamp: new Date().toISOString(),
            actor: updated.grantedBy === "break_glass" ? "Triage Officer" : "Patient",
            details: { scopes: updated },
          },
        ],
      };
    }),

  setEncounterUrgency: (urgency) =>
    set((state) => {
      // If escalated to urgent, ensure it appears in the triage queue
      let queue = state.triageQueue;
      if (urgency === "urgent" && !queue.some((q) => q.encounterId === state.encounter.id)) {
        queue = [
          {
            encounterId: state.encounter.id,
            patientName: state.patient.name || "Patient at Terminal 04",
            ageSex: `${state.patient.age || "--"}y / ${state.patient.sex ? state.patient.sex[0].toUpperCase() : "--"}`,
            urgency: "urgent",
            chiefComplaint: state.history.chief_complaint[0]?.text || "Acute Symptoms Flagged",
            ruleFired: state.encounter.activeRedFlagRule?.ruleName || "Red-Flag Protocol Triggered",
            arrivalTime: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
            status: "Triage Alert Broadcast to Desk",
          },
          ...queue,
        ];
      }

      return {
        encounter: { ...state.encounter, urgency },
        triageQueue: queue,
      };
    }),

  setActiveRedFlagRule: (rule) =>
    set((state) => ({
      encounter: {
        ...state.encounter,
        activeRedFlagRule: rule,
        urgency: rule ? "urgent" : state.encounter.urgency,
      },
    })),

  callStaffAssist: (locationContext = "History Taking Screen") =>
    set((state) => ({
      isStaffAssistActive: true,
      audit: [
        ...state.audit,
        {
          id: `aud-${Date.now()}`,
          event: "STAFF_ASSIST_REQUESTED",
          timestamp: new Date().toISOString(),
          actor: "Patient (Terminal 04)",
          details: { location: locationContext, message: "Assistance requested at kiosk terminal" },
        },
      ],
    })),

  dismissStaffAssist: () =>
    set(() => ({ isStaffAssistActive: false })),

  terminateSession: () => {
    const encId = get().encounter.id;
    get().addAuditLog("SESSION_TERMINATED", "Kiosk Terminal 04", {
      encounterId: encId,
      status: "Session closed and local demographic memory cleared per DPDP retention rules",
    });

    // Reset store but preserve audit logs for traceability
    const currentAudit = get().audit;
    const currentQueue = get().triageQueue;
    set(() => ({
      ...defaultInitialState,
      encounter: { ...defaultInitialState.encounter, id: `ENC-${Date.now().toString().slice(-6)}` },
      audit: currentAudit,
      triageQueue: currentQueue,
    }));
  },

  addChiefComplaint: (cc) =>
    set((state) => ({
      history: {
        ...state.history,
        chief_complaint: [
          ...state.history.chief_complaint,
          { ...cc, id: `cc-${Date.now()}-${Math.random().toString(36).substring(2, 5)}` },
        ],
      },
    })),

  updateChiefComplaint: (id, updates) =>
    set((state) => ({
      history: {
        ...state.history,
        chief_complaint: state.history.chief_complaint.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        ),
      },
    })),

  removeChiefComplaint: (id) =>
    set((state) => ({
      history: {
        ...state.history,
        chief_complaint: state.history.chief_complaint.filter((c) => c.id !== id),
      },
    })),

  setHpiField: (field, val) =>
    set((state) => ({
      history: {
        ...state.history,
        hpi: {
          ...state.history.hpi,
          [field]: val,
        },
      },
    })),

  addMedication: (med) =>
    set((state) => ({
      history: {
        ...state.history,
        medications: [
          ...state.history.medications,
          { ...med, id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 5)}` },
        ],
      },
    })),

  updateMedication: (id, updates) =>
    set((state) => ({
      history: {
        ...state.history,
        medications: state.history.medications.map((m) =>
          m.id === id ? { ...m, ...updates } : m
        ),
      },
    })),

  removeMedication: (id) =>
    set((state) => ({
      history: {
        ...state.history,
        medications: state.history.medications.filter((m) => m.id !== id),
      },
    })),

  addAllergy: (alg) =>
    set((state) => ({
      history: {
        ...state.history,
        allergies: [
          ...state.history.allergies,
          { ...alg, id: `alg-${Date.now()}-${Math.random().toString(36).substring(2, 5)}` },
        ],
      },
    })),

  removeAllergy: (id) =>
    set((state) => ({
      history: {
        ...state.history,
        allergies: state.history.allergies.filter((a) => a.id !== id),
      },
    })),

  setPastHistory: (items) =>
    set((state) => ({
      history: {
        ...state.history,
        past_history: {
          field: "past_history",
          value: items,
          source: "patient_touch",
          confidence: 0.95,
          verificationState: "patient_confirmed",
        },
      },
    })),

  setAyushField: (field, val) =>
    set((state) => {
      const currentAyush = state.history.ayush || defaultAyushAssessment;
      return {
        history: {
          ...state.history,
          ayush: {
            ...currentAyush,
            [field]: val,
          },
        },
      };
    }),

  setAyushAharaViharaField: (field, val) =>
    set((state) => {
      const currentAyush = state.history.ayush;
      if (!currentAyush) return state;

      return {
        history: {
          ...state.history,
          ayush: {
            ...currentAyush,
            ahara_vihara: {
              ...currentAyush.ahara_vihara,
              [field]: val,
            },
          },
        },
      };
    }),

  addDocument: (doc) =>
    set((state) => ({
      documents: [...state.documents, doc],
      audit: [
        ...state.audit,
        {
          id: `aud-${Date.now()}`,
          event: "DOCUMENT_UPLOADED",
          timestamp: new Date().toISOString(),
          actor: "OCR Entity Extraction Engine",
          details: { docId: doc.id, fieldsExtracted: doc.extractedFields.length },
        },
      ],
    })),

  updateExtractedField: (docId, fieldIndex, updates) =>
    set((state) => {
      const updatedDocs = state.documents.map((d) => {
        if (d.id !== docId) return d;
        const newFields = [...d.extractedFields];
        newFields[fieldIndex] = { ...newFields[fieldIndex], ...updates };
        return { ...d, extractedFields: newFields };
      });

      return {
        documents: updatedDocs,
        audit: [
          ...state.audit,
          {
            id: `aud-${Date.now()}`,
            event: "FIELD_CORRECTED",
            timestamp: new Date().toISOString(),
            actor: "Patient / Attendant",
            details: { docId, fieldIndex, updates },
          },
        ],
      };
    }),

  confirmExtractedFieldToMedications: (docId, fieldIndex) => {
    const doc = get().documents.find((d) => d.id === docId);
    if (!doc) return;
    const fieldItem = doc.extractedFields[fieldIndex];
    if (!fieldItem) return;

    // Mark as confirmed in document
    get().updateExtractedField(docId, fieldIndex, { verificationState: "physician_confirmed" });

    // If it's a medicine, add to medications
    if (fieldItem.field.toLowerCase().includes("medicine")) {
      const isLow = fieldItem.confidence < 0.85;
      get().addMedication({
        name: fieldItem.value,
        dosage: "Standard (Prescribed)",
        frequency: "As per prescription",
        source: "document",
        confidence: fieldItem.confidence,
        verificationState: isLow ? "unverified" : "physician_confirmed",
        whyThisMatters: isLow
          ? "OCR confidence below threshold (0.85). Verifying name and dosage avoids medication reconciliation errors."
          : undefined,
      });
    }
  },

  confirmAllHighConfidenceFields: () => {
    set((state) => {
      const updatedCc = state.history.chief_complaint.map((c) =>
        c.confidence >= 0.85 ? { ...c, verificationState: "physician_confirmed" as const } : c
      );
      const updatedMeds = state.history.medications.map((m) =>
        m.confidence >= 0.85 ? { ...m, verificationState: "physician_confirmed" as const } : m
      );
      const updatedDocs = state.documents.map((doc) => ({
        ...doc,
        extractedFields: doc.extractedFields.map((f) =>
          f.confidence >= 0.85 ? { ...f, verificationState: "physician_confirmed" as const } : f
        ),
      }));

      return {
        history: {
          ...state.history,
          chief_complaint: updatedCc,
          medications: updatedMeds,
        },
        documents: updatedDocs,
        audit: [
          ...state.audit,
          {
            id: `aud-${Date.now()}`,
            event: "PHYSICIAN_EDIT",
            timestamp: new Date().toISOString(),
            actor: "Dr. Rajesh K. Gupta",
            details: { action: "Batch approved all high-confidence (>=0.85) AI extractions" },
          },
        ],
      };
    });
  },

  updateItemVerification: (category, id, vState) => {
    set((state) => {
      let updatedHistory = { ...state.history };
      if (category === "chief_complaint") {
        updatedHistory.chief_complaint = state.history.chief_complaint.map((c) =>
          c.id === id ? { ...c, verificationState: vState } : c
        );
      } else if (category === "medications") {
        updatedHistory.medications = state.history.medications.map((m) =>
          m.id === id ? { ...m, verificationState: vState } : m
        );
      } else if (category === "allergies") {
        updatedHistory.allergies = state.history.allergies.map((a) =>
          a.id === id ? { ...a, verificationState: vState } : a
        );
      }

      return {
        history: updatedHistory,
        audit: [
          ...state.audit,
          {
            id: `aud-${Date.now()}`,
            event: "PHYSICIAN_EDIT",
            timestamp: new Date().toISOString(),
            actor: "Dr. Rajesh K. Gupta",
            details: { category, id, newState: vState },
          },
        ],
      };
    });
  },

  setEmergencyIntake: (intake) =>
    set((state) => ({
      emergency: intake,
      encounter: {
        ...state.encounter,
        type: "EMERGENCY",
        urgency: "urgent",
        id: intake.emergencyId,
      },
      audit: [
        ...state.audit,
        {
          id: `aud-${Date.now()}`,
          event: "EMERGENCY_ACTIVATED",
          timestamp: new Date().toISOString(),
          actor: intake.breakGlassAudit.activatedBy,
          details: intake.breakGlassAudit,
        },
      ],
    })),

  updateEmergencyIntake: (updates) =>
    set((state) => ({
      emergency: state.emergency ? { ...state.emergency, ...updates } : undefined,
    })),

  addAuditLog: (event, actor, details) =>
    set((state) => ({
      audit: [
        ...state.audit,
        {
          id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          event,
          timestamp: new Date().toISOString(),
          actor,
          details,
        },
      ],
    })),

  setFontSize: (size) =>
    set((state) => ({
      accessibility: { ...state.accessibility, fontSize: size },
    })),

  toggleTts: () =>
    set((state) => ({
      accessibility: { ...state.accessibility, ttsEnabled: !state.accessibility.ttsEnabled },
    })),

  toggleSlowMode: () =>
    set((state) => ({
      accessibility: { ...state.accessibility, slowMode: !state.accessibility.slowMode },
    })),

  toggleHighContrast: () =>
    set((state) => ({
      accessibility: { ...state.accessibility, highContrast: !state.accessibility.highContrast },
    })),

  setDemoFlag: (key, value) =>
    set((state) => ({
      demoFlags: { ...state.demoFlags, [key]: value },
    })),

  loadSeedScenario: (scenario) => {
    if (scenario === "cardiac") {
      set((state) => ({
        ...state,
        patient: { ...cardiacUrgentSeed.patient, masked_abha: "XX-XXXX-XXXX-3421" },
        encounter: { ...cardiacUrgentSeed.encounter, urgency: "urgent" },
        consent: cardiacUrgentSeed.consent,
        history: cardiacUrgentSeed.history,
        documents: cardiacUrgentSeed.documents,
        emergency: undefined,
        demoFlags: { ...state.demoFlags, isAyushModeActive: false },
        audit: [
          ...state.audit,
          {
            id: `aud-${Date.now()}`,
            event: "RED_FLAG_TRIGGERED",
            timestamp: new Date().toISOString(),
            actor: "MediKiosk Clinical Triage Engine",
            details: {
              ruleId: "RF-01",
              ruleName: "Acute Coronary Syndrome Risk Criteria",
              reason: "Retrosternal crushing chest pain + diaphoresis/dyspnea",
            },
          },
        ],
      }));
    } else if (scenario === "ayush") {
      set((state) => ({
        ...state,
        patient: { ...ayushJointPainSeed.patient, masked_abha: "XX-XXXX-XXXX-9912" },
        encounter: ayushJointPainSeed.encounter,
        consent: ayushJointPainSeed.consent,
        history: ayushJointPainSeed.history,
        documents: [],
        emergency: undefined,
        demoFlags: { ...state.demoFlags, isAyushModeActive: true },
      }));
    } else if (scenario === "emergency") {
      set((state) => ({
        ...state,
        encounter: {
          id: emergencyBreakGlassSeed.emergencyId,
          type: "EMERGENCY",
          department: "Trauma & Acute Resuscitation Unit",
          language: "en",
          urgency: "urgent",
          startTime: new Date().toISOString(),
          status: "in_progress",
        },
        emergency: emergencyBreakGlassSeed,
        patient: {
          hospital_id: emergencyBreakGlassSeed.emergencyId,
          name: "Unidentified Male (Trauma Case #14)",
          age: emergencyBreakGlassSeed.estimatedAge,
          sex: "male",
        },
        history: defaultInitialState.history,
        documents: [],
        audit: [
          ...state.audit,
          {
            id: `aud-${Date.now()}`,
            event: "EMERGENCY_ACTIVATED",
            timestamp: new Date().toISOString(),
            actor: emergencyBreakGlassSeed.breakGlassAudit.activatedBy,
            details: emergencyBreakGlassSeed.breakGlassAudit,
          },
        ],
      }));
    }
  },

  resetKiosk: () =>
    set(() => ({
      ...defaultInitialState,
      encounter: { ...defaultInitialState.encounter, id: `ENC-${Date.now().toString().slice(-6)}` },
    })),
}));
