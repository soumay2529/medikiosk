import { RedFlagRule } from "@/types/kiosk";

export const CLINICAL_RED_FLAG_RULES: Record<string, RedFlagRule> = {
  "RF-01": {
    ruleId: "RF-01",
    ruleName: "Acute Coronary Syndrome (ACS) Risk Criteria",
    triggerSymptoms: ["Chest Pain", "Cold Sweating (Diaphoresis)", "Dyspnea (Shortness of Breath)"],
    clinicalGuideline: "AHA/ACC & Indian Resuscitation Council Guideline for Acute Chest Discomfort. Requires STAT 12-lead ECG, Troponin I, and Bedside Echocardiography within 10 minutes.",
    recommendedDisposition: "Emergency Cardiology Triage Counter 01 / Red Corridor",
  },
  "RF-02": {
    ruleId: "RF-02",
    ruleName: "Focal Neurological Deficit (FAST Stroke Criteria)",
    triggerSymptoms: ["Facial Droop", "Arm/Leg Weakness", "Slurred Speech / Aphasia"],
    clinicalGuideline: "AHA/ASA Guidelines for Early Management of Acute Ischemic Stroke. Immediate Non-Contrast CT Brain and Stroke Team activation.",
    recommendedDisposition: "Acute Neurovascular Resuscitation Bay",
  },
  "RF-03": {
    ruleId: "RF-03",
    ruleName: "Acute Respiratory & Airway Compromise",
    triggerSymptoms: ["Stridor / Wheezing with Cyanosis", "Severe Exertional Apnea", "Altered Sensorium with Dyspnea"],
    clinicalGuideline: "National Health Authority Critical Airway Protocol. Immediate high-flow oxygen, airway maintenance, and continuous pulse oximetry.",
    recommendedDisposition: "Trauma & High-Dependency Unit (HDU)",
  },
};

/**
 * Deterministic rule evaluator for patient symptoms
 */
export function evaluateRedFlagRules(
  chiefComplaints: string[],
  associatedSymptoms: string[],
  neurologicalDeficits: string[] = []
): { hasRedFlag: boolean; matchedRule?: RedFlagRule; triggerReason?: string } {
  const combined = [
    ...chiefComplaints.map((c) => c.toLowerCase()),
    ...associatedSymptoms.map((s) => s.toLowerCase()),
    ...neurologicalDeficits.map((n) => n.toLowerCase()),
  ];

  const hasChestPain = combined.some((s) => s.includes("chest") || s.includes("छाती") || s.includes("நெஞ்சு"));
  const hasSweating = combined.some((s) => s.includes("sweat") || s.includes("पसीना") || s.includes("வியர்வை") || s.includes("diaphoresis"));
  const hasBreathlessness = combined.some((s) => s.includes("breath") || s.includes("सांस") || s.includes("மூச்சு") || s.includes("dyspnea"));
  
  const hasFaceDroop = combined.some((s) => s.includes("face droop") || s.includes("चेहरा टेढ़ा") || s.includes("முகக் கோணல்"));
  const hasArmWeakness = combined.some((s) => s.includes("arm weakness") || s.includes("हाथ में कमजोरी") || s.includes("கை பலவீனம்"));
  const hasSpeechDifficulty = combined.some((s) => s.includes("speech") || s.includes("बोली में लड़खड़ाहट") || s.includes("பேச்சு தடுமாற்றம்"));

  // Rule RF-01: Chest pain + Dyspnea OR Chest pain + Diaphoresis
  if (hasChestPain && (hasSweating || hasBreathlessness)) {
    const triggerReason = `Chest pain combined with ${hasSweating && hasBreathlessness ? "cold sweating and breathlessness" : hasSweating ? "cold sweating (diaphoresis)" : "shortness of breath (dyspnea)"}`;
    return {
      hasRedFlag: true,
      matchedRule: CLINICAL_RED_FLAG_RULES["RF-01"],
      triggerReason,
    };
  }

  // Rule RF-02: Focal Neurological Deficits (Stroke FAST)
  if (hasFaceDroop || hasArmWeakness || hasSpeechDifficulty) {
    const triggerReason = "Acute focal neurological deficit detected (Facial asymmetry, motor weakness, or speech impairment).";
    return {
      hasRedFlag: true,
      matchedRule: CLINICAL_RED_FLAG_RULES["RF-02"],
      triggerReason,
    };
  }

  // Rule RF-03: Extreme respiratory failure
  const hasStridor = combined.some((s) => s.includes("stridor") || s.includes("cyanosis") || s.includes("नीला पड़ना"));
  if (hasStridor) {
    return {
      hasRedFlag: true,
      matchedRule: CLINICAL_RED_FLAG_RULES["RF-03"],
      triggerReason: "Upper airway stridor or central cyanosis reported.",
    };
  }

  return { hasRedFlag: false };
}
