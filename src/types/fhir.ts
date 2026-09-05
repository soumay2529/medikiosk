/**
 * FHIR R4 standard interfaces customized for ABDM (Ayushman Bharat Digital Mission) compliance
 */

export interface FhirCoding {
  system: string;
  code: string;
  display: string;
}

export interface FhirCodeableConcept {
  coding?: FhirCoding[];
  text?: string;
}

export interface FhirIdentifier {
  system: string;
  value: string;
  use?: "usual" | "official" | "temp" | "secondary";
}

export interface FhirReference {
  reference: string;
  display?: string;
  type?: string;
}

export interface FhirPeriod {
  start?: string;
  end?: string;
}

export interface FhirQuantity {
  value: number;
  unit: string;
  system?: string;
  code?: string;
}

// FHIR Patient Resource
export interface FhirPatient {
  resourceType: "Patient";
  id: string;
  identifier?: FhirIdentifier[];
  active: boolean;
  name?: Array<{
    use?: string;
    text?: string;
    family?: string;
    given?: string[];
  }>;
  telecom?: Array<{
    system: "phone" | "email";
    value: string;
    use?: "home" | "mobile" | "work";
  }>;
  gender?: "male" | "female" | "other" | "unknown";
  birthDate?: string;
  address?: Array<{
    text?: string;
    city?: string;
    state?: string;
    country?: string;
  }>;
}

// FHIR Encounter Resource
export interface FhirEncounter {
  resourceType: "Encounter";
  id: string;
  status: "planned" | "arrived" | "triaged" | "in-progress" | "onleave" | "finished" | "cancelled";
  class: {
    system: string;
    code: string;
    display: string;
  };
  priority?: FhirCodeableConcept;
  subject: FhirReference;
  participant?: Array<{
    individual?: FhirReference;
  }>;
  period?: FhirPeriod;
  serviceType?: FhirCodeableConcept;
  reasonCode?: FhirCodeableConcept[];
}

// FHIR Condition Resource
export interface FhirCondition {
  resourceType: "Condition";
  id: string;
  clinicalStatus?: FhirCodeableConcept;
  verificationStatus?: FhirCodeableConcept;
  category?: FhirCodeableConcept[];
  severity?: FhirCodeableConcept;
  code: FhirCodeableConcept;
  subject: FhirReference;
  onsetDateTime?: string;
  recordedDate?: string;
}

// FHIR MedicationRequest Resource
export interface FhirMedicationRequest {
  resourceType: "MedicationRequest";
  id: string;
  status: "active" | "on-hold" | "cancelled" | "completed" | "entered-in-error" | "stopped" | "draft" | "unknown";
  intent: "proposal" | "plan" | "order" | "original-order" | "reflex-order" | "filler-order" | "instance-order" | "option";
  medicationCodeableConcept: FhirCodeableConcept;
  subject: FhirReference;
  authoredOn?: string;
  dosageInstruction?: Array<{
    text?: string;
    timing?: {
      repeat?: {
        frequency?: number;
        period?: number;
        periodUnit?: string;
      };
    };
  }>;
}

// FHIR Observation Resource
export interface FhirObservation {
  resourceType: "Observation";
  id: string;
  status: "registered" | "preliminary" | "final" | "amended";
  category?: FhirCodeableConcept[];
  code: FhirCodeableConcept;
  subject: FhirReference;
  effectiveDateTime?: string;
  valueString?: string;
  valueQuantity?: FhirQuantity;
  valueCodeableConcept?: FhirCodeableConcept;
  interpretation?: FhirCodeableConcept[];
}

// FHIR DiagnosticReport Resource
export interface FhirDiagnosticReport {
  resourceType: "DiagnosticReport";
  id: string;
  status: "registered" | "partial" | "preliminary" | "final";
  category?: FhirCodeableConcept[];
  code: FhirCodeableConcept;
  subject: FhirReference;
  effectiveDateTime?: string;
  issued?: string;
  conclusion?: string;
  presentedForm?: Array<{
    contentType: string;
    title?: string;
    data?: string;
  }>;
}

// FHIR Composition Resource (ABDM OPD Record document manifest)
export interface FhirComposition {
  resourceType: "Composition";
  id: string;
  status: "preliminary" | "final" | "amended" | "entered-in-error";
  type: FhirCodeableConcept;
  category?: FhirCodeableConcept[];
  subject: FhirReference;
  encounter?: FhirReference;
  date: string;
  author: FhirReference[];
  title: string;
  section: Array<{
    title: string;
    code?: FhirCodeableConcept;
    text?: {
      status: "generated" | "extensions" | "additional" | "empty";
      div: string;
    };
    entry?: FhirReference[];
  }>;
}

// FHIR Consent Resource
export interface FhirConsent {
  resourceType: "Consent";
  id: string;
  status: "draft" | "proposed" | "active" | "rejected" | "inactive" | "entered-in-error";
  scope: FhirCodeableConcept;
  category: FhirCodeableConcept[];
  patient: FhirReference;
  dateTime?: string;
  performer?: FhirReference[];
  policyRule?: FhirCodeableConcept;
  provision?: {
    type?: "deny" | "permit";
    period?: FhirPeriod;
    purpose?: FhirCoding[];
  };
}

export type FhirResource =
  | FhirPatient
  | FhirEncounter
  | FhirCondition
  | FhirMedicationRequest
  | FhirObservation
  | FhirDiagnosticReport
  | FhirComposition
  | FhirConsent;

export interface FhirBundleEntry {
  fullUrl: string;
  resource: FhirResource;
}

export interface FhirBundle {
  resourceType: "Bundle";
  id: string;
  meta?: {
    lastUpdated: string;
    versionId?: string;
  };
  identifier?: FhirIdentifier;
  type: "document" | "collection" | "transaction" | "batch";
  timestamp: string;
  total?: number;
  entry: FhirBundleEntry[];
}
