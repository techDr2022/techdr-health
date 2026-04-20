type SymptomTarget = {
  label: string;
  specialtySlug: string;
  uniqueIntro?: string;
};

export const SYMPTOM_TARGETS: Record<string, SymptomTarget> = {
  fever: {
    label: "Fever",
    specialtySlug: "general-medicine",
    uniqueIntro:
      "Persistent fever can be linked to viral infections, bacterial illnesses, dengue, typhoid, seasonal flu, or inflammatory causes. Early online triage helps you avoid delays and understand whether home care, tests, or urgent in-person treatment is needed.",
  },
  headache: {
    label: "Headache",
    specialtySlug: "neurology",
    uniqueIntro:
      "Headache patterns vary from tension headache to migraine and sinus-related pain. Online neurological screening helps identify trigger patterns, medication overuse risk, and warning signs that require immediate emergency care.",
  },
  "back-pain": {
    label: "Back Pain",
    specialtySlug: "orthopedics",
    uniqueIntro:
      "Back pain is often linked to posture strain, disc irritation, muscle spasm, or sedentary work routines. A teleconsultation can help with pain-control planning, activity modification, and early identification of nerve-compression red flags.",
  },
  "skin-rash": {
    label: "Skin Rash",
    specialtySlug: "dermatology",
    uniqueIntro:
      "Skin rashes may be allergic, fungal, bacterial, autoimmune, or irritation-based. Dermatology teleconsultation is highly effective because doctors can evaluate high-resolution photos and guide treatment quickly.",
  },
  "chest-pain": {
    label: "Chest Pain",
    specialtySlug: "cardiology",
    uniqueIntro:
      "Chest pain can arise from heart, muscle, acidity, or anxiety-related causes. Online cardiology triage helps classify urgency, but sudden severe chest pain, breathlessness, or sweating must be treated as an emergency.",
  },
  cough: {
    label: "Cough",
    specialtySlug: "pulmonology",
    uniqueIntro:
      "Short-term cough is commonly viral, but persistent cough can indicate allergy, asthma, reflux, infection, or chronic airway issues. Pulmonology teleconsultation helps decide if imaging or lung tests are necessary.",
  },
  anxiety: {
    label: "Anxiety",
    specialtySlug: "psychiatry",
    uniqueIntro:
      "Anxiety may present as racing thoughts, palpitations, poor sleep, chest tightness, or panic episodes. Online psychiatric care provides structured assessment, therapy planning, and medication support when needed.",
  },
  diabetes: {
    label: "Diabetes",
    specialtySlug: "diabetology",
    uniqueIntro:
      "Diabetes care requires regular monitoring, medicine optimization, and complication prevention. Tele diabetology helps review blood sugar trends, diet routines, and medication adherence without disrupting daily schedules.",
  },
  "hair-loss": {
    label: "Hair Loss",
    specialtySlug: "dermatology",
    uniqueIntro:
      "Hair loss can result from nutritional deficiency, hormonal changes, thyroid issues, stress, or scalp conditions. Dermatology consultation helps distinguish reversible causes from patterned hair loss.",
  },
  acne: {
    label: "Acne",
    specialtySlug: "dermatology",
    uniqueIntro:
      "Acne in teens and adults often needs a customized treatment ladder instead of trial-and-error products. Online dermatology support can reduce scarring risk with early prescription care.",
  },
  "stomach-pain": { label: "Stomach Pain", specialtySlug: "gastroenterology" },
  "joint-pain": { label: "Joint Pain", specialtySlug: "rheumatology" },
  fatigue: { label: "Fatigue", specialtySlug: "general-medicine" },
  insomnia: { label: "Insomnia", specialtySlug: "psychiatry" },
  allergies: { label: "Allergies", specialtySlug: "allergy-immunology" },
  "sore-throat": { label: "Sore Throat", specialtySlug: "ent" },
  "runny-nose": { label: "Runny Nose", specialtySlug: "ent" },
  "high-bp": { label: "High BP", specialtySlug: "cardiology" },
  "low-bp": { label: "Low BP", specialtySlug: "general-medicine" },
  "thyroid-problem": { label: "Thyroid Problem", specialtySlug: "endocrinology" },
  "pcos-symptoms": { label: "PCOS Symptoms", specialtySlug: "gynecology" },
  "period-pain": { label: "Period Pain", specialtySlug: "gynecology" },
  "uti-symptoms": { label: "UTI Symptoms", specialtySlug: "urology" },
  "ear-pain": { label: "Ear Pain", specialtySlug: "ent" },
  "eye-redness": { label: "Eye Redness", specialtySlug: "ophthalmology" },
  "weight-gain": { label: "Weight Gain", specialtySlug: "endocrinology" },
  "weight-loss": { label: "Weight Loss", specialtySlug: "general-medicine" },
  "breathing-problem": { label: "Breathing Problem", specialtySlug: "pulmonology" },
  migraine: { label: "Migraine", specialtySlug: "neurology" },
  "acidity-gas": { label: "Acidity and Gas", specialtySlug: "gastroenterology" },
  constipation: { label: "Constipation", specialtySlug: "gastroenterology" },
  "sexual-health": { label: "Sexual Health Concern", specialtySlug: "urology" },
};

export const CITY_TARGETS = [
  "hyderabad",
  "mumbai",
  "bangalore",
  "delhi",
  "chennai",
  "kolkata",
  "pune",
  "ahmedabad",
  "jaipur",
  "lucknow",
  "chandigarh",
  "kochi",
  "coimbatore",
  "nagpur",
  "vizag",
] as const;

export const CITY_UNIQUE_COPY: Partial<
  Record<(typeof CITY_TARGETS)[number], string>
> = {
  hyderabad:
    "Patients in Hyderabad often use teleconsultation to avoid peak traffic and get quick specialist access across cardiology, dermatology, and diabetes care.",
  mumbai:
    "In Mumbai, online consultation helps working professionals get same-day appointments without long clinic commute time.",
  bangalore:
    "Bangalore users rely on telehealth for flexible after-work consultations, especially for stress, sleep, and lifestyle-related conditions.",
  delhi:
    "Delhi patients frequently choose video consultations for pollution-related respiratory concerns and chronic disease follow-ups.",
  chennai:
    "In Chennai, families use online consultations for pediatric advice, fever management, and continuity care with specialists.",
  pune:
    "Pune patients prefer teleconsultation for quick specialist second opinions and ongoing chronic care management.",
  kolkata:
    "Kolkata users benefit from faster specialist matching and reduced waiting time for non-emergency consultations.",
  ahmedabad:
    "Ahmedabad consultations commonly focus on diabetes, thyroid, and cardiometabolic follow-ups with digital prescriptions.",
  jaipur:
    "Jaipur patients use online doctor access for timely triage before deciding if in-clinic diagnostics are required.",
  lucknow:
    "Lucknow families often book teleconsults for seasonal infections, women’s health queries, and child-care guidance.",
};
