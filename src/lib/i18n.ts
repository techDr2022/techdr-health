import { SPECIALTIES } from "@/data/specialties";

export type AppLanguage = "en" | "hi" | "te";

export const LANG_STORAGE_KEY = "techdr-health-lang";

export const LANGUAGE_OPTIONS: Array<{
  code: AppLanguage;
  label: string;
  nativeLabel: string;
  speechLocale: string;
}> = [
  { code: "en", label: "EN", nativeLabel: "English", speechLocale: "en-IN" },
  { code: "hi", label: "हि", nativeLabel: "हिंदी", speechLocale: "hi-IN" },
  { code: "te", label: "తె", nativeLabel: "తెలుగు", speechLocale: "te-IN" },
];

const LANGUAGE_SET = new Set<AppLanguage>(["en", "hi", "te"]);

export function normalizeLanguage(value?: string | null): AppLanguage {
  const code = (value || "en").trim().toLowerCase();
  if (LANGUAGE_SET.has(code as AppLanguage)) return code as AppLanguage;
  return "en";
}

export function getStoredLanguage(): AppLanguage {
  if (typeof window === "undefined") return "en";
  return normalizeLanguage(localStorage.getItem(LANG_STORAGE_KEY));
}

export function storeLanguage(language: AppLanguage) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LANG_STORAGE_KEY, language);
}

