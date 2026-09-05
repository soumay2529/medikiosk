import { FhirBundle } from "@/types/fhir";

export interface FhirValidationReport {
  isValid: boolean;
  totalResources: number;
  resourceTypeCounts: Record<string, number>;
  requiredResourcesChecked: {
    resourceType: string;
    present: boolean;
    count: number;
  }[];
  referenceIntegrityPass: boolean;
  errors: string[];
  warnings: string[];
}

export const MANDATORY_FHIR_RESOURCES = [
  "Patient",
  "Encounter",
  "Condition",
  "MedicationRequest",
  "Observation",
  "DiagnosticReport",
  "Composition",
  "Consent",
];

/**
 * Validates that an ABDM FHIR R4 document bundle is structurally complete
 * and conforms to required interoperability profiles.
 */
export function validateFhirBundle(bundle: FhirBundle): FhirValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const counts: Record<string, number> = {};

  if (!bundle || bundle.resourceType !== "Bundle") {
    return {
      isValid: false,
      totalResources: 0,
      resourceTypeCounts: {},
      requiredResourcesChecked: MANDATORY_FHIR_RESOURCES.map((r) => ({ resourceType: r, present: false, count: 0 })),
      referenceIntegrityPass: false,
      errors: ["Invalid bundle: Missing root 'Bundle' resourceType."],
      warnings: [],
    };
  }

  if (!bundle.entry || !Array.isArray(bundle.entry)) {
    return {
      isValid: false,
      totalResources: 0,
      resourceTypeCounts: {},
      requiredResourcesChecked: MANDATORY_FHIR_RESOURCES.map((r) => ({ resourceType: r, present: false, count: 0 })),
      referenceIntegrityPass: false,
      errors: ["Bundle must contain an 'entry' array of FHIR resources."],
      warnings: [],
    };
  }

  // Count types and collect resource IDs
  const resourceIds = new Set<string>();
  for (const entry of bundle.entry) {
    if (!entry.resource) {
      errors.push("An entry in the bundle lacks a 'resource' payload.");
      continue;
    }
    const rType = entry.resource.resourceType;
    counts[rType] = (counts[rType] || 0) + 1;

    if (entry.resource.id) {
      resourceIds.add(`${rType}/${entry.resource.id}`);
      resourceIds.add(entry.resource.id);
    } else {
      errors.push(`Resource of type ${rType} is missing a required 'id' attribute.`);
    }
  }

  // Verify mandatory resources presence
  const requiredChecked = MANDATORY_FHIR_RESOURCES.map((reqType) => {
    const count = counts[reqType] || 0;
    const present = count > 0;
    if (!present) {
      errors.push(`Missing mandatory ABDM resource: '${reqType}'`);
    }
    return { resourceType: reqType, present, count };
  });

  // Verify Composition reference integrity
  let referenceIntegrityPass = true;
  const compositionEntry = bundle.entry.find((e) => e.resource.resourceType === "Composition");
  if (compositionEntry && (compositionEntry.resource as any).section) {
    const comp = compositionEntry.resource as any;
    for (const sec of comp.section || []) {
      for (const ent of sec.entry || []) {
        if (ent.reference) {
          const rawRef = ent.reference.replace(/^urn:uuid:/, "");
          const exists = resourceIds.has(rawRef) || resourceIds.has(ent.reference);
          if (!exists) {
            warnings.push(`Composition section entry reference '${ent.reference}' does not resolve to an enclosed resource.`);
            referenceIntegrityPass = false;
          }
        }
      }
    }
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    totalResources: bundle.entry.length,
    resourceTypeCounts: counts,
    requiredResourcesChecked: requiredChecked,
    referenceIntegrityPass,
    errors,
    warnings,
  };
}
