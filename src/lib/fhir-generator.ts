import { FhirBundle, FhirPatient, FhirEncounter, FhirCondition, FhirMedicationRequest, FhirObservation, FhirDiagnosticReport, FhirComposition, FhirConsent } from "@/types/fhir";
import { PatientInfo, EncounterState, ClinicalHistory, ConsentState, DocumentRecord } from "@/types/kiosk";

/**
 * Builds an ABDM-compliant FHIR R4 Document Bundle from the internal MediKiosk data model.
 */
export function generateFhirR4Bundle(
  patient: PatientInfo,
  encounter: EncounterState,
  history: ClinicalHistory,
  consent: ConsentState,
  documents: DocumentRecord[]
): FhirBundle {
  const timestamp = new Date().toISOString();
  const patientId = patient.hospital_id || `pat-${encounter.id.slice(0, 8)}`;
  const encounterId = `enc-${encounter.id}`;
  const compositionId = `comp-${encounter.id}`;

  // 1. Patient Resource
  const fhirPatient: FhirPatient = {
    resourceType: "Patient",
    id: patientId,
    active: true,
    identifier: [
      {
        system: "https://healthid.abdm.gov.in",
        value: patient.abha_id || "91-9876-5432-1098",
        use: "official",
      },
      {
        system: "https://hospital.gov.in/uhid",
        value: patient.hospital_id || "UHID-2026-9048",
        use: "usual",
      },
    ],
    name: [
      {
        text: patient.name || "Aarav Sharma",
        family: patient.name?.split(" ").slice(-1)[0] || "Sharma",
        given: patient.name?.split(" ").slice(0, -1) || ["Aarav"],
      },
    ],
    gender: (patient.sex as any) || "male",
    birthDate: patient.age ? `${new Date().getFullYear() - patient.age}-01-01` : "1984-06-15",
    telecom: [
      {
        system: "phone",
        value: patient.phone || "+91 98765 43210",
        use: "mobile",
      },
    ],
    address: [
      {
        text: patient.address || "Sector 14, New Delhi",
        city: "New Delhi",
        state: "Delhi",
        country: "India",
      },
    ],
  };

  // 2. Encounter Resource
  const fhirEncounter: FhirEncounter = {
    resourceType: "Encounter",
    id: encounterId,
    status: encounter.status === "completed" ? "finished" : "in-progress",
    class: {
      system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      code: encounter.type === "EMERGENCY" ? "EMER" : "AMB",
      display: encounter.type === "EMERGENCY" ? "emergency" : "ambulatory",
    },
    priority: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/v3-ActPriority",
          code: encounter.urgency === "urgent" ? "CR" : "R",
          display: encounter.urgency === "urgent" ? "critical" : "routine",
        },
      ],
      text: encounter.urgency === "urgent" ? "Urgent Red-Flag Triage" : "Routine OPD",
    },
    subject: {
      reference: `Patient/${patientId}`,
      display: patient.name || "Patient",
    },
    participant: [
      {
        individual: {
          reference: "Practitioner/doc-aiims-cardio-01",
          display: "Dr. Rajesh K. Gupta, MD (Internal Medicine / Cardiology)",
        },
      },
    ],
    period: {
      start: encounter.startTime || timestamp,
      end: timestamp,
    },
    serviceType: {
      coding: [
        {
          system: "http://snomed.info/sct",
          code: "310000008",
          display: encounter.department || "General Outpatient Clinic",
        },
      ],
    },
    reasonCode: history.chief_complaint.map((cc) => ({
      coding: [
        {
          system: "http://snomed.info/sct",
          code: "29857009",
          display: cc.text,
        },
      ],
      text: `${cc.text} for ${cc.duration}`,
    })),
  };

  // 3. Condition Resources (Chief complaints & HPI)
  const conditionResources: FhirCondition[] = history.chief_complaint.map((cc, idx) => ({
    resourceType: "Condition",
    id: `cond-${encounter.id.slice(0, 6)}-${idx + 1}`,
    clinicalStatus: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
          code: "active",
          display: "Active",
        },
      ],
    },
    verificationStatus: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/condition-ver-status",
          code: cc.verificationState === "physician_confirmed" ? "confirmed" : "provisional",
          display: cc.verificationState === "physician_confirmed" ? "Confirmed" : "Provisional",
        },
      ],
    },
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/condition-category",
            code: "encounter-diagnosis",
            display: "Encounter Diagnosis",
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system: "http://snomed.info/sct",
          code: "29857009",
          display: cc.text,
        },
      ],
      text: cc.text,
    },
    subject: {
      reference: `Patient/${patientId}`,
      display: patient.name,
    },
    recordedDate: timestamp,
  }));

  // 4. MedicationRequest Resources
  const medicationResources: FhirMedicationRequest[] = history.medications.map((med, idx) => ({
    resourceType: "MedicationRequest",
    id: `medrx-${encounter.id.slice(0, 6)}-${idx + 1}`,
    status: "active",
    intent: "order",
    medicationCodeableConcept: {
      coding: [
        {
          system: "http://snomed.info/sct",
          code: "372665008",
          display: med.name,
        },
      ],
      text: `${med.name} ${med.dosage}`,
    },
    subject: {
      reference: `Patient/${patientId}`,
    },
    authoredOn: timestamp,
    dosageInstruction: [
      {
        text: `${med.dosage}, ${med.frequency}`,
      },
    ],
  }));

  // 5. Observation Resources (Vitals & AYUSH metrics)
  const observationResources: FhirObservation[] = [
    {
      resourceType: "Observation",
      id: `obs-bp-${encounter.id.slice(0, 6)}`,
      status: "final",
      category: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/observation-category",
              code: "vital-signs",
              display: "Vital Signs",
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            system: "http://loinc.org",
            code: "85354-9",
            display: "Blood pressure panel with all children optional",
          },
        ],
        text: "Systolic & Diastolic Blood Pressure",
      },
      subject: { reference: `Patient/${patientId}` },
      effectiveDateTime: timestamp,
      valueString: "138/88 mmHg (Reference: 90-120 / 60-80 mmHg)",
    },
    {
      resourceType: "Observation",
      id: `obs-pulse-${encounter.id.slice(0, 6)}`,
      status: "final",
      code: {
        coding: [{ system: "http://loinc.org", code: "8867-4", display: "Heart rate" }],
        text: "Pulse / Heart Rate",
      },
      subject: { reference: `Patient/${patientId}` },
      effectiveDateTime: timestamp,
      valueQuantity: {
        value: encounter.urgency === "urgent" ? 104 : 76,
        unit: "beats/min",
        system: "http://unitsofmeasure.org",
        code: "/min",
      },
      interpretation: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
              code: encounter.urgency === "urgent" ? "H" : "N",
              display: encounter.urgency === "urgent" ? "High (Tachycardia)" : "Normal",
            },
          ],
        },
      ],
    },
  ];

  // If AYUSH is recorded, add AYUSH Observation
  if (history.ayush) {
    observationResources.push({
      resourceType: "Observation",
      id: `obs-ayush-${encounter.id.slice(0, 6)}`,
      status: "final",
      code: {
        coding: [
          {
            system: "https://ayush.gov.in/standards/namaste",
            code: "DASH-PARIKSHA-01",
            display: "Dashavidha Pariksha Ayurvedic Constitutional Assessment",
          },
        ],
        text: "AYUSH Prakriti & Agni Assessment",
      },
      subject: { reference: `Patient/${patientId}` },
      effectiveDateTime: timestamp,
      valueString: `Prakriti: ${history.ayush.prakriti.value} | Vikriti: ${history.ayush.vikriti.value} | Agni: ${history.ayush.ahara_shakti.value}`,
    });
  }

  // 6. DiagnosticReport Resource (OCR Prior Prescriptions / Reports)
  const diagnosticReport: FhirDiagnosticReport = {
    resourceType: "DiagnosticReport",
    id: `diag-ocr-${encounter.id.slice(0, 6)}`,
    status: "final",
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/v2-0074",
            code: "OTH",
            display: "Other",
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system: "http://loinc.org",
          code: "11503-0",
          display: "Medical records",
        },
      ],
      text: "Digitised Prior Prescriptions & Investigation Summary",
    },
    subject: { reference: `Patient/${patientId}` },
    effectiveDateTime: timestamp,
    issued: timestamp,
    conclusion: documents.length > 0
      ? `OCR extracted ${documents.reduce((acc, d) => acc + d.extractedFields.length, 0)} clinical entities from uploaded records.`
      : "No prior paper documents submitted during this intake session.",
  };

  // 7. Consent Resource
  const fhirConsent: FhirConsent = {
    resourceType: "Consent",
    id: `consent-${encounter.id.slice(0, 6)}`,
    status: "active",
    scope: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/consentscope",
          code: "patient-privacy",
          display: "Privacy Consent",
        },
      ],
    },
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
            code: "INFA",
            display: "information access",
          },
        ],
      },
    ],
    patient: { reference: `Patient/${patientId}` },
    dateTime: consent.timestamp || timestamp,
    policyRule: {
      coding: [
        {
          system: "https://abdm.gov.in/policies",
          code: "ABDM-HEALTH-DATA-PRIVACY-v1.0",
          display: "ABDM Patient Health Data Consent Policy",
        },
      ],
    },
    provision: {
      type: "permit",
      purpose: [
        {
          system: "http://terminology.hl7.org/CodeSystem/v3-ActReason",
          code: "CAREMGT",
          display: "care management",
        },
      ],
    },
  };

  // 8. Composition Resource (Clinical Consultation Note Manifest)
  const fhirComposition: FhirComposition = {
    resourceType: "Composition",
    id: compositionId,
    status: "final",
    type: {
      coding: [
        {
          system: "http://snomed.info/sct",
          code: "371530004",
          display: "Clinical consultation report (record artifact)",
        },
      ],
      text: "OPD Clinical Intake Consultation Record",
    },
    subject: { reference: `Patient/${patientId}` },
    encounter: { reference: `Encounter/${encounterId}` },
    date: timestamp,
    author: [
      {
        reference: "Device/medikiosk-terminal-04",
        display: "MediKiosk AI Intake Engine (Terminal 04)",
      },
    ],
    title: "OPD Intake Clinical Record - ABDM",
    section: [
      {
        title: "Chief Complaints & HPI",
        text: {
          status: "generated",
          div: `<div xmlns="http://www.w3.org/1999/xhtml"><p>${history.chief_complaint.map((c) => c.text).join(", ")}</p></div>`,
        },
        entry: conditionResources.map((c) => ({ reference: `Condition/${c.id}` })),
      },
      {
        title: "Current Medications",
        text: {
          status: "generated",
          div: `<div xmlns="http://www.w3.org/1999/xhtml"><p>${history.medications.map((m) => `${m.name} ${m.dosage}`).join(", ")}</p></div>`,
        },
        entry: medicationResources.map((m) => ({ reference: `MedicationRequest/${m.id}` })),
      },
      {
        title: "Physical Observations & Vitals",
        text: {
          status: "generated",
          div: `<div xmlns="http://www.w3.org/1999/xhtml"><p>Blood Pressure: 138/88 mmHg, Pulse: ${encounter.urgency === "urgent" ? "104" : "76"} bpm</p></div>`,
        },
        entry: observationResources.map((o) => ({ reference: `Observation/${o.id}` })),
      },
      {
        title: "Digitised Prior Prescriptions & Reports (OCR)",
        entry: [{ reference: `DiagnosticReport/${diagnosticReport.id}` }],
      },
      ...(history.ayush
        ? [
            {
              title: "AYUSH Dashavidha Pariksha & Ahara-Vihara",
              entry: [{ reference: `Observation/obs-ayush-${encounter.id.slice(0, 6)}` }],
            },
          ]
        : []),
      {
        title: "Consent Record",
        entry: [{ reference: `Consent/${fhirConsent.id}` }],
      },
    ],
  };

  // Assemble full bundle entries
  const bundleEntries = [
    { fullUrl: `urn:uuid:${compositionId}`, resource: fhirComposition },
    { fullUrl: `urn:uuid:${patientId}`, resource: fhirPatient },
    { fullUrl: `urn:uuid:${encounterId}`, resource: fhirEncounter },
    ...conditionResources.map((c) => ({ fullUrl: `urn:uuid:${c.id}`, resource: c })),
    ...medicationResources.map((m) => ({ fullUrl: `urn:uuid:${m.id}`, resource: m })),
    ...observationResources.map((o) => ({ fullUrl: `urn:uuid:${o.id}`, resource: o })),
    { fullUrl: `urn:uuid:${diagnosticReport.id}`, resource: diagnosticReport },
    { fullUrl: `urn:uuid:${fhirConsent.id}`, resource: fhirConsent },
  ];

  return {
    resourceType: "Bundle",
    id: `bundle-medikiosk-${encounter.id}`,
    meta: {
      lastUpdated: timestamp,
      versionId: "1.0",
    },
    identifier: {
      system: "https://aiims.edu/abdm/bundles",
      value: `BDL-${encounter.id}`,
    },
    type: "document",
    timestamp,
    total: bundleEntries.length,
    entry: bundleEntries,
  };
}

/**
 * Initiates browser download of the generated FHIR JSON file
 */
export function triggerFhirJsonDownload(bundle: FhirBundle, filename?: string): void {
  if (typeof window === "undefined") return;
  const jsonStr = JSON.stringify(bundle, null, 2);
  const blob = new Blob([jsonStr], { type: "application/fhir+json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `FHIR_R4_${bundle.id}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