const UI = {
  en: {
    healthGuideTitle: "HealthGuide",
    healthGuideSubtitle: "Navigation & triage · not a diagnosis tool",
    chatWelcome:
      "Hi! I can help you understand symptoms and find the right specialist. What brings you here today?",
    chatPlaceholder: "Describe your concern...",
    chatTyping: "HealthGuide is typing...",
    talkToDoctor: "Talk to a real doctor",
    browseDoctors: "Browse doctors manually →",
    bookConsultation: "Book a Consultation →",
    consultSpecialist: "Consult a specialist",
    sendMessage: "Send message",
    openChat: "Open health assistant chat",
    closeChat: "Close chat",
    symptomCheckerTitle: "AI Symptom Checker",
    symptomCheckerSubtitle:
      "Describe how you feel — we'll suggest the right specialist. Not a diagnosis tool.",
    symptomsLabel: "What symptoms are you experiencing?",
    symptomsPlaceholder: "e.g. Persistent headache for 3 days, sensitivity to light, mild nausea...",
    ageLabel: "Age (optional)",
    genderLabel: "Gender (optional)",
    genderPlaceholder: "e.g. Female",
    findDoctors: "Find matching doctors",
    analysing: "Analysing your symptoms...",
    analysingHint: "This usually takes a few seconds",
    recommendedDoctors: "Recommended doctors",
    bookNow: "Book Now",
    checkDifferent: "Check different symptoms",
    browseAll: "Browse all specialists",
    noDoctors: "No matching doctors available right now.",
    emergencyTitle: "Emergency attention may be needed",
    emergencyBanner:
      "If you are experiencing a medical emergency, call 112 or go to the nearest emergency room immediately.",
    emergencyHelpline: "India emergency helpline: 112",
    urgencyEmergency: "Emergency",
    urgencyUrgent: "Urgent",
    urgencyRoutine: "Routine",
    consentRequired: "Please acknowledge the AI data processing notice before continuing.",
    symptomsTooShort: "Please describe your symptoms in at least 10 characters.",
    aiUnavailable: "AI assistant is temporarily unavailable.",
    chatUnavailable: "Unable to reach the assistant. Please try again.",
    symptomUnavailable: "Unable to analyse symptoms right now. Please try again or browse doctors manually.",
    voiceStart: "Start voice input",
    voiceStop: "Stop voice input",
    voiceListening: "Listening…",
  },
  hi: {
    healthGuideTitle: "हेल्थगाइड",
    healthGuideSubtitle: "मार्गदर्शन और ट्राइएज · निदान उपकरण नहीं",
    chatWelcome:
      "नमस्ते! मैं आपके लक्षण समझने और सही विशेषज्ञ खोजने में मदद कर सकता/सकती हूँ। आज आप किस समस्या के लिए यहाँ हैं?",
    chatPlaceholder: "अपनी समस्या बताएँ...",
    chatTyping: "हेल्थगाइड जवाब लिख रहा/रही है...",
    talkToDoctor: "वास्तविक डॉक्टर से बात करें",
    browseDoctors: "डॉक्टर मैन्युअली देखें →",
    bookConsultation: "परामर्श बुक करें →",
    consultSpecialist: "विशेषज्ञ से परामर्श करें",
    sendMessage: "संदेश भेजें",
    openChat: "हेल्थ असिस्टेंट चैट खोलें",
    closeChat: "चैट बंद करें",
    symptomCheckerTitle: "AI लक्षण जाँच",
    symptomCheckerSubtitle:
      "बताएँ आप कैसा महसूस कर रहे हैं — हम सही विशेषज्ञ सुझाएँगे। यह निदान उपकरण नहीं है।",
    symptomsLabel: "आपको कौन से लक्षण हैं?",
    symptomsPlaceholder: "उदा. 3 दिन से लगातार बुखार और सिरदर्द...",
    ageLabel: "उम्र (वैकल्पिक)",
    genderLabel: "लिंग (वैकल्पिक)",
    genderPlaceholder: "उदा. महिला",
    findDoctors: "मेल खाते डॉक्टर खोजें",
    analysing: "आपके लक्षणों का विश्लेषण हो रहा है...",
    analysingHint: "आमतौर पर कुछ सेकंड लगते हैं",
    recommendedDoctors: "सुझाए गए डॉक्टर",
    bookNow: "अभी बुक करें",
    checkDifferent: "दूसरे लक्षण जाँचें",
    browseAll: "सभी विशेषज्ञ देखें",
    noDoctors: "अभी कोई मेल खाता डॉक्टर उपलब्ध नहीं है।",
    emergencyTitle: "आपातकालीन ध्यान की आवश्यकता हो सकती है",
    emergencyBanner:
      "यदि आप आपातकालीन स्थिति में हैं, तो 112 पर कॉल करें या नज़दीकी आपातकालीन कक्ष जाएँ।",
    emergencyHelpline: "भारत आपातकालीन हेल्पलाइन: 112",
    urgencyEmergency: "आपातकाल",
    urgencyUrgent: "तत्काल",
    urgencyRoutine: "सामान्य",
    consentRequired: "जारी रखने से पहले AI डेटा प्रसंस्करण सूचना स्वीकार करें।",
    symptomsTooShort: "कृपया कम से कम 10 अक्षरों में लक्षण बताएँ।",
    aiUnavailable: "AI असिस्टेंट अस्थायी रूप से उपलब्ध नहीं है।",
    chatUnavailable: "असिस्टेंट तक पहुँच नहीं हो पाई। कृपया पुनः प्रयास करें।",
    symptomUnavailable:
      "अभी लक्षणों का विश्लेषण नहीं हो सका। पुनः प्रयास करें या डॉक्टर मैन्युअली देखें।",
    voiceStart: "वॉइस इनपुट शुरू करें",
    voiceStop: "वॉइस इनपुट बंद करें",
    voiceListening: "सुन रहे हैं…",
  },
  te: {
    healthGuideTitle: "హెల్త్‌గైడ్",
    healthGuideSubtitle: "మార్గదర్శకత్వం · నిర్ధారణ సాధనం కాదు",
    chatWelcome:
      "నమస్కారం! మీ లక్షణాలు అర్థం చేసుకోవడానికి మరియు సరైన నిపుణుడిని కనుగొనడానికి నేను సహాయం చేయగలను. ఈరోజు మీ సమస్య ఏమిటి?",
    chatPlaceholder: "మీ సమస్యను వివరించండి...",
    chatTyping: "హెల్త్‌గైడ్ టైప్ చేస్తోంది...",
    talkToDoctor: "నిజమైన డాక్టర్‌తో మాట్లాడండి",
    browseDoctors: "డాక్టర్లను మాన్యువల్‌గా చూడండి →",
    bookConsultation: "సంప్రదింపు బుక్ చేయండి →",
    consultSpecialist: "నిపుణుడిని సంప్రదించండి",
    sendMessage: "సందేశం పంపండి",
    openChat: "హెల్త్ అసిస్టెంట్ చాట్ తెరవండి",
    closeChat: "చాట్ మూసివేయండి",
    symptomCheckerTitle: "AI లక్షణ తనిఖీ",
    symptomCheckerSubtitle:
      "మీరు ఎలా feel అవుతున్నారో చెప్పండి — సరైన నిపుణుడిని సూచిస్తాము. ఇది నిర్ధారణ సాధనం కాదు.",
    symptomsLabel: "మీకు ఏ లక్షణాలు ఉన్నాయి?",
    symptomsPlaceholder: "ఉదా. 3 రోజులుగా తలనొప్పి మరియు జ్వరం...",
    ageLabel: "వయస్సు (ఐచ్ఛికం)",
    genderLabel: "లింగం (ఐచ్ఛికం)",
    genderPlaceholder: "ఉదా. స్త్రీ",
    findDoctors: "సరిపోయే డాక్టర్లను కనుగొనండి",
    analysing: "మీ లక్షణాలను విశ్లేషిస్తున్నాము...",
    analysingHint: "ఇది సాధారణంగా కొన్ని సెకన్లు పడుతుంది",
    recommendedDoctors: "సిఫార్సు చేసిన డాక్టర్లు",
    bookNow: "ఇప్పుడే బుక్ చేయండి",
    checkDifferent: "వేరే లక్షణాలను తనిఖీ చేయండి",
    browseAll: "అన్ని నిపుణులను చూడండి",
    noDoctors: "ప్రస్తుతం సరిపోయే డాక్టర్లు లేరు.",
    emergencyTitle: "అత్యవసర సంరక్షణ అవసరం కావచ్చు",
    emergencyBanner:
      "మీకు వైద్య అత్యవసర పరిస్థితి ఉంటే 112కి కాల్ చేయండి లేదా సమీప ఎమర్జెన్సీ రూమ్‌కి వెళ్లండి.",
    emergencyHelpline: "భారత అత్యవసర హెల్ప్‌లైన్: 112",
    urgencyEmergency: "అత్యవసర",
    urgencyUrgent: "అత్యవసరమైన",
    urgencyRoutine: "సాధారణ",
    consentRequired: "కొనసాగించే ముందు AI డేటా ప్రాసెసింగ్ నోటీస్‌ను అంగీకరించండి.",
    symptomsTooShort: "దయచేసి కనీసం 10 అక్షరాల్లో లక్షణాలు చెప్పండి.",
    aiUnavailable: "AI అసిస్టెంట్ తాత్కాలికంగా అందుబాటులో లేదు.",
    chatUnavailable: "అసిస్టెంట్‌ను సంప్రదించలేకపోయాము. మళ్లీ ప్రయత్నించండి.",
    symptomUnavailable:
      "ఇప్పుడు లక్షణాలను విశ్లేషించలేకపోయాము. మళ్లీ ప్రయత్నించండి లేదా డాక్టర్లను చూడండి.",
    voiceStart: "వాయిస్ ఇన్‌పుట్ ప్రారంభించండి",
    voiceStop: "వాయిస్ ఇన్‌పుట్ ఆపండి",
    voiceListening: "వింటున్నాము…",
  },
} as const;

