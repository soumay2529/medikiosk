/**
 * Clinical Multilingual Entity Extractor for MediKiosk OPD Intake
 * Supports Indian English, Hindi, Hinglish, and Tamil.
 */

export interface ClinicalSymptomDefinition {
  id: string;
  name: string;
  hindiName: string;
  tamilName: string;
  category: "cardiac" | "fever" | "respiratory" | "abdominal" | "neurological" | "musculoskeletal" | "general";
  icon: string;
  isUrgentFlag?: boolean;
  keywords: string[];
}

export const CLINICAL_SYMPTOM_TAXONOMY: ClinicalSymptomDefinition[] = [
  {
    id: "chest_pain",
    name: "Chest Pain / Discomfort",
    hindiName: "छाती में दर्द / भारीपन",
    tamilName: "நெஞ்சு வலி / அழுத்தம்",
    category: "cardiac",
    icon: "🫀",
    isUrgentFlag: true,
    // STRICT: Only match when chest/cardiac region is explicitly mentioned!
    keywords: [
      "chest",
      "retrosternal",
      "angina",
      "heart",
      "cardiac",
      "chhati",
      "seena",
      "seene",
      "chhati me dard",
      "seene me dard",
      "छाती",
      "सीना",
      "सीने",
      "हार्ट",
      "நெஞ்சு",
      "மார்பு",
      "இதயம்",
    ],
  },
  {
    id: "fever",
    name: "High Fever / Chills",
    hindiName: "तेज बुखार / कंपकंपी",
    tamilName: "கடுமையான காய்ச்சல் / நடுக்கம்",
    category: "fever",
    icon: "🌡️",
    keywords: [
      "fever",
      "temperature",
      "high fever",
      "chills",
      "shivering",
      "febrile",
      "pyrexia",
      "bukhar",
      "tap",
      "kapkapi",
      "thand lagna",
      "बुखार",
      "ताप",
      "कपकपी",
      "ठंड",
      "காய்ச்சல்",
      "சூடு",
      "நடுக்கம்",
    ],
  },
  {
    id: "abdominal_pain",
    name: "Abdominal / Stomach Pain",
    hindiName: "पेट में दर्द / मरोड़",
    tamilName: "வயிற்று வலி / குமட்டல்",
    category: "abdominal",
    icon: "🤢",
    keywords: [
      "stomach",
      "abdomen",
      "abdominal",
      "belly",
      "tummy",
      "pet",
      "pet dard",
      "pet me dard",
      "marod",
      "cramps in stomach",
      "gastric",
      "gas problem",
      "acidity",
      "indigestion",
      "bloating",
      "vomit",
      "vomiting",
      "loose motions",
      "diarrhea",
      "nausea",
      "ji michlana",
      "ulti",
      "dast",
      "पेट",
      "उल्टी",
      "दस्त",
      "मरोड़",
      "गैस",
      "एसिडिटी",
      "वयிறு",
      "வயிற்று வலி",
      "வாந்தி",
      "பேதி",
    ],
  },
  {
    id: "cough_cold",
    name: "Persistent Cough & Cold",
    hindiName: "खांसी / जुकाम / कफ",
    tamilName: "இருமல் மற்றும் சளி",
    category: "respiratory",
    icon: "😷",
    keywords: [
      "cough",
      "cold",
      "khansi",
      "jukam",
      "phlegm",
      "sputum",
      "sore throat",
      "throat pain",
      "throat irritation",
      "gala kharab",
      "runny nose",
      "sneezing",
      "congestion",
      "kaf",
      "खांसी",
      "जुकाम",
      "कफ",
      "गला",
      "गले में दर्द",
      "இருமல்",
      "சளி",
      "தொண்டை வலி",
      "மூக்கடைப்பு",
    ],
  },
  {
    id: "headache",
    name: "Severe Headache / Migraine",
    hindiName: "सिर दर्द / माइग्रेन",
    tamilName: "கடுமையான தலைவலி",
    category: "neurological",
    icon: "🧠",
    keywords: [
      "headache",
      "head ache",
      "head pain",
      "migraine",
      "forehead pain",
      "sir dard",
      "sar dard",
      "sir me dard",
      "matha dard",
      "सिर",
      "सिर दर्द",
      "सर दर्द",
      "माथा",
      "माइग्रेन",
      "தலைவலி",
      "தலை வலி",
    ],
  },
  {
    id: "joint_pain",
    name: "Joint / Back Pain & Swelling",
    hindiName: "जोड़ों या कमर में दर्द",
    tamilName: "மூட்டு / முதுகு வலி",
    category: "musculoskeletal",
    icon: "🦴",
    keywords: [
      "joint",
      "knee",
      "knees",
      "back pain",
      "backache",
      "lower back",
      "spine",
      "lumbar",
      "arthritis",
      "swelling in joint",
      "stiffness",
      "shoulder pain",
      "leg pain",
      "body ache",
      "body pain",
      "kamar",
      "kamar dard",
      "ghutne",
      "ghutna",
      "jodo me dard",
      "badan dard",
      "जोड़ों",
      "घुटने",
      "कमर",
      "पीठ",
      "बदन दर्द",
      "हड्डी",
      "மூட்டு",
      "முழங்கால்",
      "முதுகு",
      "உடல் வலி",
    ],
  },
  {
    id: "shortness_of_breath",
    name: "Shortness of Breath / Dyspnea",
    hindiName: "सांस लेने में तकलीफ",
    tamilName: "மூச்சுத்திணறல்",
    category: "respiratory",
    icon: "😮‍💨",
    isUrgentFlag: true,
    keywords: [
      "short of breath",
      "shortness of breath",
      "breathless",
      "breathlessness",
      "dyspnea",
      "difficulty breathing",
      "breathing problem",
      "wheezing",
      "asthma",
      "saans phoolna",
      "saans lene me takleef",
      "dam phoolna",
      "सांस",
      "दम",
      "दम फूलना",
      "सांस फूलना",
      "மூச்சு",
      "மூச்சுத்திணறல்",
    ],
  },
  {
    id: "dizziness_weakness",
    name: "Dizziness & Extreme Weakness",
    hindiName: "चक्कर आना / अत्यधिक कमजोरी",
    tamilName: "தலைச்சுற்றல் / பலவீனம்",
    category: "neurological",
    icon: "🌀",
    keywords: [
      "dizzy",
      "dizziness",
      "lightheaded",
      "fainting",
      "vertigo",
      "weakness",
      "extreme fatigue",
      "tiredness",
      "chakkar",
      "chakkar aana",
      "kamzori",
      "kamjori",
      "behosh",
      "चक्कर",
      "कमजोरी",
      "थकान",
      "बेहोशी",
      "தலைச்சுற்றல்",
      "மயக்கம்",
      "பலவீனம்",
    ],
  },
  {
    id: "skin_rash",
    name: "Skin Rash & Itching / Allergy",
    hindiName: "त्वचा पर दाने / खुजली / एलर्जी",
    tamilName: "தோல் தடிப்பு / அரிப்பு",
    category: "general",
    icon: "🔴",
    keywords: [
      "rash",
      "itching",
      "itchy",
      "skin allergy",
      "hives",
      "red spots",
      "khujli",
      "daane",
      "khujli hona",
      "chamdi",
      "त्वचा",
      "दाने",
      "खुजली",
      "एलर्जी",
      "चकत्ते",
      "தோல்",
      "அரிப்பு",
      "தடிப்பு",
    ],
  },
];

