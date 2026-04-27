import type { BlogPostRecord } from "@/types/catalog";

const BLOG_PUBLIC_IMAGES = [
  "/apple-touch-icon.png",
  "/closeup-family-talking-with-doctor-via-video-call-laptop-coronavirus-pandemic.webp",
  "/doctor-offering-medical-teleconsultation.webp",
  "/elderly-people-making-video-call.webp",
  "/female-patient-attending-virtual-consultation.webp",
  "/Online-Medical-Consultation-Desktop.webp",
  "/online-medical-consultation-with-doctor-via-video-call-laptop.webp",
  "/sick-patient-talking-doctor-telehealth-videocall-conference-using-computer-with-webcam-medical-consultation-online-videoconference-remote-telemedicine-virtual-meeting.webp",
  "/smiling-caucasian-female-doctor-medical-uniform-headphones-talk-video-call-computer-with-client-happy-woman-gp-earphones-have-online-webcam-digital-consultation-with-hospital-patient.webp",
  "/woman-having-appointment-with-doctor-videocall-using-laptop-telehealth-concept-online-consultation-with-professional-medical-clinic-general-practitioner-telemedicine-service.webp",
  "/woman-using-laptop-having-video-call-with-her-doctor-while-sitting-home.webp",
  "/young-asia-female-doctor-white-medical-uniform-with-stethoscope-using-computer-laptop-talking-video-conference-call.webp",
];

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getRandomBlogImage(seed: string) {
  const index = hashString(seed) % BLOG_PUBLIC_IMAGES.length;
  return BLOG_PUBLIC_IMAGES[index];
}

type BlogTopic = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  specialtySlug?: string;
  keyword: string;
  audience: string;
  author: BlogPostRecord["author"];
};

const AUTHORS = {
  general: { name: "Dr. Manish Gupta", slug: "dr-manish-gupta-general", role: "General Medicine" },
  cardio: { name: "Dr. Priya Mehta", slug: "dr-priya-mehta-cardiology", role: "Cardiology" },
  derm: { name: "Dr. Neha Verma", slug: "dr-neha-verma-dermatology", role: "Dermatology" },
  psych: { name: "Dr. Karthik Menon", slug: "dr-karthik-menon-psychiatry", role: "Psychiatry" },
  diab: { name: "Dr. Swati Kulkarni", slug: "dr-swati-kulkarni-diabetology", role: "Diabetology" },
  peds: { name: "Dr. Sanjay Pillai", slug: "dr-sanjay-pillai-pediatrics", role: "Pediatrics" },
  neph: { name: "Dr. Pallavi Shah", slug: "dr-pallavi-shah-nephrology", role: "Nephrology" },
};