export type UiStringKey = keyof typeof UI.en;

export function t(language: AppLanguage, key: UiStringKey): string {
  return UI[language][key] ?? UI.en[key];
}

const LANGUAGE_INSTRUCTIONS: Record<AppLanguage, string> = {
  en: "Always respond in English using simple, non-medical vocabulary.",
  hi: "हमेशा हिंदी में जवाब दें। देवनागरी लिपि का उपयोग करें। सरल, गैर-चिकित्सा शब्दावली रखें।",
  te: "ఎప్పుడూ తెలుగులో సమాధానం ఇవ్వండి. తెలుగు లిపిని ఉపయోగించండి. సరళమైన, వైద్యం కాని పదజాలం వాడండి.",
};

export function buildHealthChatSystemPrompt(language: AppLanguage, specialtyNames: string) {
  return `You are HealthGuide, a helpful medical navigation assistant for TechDrHealth (India telemedicine platform).
You help patients understand their symptoms and decide whether they need a consultation.
You DO NOT diagnose. You DO triage urgency and recommend the right specialist.
Always end responses with a clear next step: book a consultation, go to ER, or monitor at home.
If symptoms suggest emergency, recommend calling 112 or emergency services immediately.
Keep responses concise (under 150 words). Be warm, clear, and reassuring.

Language rule: ${LANGUAGE_INSTRUCTIONS[language]}

Available specialties (use English names in suggestedSpecialty for booking): ${specialtyNames}

Return JSON: { "reply": string, "suggestBooking": boolean, "suggestedSpecialty": string | null }`;
}

export function buildSymptomCheckSystemPrompt(language: AppLanguage, specialtyNames: string) {
  return `You are a medical triage assistant for TechDrHealth, a telemedicine platform in India.
Given patient symptoms, identify the most relevant medical specialties and urgency level.

Rules:
- Map symptoms to 1-3 specialties from this list when possible: ${specialtyNames}
- specialties array must use exact English names from the list above (for doctor matching)
- localizedSpecialtyLabels: same specialties translated for patient display in the target language
- urgencyLevel must be one of: emergency, urgent, routine
- emergency: life-threatening signs
- urgent: needs consultation within 24-48 hours
- routine: can wait for scheduled teleconsultation
- reasoning: 2-3 sentences for the patient in the target language
- You do NOT diagnose — you suggest which specialist to consult

Language rule: ${LANGUAGE_INSTRUCTIONS[language]}
Write reasoning and localizedSpecialtyLabels in the patient's language. Keep specialties in English.

Return JSON: {
  "specialties": string[],
  "localizedSpecialtyLabels": string[],
  "urgencyLevel": "emergency"|"urgent"|"routine",
  "reasoning": string
}`;
}

export function getSpecialtyDisplayNames(
  specialties: string[],
  localizedLabels: string[] | undefined,
  language: AppLanguage
) {
  if (language !== "en" && localizedLabels?.length === specialties.length) {
    return localizedLabels;
  }
  return specialties;
}

export const SPECIALTY_NAMES = SPECIALTIES.map((item) => item.name).join(", ");
