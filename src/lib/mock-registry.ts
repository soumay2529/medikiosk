/**
 * Mock hospital-internal biometric registry for opt-in emergency identification.
 * 
 * IMPORTANT COMPLIANCE NOTICE:
 * This represents a local, opt-in hospital patient index only.
 * It is NOT connected to any national identity systems (e.g. Aadhaar).
 * Under DPDP Act 2023, enrollment is strictly consensual and revocable.
 */

export interface EnrolledPatient {
  id: string;
  name: string;
  age: number;
  sex: "male" | "female" | "other";
  abha_id: string;
  masked_abha: string;
  phone: string;
  allergies: string[];
  medications: string[];
  chronicConditions: string[];
  emergencyContact: string;
  faceEnrolled: boolean;
  confidenceScore: number; // e.g. 0.91 (91%)
}

export const MOCK_HOSPITAL_FACE_REGISTRY: EnrolledPatient[] = [
  {
    id: "PAT-DEL-8842",
    name: "Rameshwar Prasad Patel",
    age: 56,
    sex: "male",
    abha_id: "14-8842-9011-3421",
    masked_abha: "XX-XXXX-XXXX-3421",
    phone: "+91 98101 23456",
    allergies: ["Penicillin (Severe Urticaria / Anaphylaxis risk)"],
    medications: ["Metformin 500mg BD", "Telmisartan 40mg OD"],
    chronicConditions: ["Acute Coronary Syndrome Risk", "Type 2 Diabetes Mellitus", "Essential Hypertension"],
    emergencyContact: "Sunita Patel (Wife) - +91 98101 44522",
    faceEnrolled: true,
    confidenceScore: 0.92,
  },
  {
    id: "PAT-CHE-1049",
    name: "Kalyani Meenakshi Sundaram",
    age: 62,
    sex: "female",
    abha_id: "22-4512-8874-9912",
    masked_abha: "XX-XXXX-XXXX-9912",
    phone: "+91 94441 23456",
    allergies: ["Sulfa Antibiotics", "Aspirin (Bronchospasm)"],
    medications: ["Yogaraj Guggulu 2 tabs BD", "Shallaki 500mg OD"],
    chronicConditions: ["Sandhivata (Severe Osteoarthritis)", "Mild Hypertension"],
    emergencyContact: "Sundaram (Son) - +91 94441 23457",
    faceEnrolled: true,
    confidenceScore: 0.94,
  },
  {
    id: "PAT-AIIMS-4092",
    name: "Vikramjit Singh Chadha",
    age: 38,
    sex: "male",
    abha_id: "31-9042-7714-8023",
    masked_abha: "XX-XXXX-XXXX-8023",
    phone: "+91 98110 55678",
    allergies: ["NSAIDs (Ibuprofen / Diclofenac allergy)"],
    medications: ["Levothyroxine 50mcg OD"],
    chronicConditions: ["Primary Hypothyroidism", "Extrinsic Asthma"],
    emergencyContact: "Harpreet Kaur (Spouse) - +91 98110 55679",
    faceEnrolled: true,
    confidenceScore: 0.89,
  },
];
