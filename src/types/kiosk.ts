export type ProvenanceSource = "patient_voice" | "patient_touch" | "document" | "inferred";

export type VerificationState = "unverified" | "patient_confirmed" | "physician_confirmed" | "rejected";

export interface ClinicalValue<T = any> {
  field: string;
  value: T;
  source: ProvenanceSource;
  confidence: number; // 0.0 to 1.0
  verificationState: VerificationState;
  timestamp?: string;
  notes?: string;
}

export type SupportedLanguage = "en" | "hi" | "ta";

export interface PatientInfo {
  abha_id?: string;
  masked_abha?: string;
  hospital_id?: string;
  name?: string;
  age?: number;
  sex?: "male" | "female" | "other";
  phone?: string;
  address?: string;
  emergencyContact?: string;
  faceEnrolled?: boolean;
  faceEnrollmentTimestamp?: string;
}

export interface ChiefComplaintItem {
  id: string;
  text: string;
  duration: string;
  severity: "mild" | "moderate" | "severe";
  source: ProvenanceSource;
  confidence: number;
  verificationState: VerificationState;
}

export interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  source: ProvenanceSource;
  confidence: number;
  verificationState: VerificationState;
  whyThisMatters?: string;
}

export interface AllergyItem {
  id: string;
  allergen: string;
  reaction: string;
  severity: "mild" | "moderate" | "severe";
  source: ProvenanceSource;
  confidence: number;
  verificationState: VerificationState;
}

export interface ExtractedDocumentField {
  field: string;
  value: string;
  confidence: number;
  verificationState: VerificationState;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

export interface DocumentRecord {
  id: string;
  type: "prescription" | "lab_report" | "discharge_summary" | "other";
  title: string;
  uploadTimestamp: string;
  rawText: string;
  extractedFields: ExtractedDocumentField[];
  previewUrl?: string;
}

export interface AyushAssessment {
  // Dashavidha Pariksha (10-fold Ayurvedic clinical examination)
  prakriti: ClinicalValue<string>;      // Bodily constitution: Vata, Pitta, Kapha, Dwandwaja, Tridoshaja
  vikriti: ClinicalValue<string>;       // Morbidity / Current imbalance
  sara: ClinicalValue<string>;          // Tissue excellence
  samhanana: ClinicalValue<string>;     // Body compact/build
  pramana: ClinicalValue<string>;       // Anthropometric measurements
  satmya: ClinicalValue<string>;        // Homologation / Adaptability
  sattva: ClinicalValue<string>;        // Mental stamina/temperament
  ahara_shakti: ClinicalValue<string>;  // Digestive fire (Jaranashakti / Agni)
  vyayama_shakti: ClinicalValue<string>;// Physical endurance/exercise capacity
  vaya: ClinicalValue<string>;          // Age category
  
  // Ahara-Vihara (Dietary habits, lifestyle, diurnal routine)
  ahara_vihara: {
    meal_timing: ClinicalValue<string>;
    appetite: ClinicalValue<string>;
    digestion: ClinicalValue<string>;
    bowel_habits: ClinicalValue<string>;
    sleep_pattern: ClinicalValue<string>;
    physical_activity: ClinicalValue<string>;
    stress_level: ClinicalValue<string>;
    substance_use: ClinicalValue<string>;
    seasonal_triggers: ClinicalValue<string>;
  };
}

export interface ClinicalHistory {
  chief_complaint: ChiefComplaintItem[];
  hpi: {
    onset?: ClinicalValue<string>;
    site?: ClinicalValue<string>;
    character?: ClinicalValue<string>;
    radiation?: ClinicalValue<string>;
    aggravating_relieving?: ClinicalValue<string>;
    associated_symptoms?: ClinicalValue<string[]>;
    progression?: ClinicalValue<string>;
    fever_pattern?: ClinicalValue<string>;
    joint_stiffness?: ClinicalValue<string>;
    neurological_deficits?: ClinicalValue<string[]>;
  };
  past_history: ClinicalValue<string[]>;
  medications: MedicationItem[];
  allergies: AllergyItem[];
  family_history: ClinicalValue<string[]>;
  personal_history: {
    diet: ClinicalValue<string>;
    smoking: ClinicalValue<string>;
    alcohol: ClinicalValue<string>;
    physical_activity: ClinicalValue<string>;
    occupation: ClinicalValue<string>;
  };
  review_of_systems: {
    cardiovascular?: ClinicalValue<string>;
    respiratory?: ClinicalValue<string>;
    gastrointestinal?: ClinicalValue<string>;
    musculoskeletal?: ClinicalValue<string>;
    neurological?: ClinicalValue<string>;
  };
  ayush?: AyushAssessment;
}

export interface ConsentState {
  history_capture: boolean;
  document_processing: boolean;
  share_with_hospital: boolean;
  purpose: string;
  recipients: string[];
  retention: string;
  accessControlNotice: string;
  grantedBy: "patient" | "attendant" | "break_glass";
  timestamp: string;
  expiry: string;
}

export interface RedFlagRule {
  ruleId: string;
  ruleName: string;
  triggerSymptoms: string[];
  clinicalGuideline: string;
  recommendedDisposition: string;
}

export interface AuditLogEntry {
  id: string;
  event:
    | "CONSENT_GRANTED"
    | "RED_FLAG_TRIGGERED"
    | "EMERGENCY_ACTIVATED"
    | "DOCUMENT_UPLOADED"
    | "FIELD_CORRECTED"
    | "PHYSICIAN_EDIT"
    | "FHIR_EXPORTED"
    | "SESSION_TERMINATED"
    | "STAFF_ASSIST_REQUESTED"
    | "HIS_SAVED"
    | "BIOMETRIC_REVOKED"
    | "BIOMETRIC_MATCH_FOUND"
    | "BIOMETRIC_NO_MATCH";
  timestamp: string;
  actor: string;
  details: Record<string, any>;
}

export interface EmergencyIntake {
  emergencyId: string;
  arrivalTime: string;
  locationFound: string;
  estimatedAge?: number;
  apparentSex?: "male" | "female" | "undetermined";
  responsiveness: "alert" | "verbal" | "pain" | "unresponsive"; // AVPU scale
  breathingStatus: "normal" | "distressed" | "absent" | "shallow";
  visibleInjuries: string;
  emergencyIndicators: string[];
  accompanyingPerson?: {
    name: string;
    relationship: string;
    contactNumber: string;
  };
  biometricMatch?: {
    matched: boolean;
    patientId?: string;
    patientName?: string;
    confidenceScore?: number;
    allergies?: string[];
    chronicConditions?: string[];
  };
  breakGlassAudit: {
    reasonCode: "UNCONSCIOUS_TRAUMA" | "ACUTE_CARDIAC_ARREST" | "ALTERED_MENTAL_STATUS_NO_SURROGATE" | "MASS_CASUALTY_TRIAGE";
    activatedBy: string;
    responsibleClinicianId: string;
    responsibleClinicianName: string;
    justification: string;
    consentBypassReason: string;
    scheduledIdentityLinking: string;
  };
}

export interface EncounterState {
  id: string;
  type: "OPD" | "EMERGENCY";
  department: string;
  language: SupportedLanguage;
  urgency: "routine" | "urgent";
  startTime: string;
  status: "in_progress" | "pending_review" | "completed";
  activeRedFlagRule?: RedFlagRule;
}

export interface AccessibilitySettings {
  fontSize: "sm" | "md" | "lg" | "xl";
  ttsEnabled: boolean;
  slowMode: boolean;
  highContrast: boolean;
}