export interface DetectedEntityResult {
  transcript: string;
  detectedSymptoms: ClinicalSymptomDefinition[];
  inferredValue: string[];
  primarySymptomText: string;
  hasRedFlagKeywords: boolean;
}

/**
 * Extracts all possible clinical entities from speech transcript text.
 * Prevents generic words like "pain" or "दर्द" from falsely forcing "Chest Pain".
 */
export function extractAllPossibleSymptoms(rawText: string): DetectedEntityResult {
  const clean = (rawText || "").trim();
  const lower = clean.toLowerCase();

  if (!clean) {
    return {
      transcript: "",
      detectedSymptoms: [],
      inferredValue: [],
      primarySymptomText: "",
      hasRedFlagKeywords: false,
    };
  }

  const detected: ClinicalSymptomDefinition[] = [];

  for (const symptom of CLINICAL_SYMPTOM_TAXONOMY) {
    // Check if any keyword matches as a substring or word
    const matched = symptom.keywords.some((kw) => {
      const kwLower = kw.toLowerCase();
      return lower.includes(kwLower);
    });

    if (matched && !detected.some((d) => d.id === symptom.id)) {
      detected.push(symptom);
    }
  }

  const symptomNames = detected.map((d) => d.name);
  const hasRedFlagKeywords = detected.some((d) => d.isUrgentFlag) ||
    lower.includes("sweat") ||
    lower.includes("पसीना") ||
    lower.includes("face droop") ||
    lower.includes("stroke");

  return {
    transcript: clean,
    detectedSymptoms: detected,
    inferredValue: symptomNames.length > 0 ? symptomNames : [clean],
    primarySymptomText: symptomNames.length > 0 ? symptomNames[0] : clean,
    hasRedFlagKeywords,
  };
}

/**
 * Specifically parses associated symptoms for red-flag and clinical characterization.
 */
export function extractAssociatedSymptoms(rawText: string): string[] {
  const lower = (rawText || "").toLowerCase();
  const detected: string[] = [];

  if (
    lower.includes("sweat") ||
    lower.includes("पसीना") ||
    lower.includes("घबराहट") ||
    lower.includes("வியர்வை") ||
    lower.includes("diaphoresis")
  ) {
    detected.push("Cold sweating / Diaphoresis");
  }

  if (
    lower.includes("breath") ||
    lower.includes("dyspnea") ||
    lower.includes("सांस") ||
    lower.includes("दम") ||
    lower.includes("மூச்சு")
  ) {
    detected.push("Shortness of breath (Dyspnea)");
  }

  if (
    lower.includes("arm") ||
    lower.includes("jaw") ||
    lower.includes("हाथ") ||
    lower.includes("बाजू") ||
    lower.includes("radiat") ||
    lower.includes("தோள்")
  ) {
    detected.push("Left Arm & Jaw Radiation");
  }

  if (
    lower.includes("vomit") ||
    lower.includes("nausea") ||
    lower.includes("उल्टी") ||
    lower.includes("जी मिचलाना") ||
    lower.includes("வாந்தி")
  ) {
    detected.push("Nausea or vomiting");
  }

  if (
    lower.includes("dizzy") ||
    lower.includes("faint") ||
    lower.includes("चक्कर") ||
    lower.includes("மயக்கம்")
  ) {
    detected.push("Dizziness / feeling faint");
  }

  if (
    lower.includes("shiver") ||
    lower.includes("chill") ||
    lower.includes("कंपकंपी") ||
    lower.includes("ठंड") ||
    lower.includes("நடுக்கம்")
  ) {
    detected.push("Chills & Rigors");
  }

  if (detected.length === 0 && rawText.trim().length > 0) {
    detected.push(rawText.trim());
  }

  return detected;
}