const BLOG_TOPICS: BlogTopic[] = [
  { slug: "online-doctor-consultation-india-guide", title: "Online Doctor Consultation in India: Complete Beginner Guide", excerpt: "A practical start-to-finish workflow to book, prepare, and complete an online doctor consultation in India.", category: "Guides", specialtySlug: "general-medicine", keyword: "online doctor consultation", audience: "first-time patients and families", author: AUTHORS.general },
  { slug: "telemedicine-appointment-checklist", title: "Telemedicine Appointment Checklist You Should Not Skip", excerpt: "Use this telemedicine checklist to avoid delays, improve diagnosis quality, and leave with a clear treatment plan.", category: "Guides", specialtySlug: "general-medicine", keyword: "telemedicine appointment checklist", audience: "busy working adults", author: AUTHORS.general },
  { slug: "best-time-to-book-online-doctor", title: "Best Time to Book an Online Doctor Appointment", excerpt: "Learn when to schedule online consultation slots for shorter waiting time and better follow-up continuity.", category: "Guides", specialtySlug: "general-medicine", keyword: "online doctor appointment", audience: "patients with recurring symptoms", author: AUTHORS.general },
  { slug: "online-consultation-for-fever", title: "Can Fever Be Managed by Online Consultation?", excerpt: "Understand when fever can be safely managed through teleconsultation and when emergency care is necessary.", category: "Health", specialtySlug: "general-medicine", keyword: "online consultation for fever", audience: "adults with acute mild symptoms", author: AUTHORS.general },
  { slug: "online-doctor-for-cough-cold", title: "Online Doctor for Cough and Cold: What to Expect", excerpt: "A symptom-based telehealth guide for cough and cold with home care tips, warning signs, and follow-up planning.", category: "Health", specialtySlug: "general-medicine", keyword: "online doctor for cough and cold", audience: "parents and office-goers", author: AUTHORS.general },
  { slug: "blood-pressure-management-teleconsult", title: "Blood Pressure Management Through Teleconsultation", excerpt: "How home BP readings and regular virtual reviews can improve long-term hypertension control.", category: "Cardiology", specialtySlug: "cardiology", keyword: "blood pressure teleconsultation", audience: "patients with hypertension", author: AUTHORS.cardio },
  { slug: "cholesterol-followup-online", title: "How to Do Cholesterol Follow-Up Online", excerpt: "Build a reliable lipid follow-up routine with online cardiology consultation and lab trend review.", category: "Cardiology", specialtySlug: "cardiology", keyword: "cholesterol follow-up online", audience: "middle-aged adults with metabolic risk", author: AUTHORS.cardio },
  { slug: "when-chest-pain-needs-er", title: "Chest Pain Online Triage: When to Call Emergency Immediately", excerpt: "A safety-first chest pain triage guide for telemedicine users to avoid risky delays in urgent care.", category: "Safety", specialtySlug: "cardiology", keyword: "chest pain online consultation", audience: "high-risk cardiac patients", author: AUTHORS.cardio },
  { slug: "palpitations-telehealth-evaluation", title: "Palpitations and Telehealth: First Evaluation Steps", excerpt: "Learn how cardiologists evaluate palpitations remotely and decide if you need ECG, Holter, or urgent review.", category: "Cardiology", specialtySlug: "cardiology", keyword: "palpitations telehealth", audience: "adults with intermittent racing heartbeat", author: AUTHORS.cardio },
  { slug: "heart-health-screening-online", title: "Heart Health Screening You Can Start Online", excerpt: "Start preventive cardiology from home with risk assessment, labs, and structured lifestyle planning.", category: "Prevention", specialtySlug: "cardiology", keyword: "heart health screening online", audience: "preventive care seekers", author: AUTHORS.cardio },
  { slug: "diabetes-control-with-online-doctor", title: "Diabetes Control with an Online Doctor: Monthly Framework", excerpt: "A consistent tele-diabetes routine using sugar logs, nutrition updates, and medication adjustments.", category: "Diabetes", specialtySlug: "diabetology", keyword: "online diabetes doctor", audience: "people with type 2 diabetes", author: AUTHORS.diab },
  { slug: "fasting-sugar-vs-hba1c-explained", title: "Fasting Sugar vs HbA1c: What Matters More in Tele Follow-Up", excerpt: "Understand fasting glucose and HbA1c in context so your online diabetes visit becomes more actionable.", category: "Diabetes", specialtySlug: "diabetology", keyword: "fasting sugar vs hba1c", audience: "newly diagnosed diabetic patients", author: AUTHORS.diab },
  { slug: "gestational-diabetes-online-support", title: "Gestational Diabetes Online Support: Safe Monitoring Basics", excerpt: "How pregnant patients can safely use teleconsultation for gestational diabetes coaching and escalation.", category: "Diabetes", specialtySlug: "diabetology", keyword: "gestational diabetes online consultation", audience: "pregnant women and caregivers", author: AUTHORS.diab },
  { slug: "prediabetes-reversal-plan-virtual", title: "Prediabetes Reversal Plan Through Virtual Care", excerpt: "Use online doctor guidance to build nutrition, activity, and sleep habits that reduce diabetes risk.", category: "Prevention", specialtySlug: "diabetology", keyword: "prediabetes reversal plan", audience: "adults with borderline sugar values", author: AUTHORS.diab },
  { slug: "cgm-data-for-teleconsult", title: "How to Use CGM Data Better in Teleconsultation", excerpt: "Turn continuous glucose monitor graphs into practical treatment decisions during virtual appointments.", category: "Diabetes", specialtySlug: "diabetology", keyword: "cgm data teleconsultation", audience: "CGM users and tech-savvy patients", author: AUTHORS.diab },
  { slug: "online-dermatologist-for-acne", title: "Online Dermatologist for Acne: Results Without Guesswork", excerpt: "Get structured acne treatment plans through online dermatology consultation and photo-based tracking.", category: "Dermatology", specialtySlug: "dermatology", keyword: "online dermatologist for acne", audience: "teens and young professionals", author: AUTHORS.derm },
  { slug: "eczema-management-online", title: "Eczema Management Online: Daily Care and Flare Control", excerpt: "A practical eczema telehealth plan covering moisturizers, trigger control, and treatment escalation.", category: "Dermatology", specialtySlug: "dermatology", keyword: "eczema management online", audience: "families managing chronic eczema", author: AUTHORS.derm },
  { slug: "psoriasis-teleconsult-care-path", title: "Psoriasis Teleconsult Care Path for Long-Term Relief", excerpt: "How virtual dermatology visits support psoriasis treatment adherence and early flare intervention.", category: "Dermatology", specialtySlug: "dermatology", keyword: "psoriasis teleconsult", audience: "adults with chronic psoriasis", author: AUTHORS.derm },
  { slug: "skin-rash-online-consultation", title: "Skin Rash Online Consultation: Clear Photo Tips for Better Diagnosis", excerpt: "Improve rash diagnosis quality by capturing useful photos and symptom timelines before your visit.", category: "Dermatology", specialtySlug: "dermatology", keyword: "skin rash online consultation", audience: "patients with acute skin issues", author: AUTHORS.derm },
  { slug: "hair-fall-online-treatment-plan", title: "Hair Fall Online Treatment Plan: What Actually Works", excerpt: "Separate myths from evidence with a dermatologist-led virtual plan for hair thinning and shedding.", category: "Dermatology", specialtySlug: "dermatology", keyword: "hair fall online treatment", audience: "men and women with early hair loss", author: AUTHORS.derm },
  { slug: "telepsychiatry-first-session-guide", title: "Telepsychiatry First Session: What to Share and Why", excerpt: "Prepare for your first online psychiatry appointment with privacy, history, and goal-setting tips.", category: "Mental Health", specialtySlug: "psychiatry", keyword: "telepsychiatry first session", audience: "people seeking mental health support", author: AUTHORS.psych },
  { slug: "online-anxiety-consultation-plan", title: "Online Anxiety Consultation: Structured 30-Day Care Plan", excerpt: "Build a practical anxiety care routine using online psychiatric review, therapy, and habit tracking.", category: "Mental Health", specialtySlug: "psychiatry", keyword: "online anxiety consultation", audience: "adults with persistent anxiety symptoms", author: AUTHORS.psych },
  { slug: "depression-followup-telemedicine", title: "Depression Follow-Up in Telemedicine: Staying Consistent", excerpt: "Improve depression outcomes through scheduled virtual follow-ups and measurable treatment goals.", category: "Mental Health", specialtySlug: "psychiatry", keyword: "depression follow-up telemedicine", audience: "patients in active treatment", author: AUTHORS.psych },
  { slug: "sleep-disorder-online-doctor", title: "Sleep Disorder Online Doctor Visit: Better Questions, Better Outcomes", excerpt: "Use a symptom diary and behavior insights to make your virtual sleep consultation effective.", category: "Mental Health", specialtySlug: "psychiatry", keyword: "sleep disorder online doctor", audience: "people with poor sleep quality", author: AUTHORS.psych },
  { slug: "stress-management-virtual-care", title: "Stress Management with Virtual Care: A Practical Weekly Routine", excerpt: "Learn how online mental health care can improve stress control, resilience, and daily function.", category: "Mental Health", specialtySlug: "psychiatry", keyword: "stress management virtual care", audience: "working professionals", author: AUTHORS.psych },
  { slug: "pediatric-online-consultation-checklist", title: "Pediatric Online Consultation Checklist for Parents", excerpt: "Everything parents should prepare before an online pediatric appointment for faster and safer care.", category: "Pediatrics", specialtySlug: "pediatrics", keyword: "pediatric online consultation", audience: "parents of children under 12", author: AUTHORS.peds },
  { slug: "child-fever-video-consultation", title: "Child Fever Video Consultation: Home Monitoring That Helps Doctors", excerpt: "A parent-friendly guide to fever logging, hydration checks, and warning signs during teleconsultation.", category: "Pediatrics", specialtySlug: "pediatrics", keyword: "child fever video consultation", audience: "parents of infants and toddlers", author: AUTHORS.peds },
  { slug: "child-cough-online-pediatrician", title: "Child Cough and Online Pediatrician Visits: Safe Triage Steps", excerpt: "Recognize mild cough patterns versus emergency breathing signs while using pediatric telehealth.", category: "Pediatrics", specialtySlug: "pediatrics", keyword: "online pediatrician for cough", audience: "caregivers in urban and semi-urban homes", author: AUTHORS.peds },
  { slug: "nutrition-advice-for-kids-online", title: "Nutrition Advice for Kids Through Online Pediatric Care", excerpt: "How virtual pediatric consults can support appetite issues, growth goals, and balanced diet plans.", category: "Pediatrics", specialtySlug: "pediatrics", keyword: "kids nutrition online doctor", audience: "parents facing picky eating concerns", author: AUTHORS.peds },
  { slug: "vaccination-doubts-online-consult", title: "Vaccination Doubts? Use Online Consultation Before Delay", excerpt: "Resolve vaccine concerns quickly with pediatric teleconsultation and personalized schedule clarification.", category: "Pediatrics", specialtySlug: "pediatrics", keyword: "vaccination doubts online consultation", audience: "new parents", author: AUTHORS.peds },
  { slug: "kidney-health-teleconsultation-basics", title: "Kidney Health Teleconsultation Basics for Early CKD Care", excerpt: "Start kidney-focused virtual care with blood pressure logs, lab interpretation, and medication review.", category: "Kidney Health", specialtySlug: "nephrology", keyword: "kidney health teleconsultation", audience: "patients with CKD risk factors", author: AUTHORS.neph },
  { slug: "creatinine-report-explained-online", title: "Creatinine Report Explained: Questions to Ask in Online Nephrology Visit", excerpt: "Understand creatinine and eGFR trends so your online kidney consultation becomes goal-oriented.", category: "Kidney Health", specialtySlug: "nephrology", keyword: "creatinine report explained", audience: "patients with recent abnormal labs", author: AUTHORS.neph },
  { slug: "protein-in-urine-what-next", title: "Protein in Urine: What Next in a Tele Nephrology Plan", excerpt: "Learn how proteinuria is evaluated and monitored through virtual kidney follow-up programs.", category: "Kidney Health", specialtySlug: "nephrology", keyword: "protein in urine teleconsult", audience: "adults with early kidney findings", author: AUTHORS.neph },
  { slug: "high-bp-kidney-risk-online", title: "High Blood Pressure and Kidney Risk: Online Follow-Up Strategy", excerpt: "Why BP control protects kidneys and how teleconsultation can reduce long-term renal decline risk.", category: "Kidney Health", specialtySlug: "nephrology", keyword: "high blood pressure kidney risk", audience: "hypertensive adults", author: AUTHORS.neph },
  { slug: "ckd-diet-counseling-virtual", title: "CKD Diet Counseling in Virtual Care: Practical Meal Planning", excerpt: "Work with kidney specialists online to tailor sodium, protein, and fluid guidance to your stage.", category: "Kidney Health", specialtySlug: "nephrology", keyword: "ckd diet counseling virtual", audience: "CKD patients and family caregivers", author: AUTHORS.neph },
  { slug: "women-health-online-consultation", title: "Women’s Health Online Consultation: Common Concerns You Can Start Remotely", excerpt: "A reliable telehealth path for common women’s health questions before in-person escalation if needed.", category: "Women Health", specialtySlug: "general-medicine", keyword: "women health online consultation", audience: "women balancing work and family", author: AUTHORS.general },
  { slug: "thyroid-followup-online-india", title: "Thyroid Follow-Up Online in India: Easy Monitoring Routine", excerpt: "Use teleconsultation to review thyroid reports, symptoms, and medication timing effectively.", category: "Endocrine", specialtySlug: "general-medicine", keyword: "thyroid follow-up online", audience: "patients with diagnosed thyroid disorders", author: AUTHORS.general },
  { slug: "pcos-lifestyle-support-online", title: "PCOS Lifestyle Support Through Online Doctor Guidance", excerpt: "Build a realistic PCOS care strategy using virtual consultations, labs, and monthly progress tracking.", category: "Women Health", specialtySlug: "general-medicine", keyword: "pcos online consultation", audience: "young women with cycle and metabolic concerns", author: AUTHORS.general },
  { slug: "migraine-management-teleconsult", title: "Migraine Management Through Teleconsultation: What Helps Most", excerpt: "Improve migraine control by tracking triggers, headache days, and response patterns during virtual care.", category: "Neurology", specialtySlug: "general-medicine", keyword: "migraine management teleconsultation", audience: "patients with recurrent headaches", author: AUTHORS.general },
  { slug: "thyroid-medication-mistakes-online-review", title: "Thyroid Medication Mistakes You Can Fix in Online Follow-Up", excerpt: "Correct common thyroid treatment errors by reviewing timing, interactions, and symptoms online.", category: "Endocrine", specialtySlug: "general-medicine", keyword: "thyroid medication mistakes", audience: "long-term thyroid medication users", author: AUTHORS.general },
  { slug: "allergy-consultation-online-home-care", title: "Allergy Consultation Online: Home Care That Actually Helps", excerpt: "A tele-allergy approach for trigger mapping, symptom control, and timely escalation when needed.", category: "Respiratory", specialtySlug: "general-medicine", keyword: "allergy consultation online", audience: "adults with seasonal allergy symptoms", author: AUTHORS.general },
  { slug: "asthma-followup-virtual-clinic", title: "Asthma Follow-Up in a Virtual Clinic: Better Control in 8 Weeks", excerpt: "Use inhaler technique checks, trigger control, and symptom scoring in online asthma follow-up.", category: "Respiratory", specialtySlug: "general-medicine", keyword: "asthma follow-up virtual clinic", audience: "asthma patients needing regular review", author: AUTHORS.general },
  { slug: "weight-loss-doctor-online-plan", title: "Weight Loss Doctor Online Plan: Sustainable and Measurable", excerpt: "Get a practical doctor-led online weight management roadmap focused on habits and metabolic health.", category: "Lifestyle", specialtySlug: "general-medicine", keyword: "weight loss doctor online", audience: "adults with overweight and obesity concerns", author: AUTHORS.general },
  { slug: "fatty-liver-online-consultation", title: "Fatty Liver Online Consultation: Early Action Steps", excerpt: "Understand fatty liver reports and start treatment-supportive lifestyle changes with online doctor guidance.", category: "Liver Health", specialtySlug: "general-medicine", keyword: "fatty liver online consultation", audience: "patients with incidental liver ultrasound findings", author: AUTHORS.general },
  { slug: "gut-health-telemedicine-plan", title: "Gut Health Telemedicine Plan for Bloating and Indigestion", excerpt: "A structured virtual GI-first approach for common digestive symptoms and safe escalation criteria.", category: "Digestive Health", specialtySlug: "general-medicine", keyword: "gut health telemedicine", audience: "adults with chronic digestive discomfort", author: AUTHORS.general },
  { slug: "acid-reflux-online-doctor-visit", title: "Acid Reflux and Online Doctor Visit: Symptom Patterns That Matter", excerpt: "Track reflux triggers and red flags to make your virtual consultation more effective and precise.", category: "Digestive Health", specialtySlug: "general-medicine", keyword: "acid reflux online doctor", audience: "people with frequent heartburn", author: AUTHORS.general },
  { slug: "senior-care-teleconsultation-guide", title: "Senior Care Teleconsultation Guide for Family Caregivers", excerpt: "Plan safer virtual visits for older adults with medication lists, vitals, and caregiver observations.", category: "Senior Care", specialtySlug: "general-medicine", keyword: "senior care teleconsultation", audience: "family caregivers", author: AUTHORS.general },
  { slug: "polypharmacy-review-online", title: "Polypharmacy Review Online: Reducing Medicine Risks in Older Adults", excerpt: "Use telemedicine to review duplicate medications, interactions, and dose timing in senior care.", category: "Senior Care", specialtySlug: "general-medicine", keyword: "polypharmacy review online", audience: "elderly patients on multiple medicines", author: AUTHORS.general },
  { slug: "post-hospital-discharge-online-followup", title: "Post-Hospital Discharge Online Follow-Up: First 14 Days Matter", excerpt: "A post-discharge virtual care checklist to prevent complications and avoid readmission.", category: "Recovery", specialtySlug: "general-medicine", keyword: "post hospital discharge online follow-up", audience: "recently discharged patients", author: AUTHORS.general },
  { slug: "preventive-health-checks-online", title: "Preventive Health Checks You Can Start with Online Consultation", excerpt: "Use online doctor visits to personalize preventive screening and prioritize high-value tests.", category: "Prevention", specialtySlug: "general-medicine", keyword: "preventive health checks online", audience: "healthy adults planning annual health review", author: AUTHORS.general },
  { slug: "annual-health-plan-family-telehealth", title: "Build an Annual Family Health Plan Using Telehealth", excerpt: "Coordinate chronic care, vaccination, and preventive visits for your family using online doctor support.", category: "Family Care", specialtySlug: "general-medicine", keyword: "family telehealth plan", audience: "households managing multi-member care", author: AUTHORS.general },
  { slug: "online-prescription-safety-tips", title: "Online Prescription Safety Tips Every Patient Should Follow", excerpt: "Protect yourself with practical prescription verification and medication-use best practices in telemedicine.", category: "Safety", specialtySlug: "general-medicine", keyword: "online prescription safety", audience: "all telemedicine users", author: AUTHORS.general },
  { slug: "teleconsultation-vs-in-person-2026", title: "Teleconsultation vs In-Person in 2026: Smarter Decision Framework", excerpt: "Choose the right care mode for common conditions with a safety-focused and time-efficient approach.", category: "Guides", specialtySlug: "general-medicine", keyword: "teleconsultation vs in-person", audience: "patients comparing care options", author: AUTHORS.general },
];

