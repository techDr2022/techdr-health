export type GlobalRegion = {
  slug: string;
  name: string;
  flag: string;
  description: string;
  intro: string;
  timezone: string;
  currency: string;
  highlights: string[];
  faqs: { question: string; answer: string }[];
};

export const GLOBAL_REGIONS: GlobalRegion[] = [
  {
    slug: "india",
    name: "India",
    flag: "🇮🇳",
    description:
      "Book online doctor consultations with 1000+ verified Indian specialists. Video telehealth across all major cities with digital prescriptions and affordable fees from ₹200.",
    intro:
      "India's leading teleconsultation platform connecting patients with board-certified specialists via secure HD video. Ideal for follow-ups, second opinions, chronic care, and medical tourism planning.",
    timezone: "IST (UTC+5:30)",
    currency: "INR (₹)",
    highlights: [
      "1000+ verified doctors across 20+ specialties",
      "Consultations in English, Hindi, and regional languages",
      "Digital prescriptions compliant with Indian telemedicine guidelines",
      "Medical tourism coordination for international patients",
    ],
    faqs: [
      {
        question: "Can I consult an Indian doctor online from anywhere in India?",
        answer:
          "Yes. TechDrHealth serves patients across all Indian states and union territories. Book a video consultation from your phone or laptop without visiting a clinic.",
      },
      {
        question: "Are prescriptions valid across India?",
        answer:
          "When medically appropriate, doctors issue digital prescriptions that comply with Indian telemedicine practice guidelines and can be used at pharmacies nationwide.",
      },
    ],
  },
  {
    slug: "united-states",
    name: "United States",
    flag: "🇺🇸",
    description:
      "Access affordable specialist teleconsultations with Indian board-certified doctors. Ideal for second opinions, chronic disease management, and cost-effective virtual healthcare.",
    intro:
      "Patients in the US can consult experienced Indian specialists for non-emergency care, follow-ups, and second opinions at a fraction of typical US consultation costs.",
    timezone: "Multiple US timezones supported",
    currency: "USD ($)",
    highlights: [
      "Second opinions from experienced specialists",
      "Flexible scheduling across US time zones",
      "Secure HIPAA-style data handling",
      "English-speaking doctors with international experience",
    ],
    faqs: [
      {
        question: "Can US residents book teleconsultations on TechDrHealth?",
        answer:
          "Yes. US patients can book video consultations for non-emergency care, follow-ups, and second opinions. Emergency symptoms require immediate local ER care.",
      },
      {
        question: "Are Indian prescriptions valid in the US?",
        answer:
          "Prescriptions issued on TechDrHealth follow Indian medical regulations. US patients should consult their local physician before starting any new medication.",
      },
    ],
  },
  {
    slug: "united-kingdom",
    name: "United Kingdom",
    flag: "🇬🇧",
    description:
      "Online doctor consultations for UK patients seeking timely specialist access. Video telehealth with verified doctors for follow-ups, chronic care, and second opinions.",
    intro:
      "UK patients facing long NHS wait times can access specialist video consultations quickly. Ideal for non-urgent conditions, medication reviews, and specialist referrals.",
    timezone: "GMT/BST",
    currency: "GBP (£)",
    highlights: [
      "Fast specialist access without long waitlists",
      "English-speaking verified doctors",
      "Secure video consultations from home",
      "Digital consultation summaries for your GP",
    ],
    faqs: [
      {
        question: "Is TechDrHealth suitable for UK patients?",
        answer:
          "Yes, for non-emergency consultations, follow-ups, and second opinions. TechDrHealth complements—not replaces—your NHS GP and local emergency services.",
      },
      {
        question: "Can I share consultation notes with my NHS GP?",
        answer:
          "Yes. You receive a digital consultation summary that you can share with your local GP for continuity of care.",
      },
    ],
  },
  {
    slug: "united-arab-emirates",
    name: "United Arab Emirates",
    flag: "🇦🇪",
    description:
      "Video doctor consultations for UAE residents and expats. Access Indian specialists for affordable telehealth, chronic disease management, and family healthcare.",
    intro:
      "UAE residents and expatriates can consult experienced Indian specialists via HD video. Popular for dermatology, general medicine, pediatrics, and chronic disease follow-ups.",
    timezone: "GST (UTC+4)",
    currency: "AED",
    highlights: [
      "Popular with UAE expat community",
      "Multilingual doctors (English, Hindi, Arabic)",
      "Evening and weekend slots available",
      "Affordable compared to private UAE clinics",
    ],
    faqs: [
      {
        question: "Can UAE residents use TechDrHealth?",
        answer:
          "Yes. UAE residents can book video consultations with verified specialists for non-emergency healthcare needs from anywhere in the Emirates.",
      },
      {
        question: "What languages are available for UAE patients?",
        answer:
          "Doctors offer consultations in English, Hindi, Arabic, and other regional languages. Filter by language when booking.",
      },
    ],
  },
  {
    slug: "canada",
    name: "Canada",
    flag: "🇨🇦",
    description:
      "Online specialist consultations for Canadian patients. Access experienced doctors via video for second opinions, chronic care, and timely healthcare access.",
    intro:
      "Canadian patients can consult verified specialists online for non-urgent care, reducing wait times and accessing affordable specialist opinions from experienced doctors.",
    timezone: "Multiple Canadian timezones",
    currency: "CAD ($)",
    highlights: [
      "Second opinions from experienced specialists",
      "Flexible scheduling across Canadian time zones",
      "Secure privacy-first platform",
      "Digital consultation records",
    ],
    faqs: [
      {
        question: "Can Canadians book online doctor consultations?",
        answer:
          "Yes. Canadian patients can book non-emergency video consultations. For emergencies, contact local emergency services immediately.",
      },
      {
        question: "How does TechDrHealth complement Canadian healthcare?",
        answer:
          "TechDrHealth provides timely specialist access for follow-ups and second opinions, complementing your provincial healthcare system.",
      },
    ],
  },
  {
    slug: "australia",
    name: "Australia",
    flag: "🇦🇺",
    description:
      "Telehealth consultations for Australian patients. Video access to verified specialists for follow-ups, chronic disease management, and specialist second opinions.",
    intro:
      "Australian patients can access specialist video consultations for non-urgent healthcare, ideal for rural areas and busy professionals seeking convenient care.",
    timezone: "AEST/AEDT and other AU zones",
    currency: "AUD ($)",
    highlights: [
      "Convenient care for rural and remote patients",
      "English-speaking verified specialists",
      "Secure HD video platform",
      "Affordable specialist access",
    ],
    faqs: [
      {
        question: "Is online consultation available for Australian patients?",
        answer:
          "Yes. Australian patients can book video consultations for non-emergency conditions, follow-ups, and specialist opinions.",
      },
      {
        question: "Can I use this alongside my Australian GP?",
        answer:
          "Absolutely. TechDrHealth complements your local GP care. Share your consultation summary with your regular doctor for continuity.",
      },
    ],
  },
  {
    slug: "singapore",
    name: "Singapore",
    flag: "🇸🇬",
    description:
      "Online doctor consultations for Singapore residents and expats. Affordable video telehealth with verified Indian specialists across 20+ medical departments.",
    intro:
      "Singapore patients and expats access quality specialist care via video at competitive rates. Popular for dermatology, general medicine, psychiatry, and pediatrics.",
    timezone: "SGT (UTC+8)",
    currency: "SGD ($)",
    highlights: [
      "Popular with Singapore expat community",
      "English and regional language support",
      "Evening consultation slots",
      "Cost-effective specialist access",
    ],
    faqs: [
      {
        question: "Can Singapore residents book teleconsultations?",
        answer:
          "Yes. Singapore residents can book video consultations with verified specialists for non-emergency healthcare from anywhere.",
      },
      {
        question: "What specialties are most popular in Singapore?",
        answer:
          "Dermatology, general medicine, psychiatry, pediatrics, and chronic disease management are among the most booked specialties.",
      },
    ],
  },
  {
    slug: "saudi-arabia",
    name: "Saudi Arabia",
    flag: "🇸🇦",
    description:
      "Video doctor consultations for Saudi Arabia residents. Access verified specialists for telehealth, family healthcare, and chronic disease management.",
    intro:
      "Patients in Saudi Arabia can consult experienced specialists via secure HD video. Ideal for expats and residents seeking affordable, timely specialist access.",
    timezone: "AST (UTC+3)",
    currency: "SAR",
    highlights: [
      "Arabic and English-speaking doctors",
      "Family healthcare and pediatrics",
      "Chronic disease follow-ups",
      "Secure privacy-first platform",
    ],
    faqs: [
      {
        question: "Is TechDrHealth available in Saudi Arabia?",
        answer:
          "Yes. Saudi residents can book non-emergency video consultations with verified specialists from anywhere in the Kingdom.",
      },
      {
        question: "Are Arabic-speaking doctors available?",
        answer:
          "Yes. Filter the doctor directory by language to find Arabic, English, and Hindi-speaking specialists.",
      },
    ],
  },
  {
    slug: "germany",
    name: "Germany",
    flag: "🇩🇪",
    description:
      "Online specialist consultations for patients in Germany. Video telehealth with verified doctors for second opinions and chronic care management.",
    intro:
      "German patients and expats can access specialist video consultations for non-urgent care, second opinions, and chronic disease follow-ups in English.",
    timezone: "CET/CEST",
    currency: "EUR (€)",
    highlights: [
      "English-speaking specialists",
      "Second opinions and chronic care",
      "Secure GDPR-aware data handling",
      "Flexible scheduling",
    ],
    faqs: [
      {
        question: "Can German residents use TechDrHealth?",
        answer:
          "Yes, for non-emergency consultations and second opinions. TechDrHealth complements your local German healthcare system.",
      },
      {
        question: "Is my health data protected?",
        answer:
          "Yes. TechDrHealth follows privacy-first practices with encrypted data storage and secure video consultations.",
      },
    ],
  },
  {
    slug: "south-africa",
    name: "South Africa",
    flag: "🇿🇦",
    description:
      "Affordable online doctor consultations for South African patients. Video telehealth with verified specialists across major medical departments.",
    intro:
      "South African patients access quality specialist care via video at affordable rates. Ideal for areas with limited specialist access and busy urban professionals.",
    timezone: "SAST (UTC+2)",
    currency: "ZAR",
    highlights: [
      "Affordable specialist consultations",
      "English-speaking verified doctors",
      "Chronic disease management",
      "Secure HD video platform",
    ],
    faqs: [
      {
        question: "Is teleconsultation available in South Africa?",
        answer:
          "Yes. South African patients can book video consultations with verified specialists for non-emergency healthcare needs.",
      },
      {
        question: "What conditions are suitable for teleconsultation?",
        answer:
          "Follow-ups, chronic disease management, dermatology, psychiatry, general medicine, and medication reviews are well-suited for video consultation.",
      },
    ],
  },
  {
    slug: "philippines",
    name: "Philippines",
    flag: "🇵🇭",
    description:
      "Online doctor consultations for Filipino patients worldwide. Access verified specialists via video for affordable telehealth and family healthcare.",
    intro:
      "Filipino patients at home and abroad can consult verified specialists via HD video. Popular for OFW families, chronic care, and pediatric consultations.",
    timezone: "PHT (UTC+8)",
    currency: "PHP (₱)",
    highlights: [
      "Popular with OFW families abroad",
      "English-speaking specialists",
      "Pediatrics and family medicine",
      "Affordable consultation fees",
    ],
    faqs: [
      {
        question: "Can Filipinos abroad book consultations for family in the Philippines?",
        answer:
          "Yes. You can book consultations for family members by entering their patient details during booking.",
      },
      {
        question: "Are consultations affordable for Filipino patients?",
        answer:
          "Yes. Consultation fees start from ₹200, making specialist access affordable compared to many private clinics.",
      },
    ],
  },
  {
    slug: "bangladesh",
    name: "Bangladesh",
    flag: "🇧🇩",
    description:
      "Video doctor consultations for Bangladeshi patients. Access Indian specialists for affordable telehealth, second opinions, and specialist care.",
    intro:
      "Bangladeshi patients access quality Indian specialist care via secure video. Ideal for second opinions, chronic disease management, and specialist referrals.",
    timezone: "BST (UTC+6)",
    currency: "BDT (৳)",
    highlights: [
      "Access to experienced Indian specialists",
      "Bengali and English-speaking doctors",
      "Affordable consultation fees",
      "Chronic disease follow-ups",
    ],
    faqs: [
      {
        question: "Can Bangladeshi patients consult doctors on TechDrHealth?",
        answer:
          "Yes. Patients in Bangladesh can book video consultations with verified specialists for non-emergency healthcare.",
      },
      {
        question: "Are Bengali-speaking doctors available?",
        answer:
          "Yes. Filter by language to find Bengali, Hindi, and English-speaking specialists.",
      },
    ],
  },
  {
    slug: "nepal",
    name: "Nepal",
    flag: "🇳🇵",
    description:
      "Online doctor consultations for Nepali patients. Video telehealth with verified Indian specialists for affordable specialist access.",
    intro:
      "Nepali patients access experienced specialist care via HD video without traveling abroad. Ideal for second opinions and chronic disease management.",
    timezone: "NPT (UTC+5:45)",
    currency: "NPR (रू)",
    highlights: [
      "Access to Indian specialists without travel",
      "Hindi and English-speaking doctors",
      "Affordable fees",
      "Rural and urban access",
    ],
    faqs: [
      {
        question: "Is TechDrHealth available for Nepali patients?",
        answer:
          "Yes. Nepali patients can book video consultations with verified specialists from anywhere in Nepal.",
      },
      {
        question: "Do I need to travel to India for follow-up?",
        answer:
          "No. Most follow-ups and chronic care can be managed via video consultation. In-person visits are recommended only when physically necessary.",
      },
    ],
  },
  {
    slug: "sri-lanka",
    name: "Sri Lanka",
    flag: "🇱🇰",
    description:
      "Video doctor consultations for Sri Lankan patients. Access verified Indian specialists for telehealth, second opinions, and affordable specialist care.",
    intro:
      "Sri Lankan patients consult experienced specialists via secure HD video. Popular for dermatology, general medicine, and chronic disease follow-ups.",
    timezone: "SLST (UTC+5:30)",
    currency: "LKR (රු)",
    highlights: [
      "Experienced Indian specialists",
      "Tamil, Sinhala, and English support",
      "Affordable consultation fees",
      "Secure video platform",
    ],
    faqs: [
      {
        question: "Can Sri Lankan patients book online consultations?",
        answer:
          "Yes. Sri Lankan patients can book non-emergency video consultations with verified specialists.",
      },
      {
        question: "Are Tamil-speaking doctors available?",
        answer:
          "Yes. Filter the doctor directory by language to find Tamil, English, and Hindi-speaking specialists.",
      },
    ],
  },
  {
    slug: "france",
    name: "France",
    flag: "🇫🇷",
    description:
      "Online specialist consultations for patients in France. Video telehealth with English-speaking verified doctors for second opinions and chronic care.",
    intro:
      "French residents and expats can access specialist video consultations in English for non-urgent care, second opinions, and chronic disease management.",
    timezone: "CET/CEST",
    currency: "EUR (€)",
    highlights: [
      "English-speaking specialists",
      "Second opinions and chronic care",
      "Secure privacy-first platform",
      "Flexible international scheduling",
    ],
    faqs: [
      {
        question: "Can French residents use TechDrHealth?",
        answer:
          "Yes, for non-emergency consultations and second opinions. TechDrHealth complements the French healthcare system.",
      },
      {
        question: "Are doctors available in French?",
        answer:
          "Most consultations are in English. Filter by language to find doctors who speak French, English, or Hindi.",
      },
    ],
  },
];

export function getGlobalRegion(slug: string): GlobalRegion | undefined {
  return GLOBAL_REGIONS.find((r) => r.slug === slug);
}

export function listGlobalRegionSlugs(): string[] {
  return GLOBAL_REGIONS.map((r) => r.slug);
}