function estimateReadingMinutes(body: string) {
  const words = body.trim().split(/\s+/).length;
  return Math.max(6, Math.round(words / 180));
}

function getPublishedAt(index: number) {
  const date = new Date("2026-04-24");
  date.setDate(date.getDate() - index * 2);
  return date.toISOString().slice(0, 10);
}

function buildSeoBody(topic: BlogTopic) {
  const primaryKeyword = topic.keyword;
  const secondaryKeywords = [
    `${topic.keyword} in India`,
    `best ${topic.keyword}`,
    `${topic.keyword} benefits`,
    `${topic.keyword} safety`,
    `${topic.keyword} tips`,
  ];

  return `
## ${topic.title}

${topic.title} is designed for ${topic.audience} who want clear next steps without delay. In practice, ${primaryKeyword} works best when patients prepare symptom history, medicines, and recent reports before the call. This improves diagnostic clarity and reduces repeated visits. To strengthen outcomes, mention symptom duration, severity, daily triggers, and any treatment already tried. For long-term conditions, share trend data instead of one isolated reading. Doctors can then personalize care faster and define whether home management, lab testing, or in-person escalation is needed.

## Practical framework for better ${primaryKeyword} outcomes

Use a stable internet connection, private room, and good lighting so your doctor can assess verbal and visual clues. During your consultation, ask for a specific plan: medication name, dose timing, expected response window, side effects to watch, and review date. This simple structure improves ${secondaryKeywords[2]} and supports safer follow-up. Keep a digital log of symptoms and treatment response because progress tracking is central to ${secondaryKeywords[3]}. If your condition involves blood pressure, glucose, sleep, breathing, or skin findings, upload photos or logs before the appointment for better decisions.

## Patient-focused SEO checklist and FAQs

Search intent for ${primaryKeyword} usually falls into three buckets: safety, cost, and effectiveness. Address all three in your plan. Confirm clinician credentials, understand prescription rules, and follow advice consistently for measurable outcomes.

- **FAQ 1:** Who is the ideal candidate for ${primaryKeyword}?  
Patients with non-emergency symptoms, chronic follow-up needs, or report-review visits benefit the most.
- **FAQ 2:** When should telecare become emergency care?  
If severe pain, breathing difficulty, confusion, chest pressure, or sudden neurological symptoms appear, seek urgent in-person care.
- **FAQ 3:** How do I get the best ${secondaryKeywords[1]} experience?  
Prepare documents, ask focused questions, and schedule timely follow-ups to maintain continuity.

Use ${secondaryKeywords[0]} and hybrid care together for stronger prevention, safer escalation, and better long-term health outcomes.
`.trim();
}

export const BLOG_POSTS: BlogPostRecord[] = BLOG_TOPICS.map((topic, index) => {
  const body = buildSeoBody(topic);
  return {
    slug: topic.slug,
    title: topic.title,
    excerpt: topic.excerpt,
    category: topic.category,
    author: topic.author,
    publishedAt: getPublishedAt(index),
    readingMinutes: estimateReadingMinutes(body),
    coverImage: getRandomBlogImage(topic.slug),
    specialtySlug: topic.specialtySlug,
    body,
  };
});

export function getBlogBySlug(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function latestPosts(n = 3) {
  return [...BLOG_POSTS].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  ).slice(0, n);
}
