import type { BlogPostRecord } from "@/types/catalog";

const cov =
  "/images/placeholders/blog-cover.svg";

export const BLOG_POSTS: BlogPostRecord[] = [
  {
    slug: "how-to-consult-doctor-online-india",
    title: "How to Consult a Doctor Online in India: Step-by-Step Guide",
    excerpt:
      "Device checks, documents to keep ready, and what to expect in a telemedicine visit on techDr Tele Health.",
    category: "Guides",
    author: { name: "Dr. Manish Gupta", slug: "dr-manish-gupta-general", role: "General Medicine" },
    publishedAt: "2025-12-12",
    readingMinutes: 8,
    coverImage: cov,
    specialtySlug: "general-medicine",
    body: `
## Prepare your space and devices

Pick a quiet, well-lit room and test your camera and microphone beforehand. Stable Wi-Fi prevents dropped calls mid-consultation.

## Gather documents

Have your medication list, recent labs, imaging summaries, and vital signs if you track them at home.

## Join on time

Use the secure link from your confirmation email. Latency improves when fewer apps run in the background.

## Describe symptoms clearly

Timeline, severity, triggers, and what you have already tried helps your clinician decide next steps efficiently.

## After the visit

Save your visit summary and fill prescriptions promptly. Schedule follow-ups if advised.
`,
  },
  {
    slug: "ten-conditions-teleconsultation",
    title: "10 Conditions You Can Often Manage via Teleconsultation",
    excerpt:
      "From migraine follow-ups to dermatology—when remote care works well and when to seek emergency care.",
    category: "Health",
    author: { name: "Dr. Priya Mehta", slug: "dr-priya-mehta-cardiology", role: "Cardiology" },
    publishedAt: "2025-11-28",
    readingMinutes: 7,
    coverImage: cov,
    specialtySlug: "general-medicine",
    body: `
## Stable chronic conditions

Hypertension and diabetes medication tuning often succeed with home logs and labs done locally.

## Skin conditions

Many rashes and acne plans use clear photography alongside history.

## Mental health follow-ups

Anxiety and depression medication management is well studied in telepsychiatry models.

## Migraine care

Headache calendars make remote preventive therapy adjustments effective.

## When teleconsult is not enough

Chest pain with exertion, stroke symptoms, severe shortness of breath, or acute abdomen need emergency services.
`,
  },
  {
    slug: "is-online-doctor-consultation-safe",
    title: "Is Online Doctor Consultation Safe? What You Need to Know",
    excerpt:
      "Privacy, clinical limits, and how techDr Tele Health aligns with evidence-based telemedicine practice.",
    category: "Safety",
    author: { name: "Dr. Anjali Desai", slug: "dr-anjali-desai-psychiatry", role: "Psychiatry" },
    publishedAt: "2025-11-15",
    readingMinutes: 9,
    coverImage: cov,
    specialtySlug: "psychiatry",
    body: `
## Clinical appropriateness

Telemedicine excels when diagnosis relies on history, visual clues, and trend data. Physical exam–dependent emergencies are redirected.

## Privacy

Encrypted sessions and careful documentation mirror modern hospital information governance expectations.

## Medication safety

Prescriptions follow jurisdictional rules and clinical judgment—not patient demand alone.

## Know your limits

If red-flag symptoms appear during a call, your doctor will advise immediate escalation.
`,
  },
  {
    slug: "choose-right-specialist-symptoms",
    title: "How to Choose the Right Specialist for Your Symptoms",
    excerpt:
      "Navigate primary versus specialist entry points and prepare questions before you book.",
    category: "Guides",
    author: { name: "Dr. Manish Gupta", slug: "dr-manish-gupta-general", role: "General Medicine" },
    publishedAt: "2025-11-02",
    readingMinutes: 6,
    coverImage: cov,
    specialtySlug: "general-medicine",
    body: `
## Start with pattern recognition

Digestive burning after meals differs from exertional chest pressure—your internist helps route testing.

## Use internists as quarterbacks

Complex symptoms often benefit from one coordinating clinician before parallel specialist visits.

## Specialty landing pages

Our specialty hubs explain typical conditions treated—compare that list with your symptoms cluster.

## Second opinions

Bring imaging summaries rather than guessing imaging language—accuracy improves recommendations.
`,
  },
  {
    slug: "teleconsultation-vs-in-person",
    title: "Teleconsultation vs In-Person Visits: When to Choose Each",
    excerpt:
      "A practical framework for efficiency without compromising safety.",
    category: "Guides",
    author: { name: "Dr. Priya Mehta", slug: "dr-priya-mehta-cardiology", role: "Cardiology" },
    publishedAt: "2025-10-20",
    readingMinutes: 8,
    coverImage: cov,
    specialtySlug: "cardiology",
    body: `
## Choose teleconsult for

Medication reviews, counseling-heavy visits, imaging result interpretation, and chronic follow-ups with objective home metrics.

## Prefer in-person for

Conditions requiring palpation, acute severe undifferentiated symptoms, procedures, or vaccines.

## Hybrid models

Many patients alternate—tele for tuning, in-person annually or when exam-dependent milestones arise.
`,
  },
  {
    slug: "when-to-see-cardiologist",
    title: "When Should You See a Cardiologist?",
    excerpt:
      "Red flags, prevention windows, and how tele cardiology supports blood pressure and lipid goals.",
    category: "Specialty",
    author: { name: "Dr. Priya Mehta", slug: "dr-priya-mehta-cardiology", role: "Cardiology" },
    publishedAt: "2025-10-08",
    readingMinutes: 7,
    coverImage: cov,
    specialtySlug: "cardiology",
    body: `
## Risk factors

Diabetes, smoking, strong family history of premature heart disease, chronic kidney disease, and resistant hypertension merit cardiology input.

## Symptoms

New exertional chest tightness, syncope with exertion, or palpitations with structural heart concerns deserve structured evaluation.

## Remote support

Home BP logs and lipid panels enable medication optimization between stress tests or echocardiograms performed locally.
`,
  },
  {
    slug: "when-to-see-dermatologist",
    title: "When Should You See a Dermatologist Online?",
    excerpt:
      "Photo tips, acne and eczema ladders, and biopsy triggers explained.",
    category: "Specialty",
    author: { name: "Dr. Neha Verma", slug: "dr-neha-verma-dermatology", role: "Dermatology" },
    publishedAt: "2025-09-22",
    readingMinutes: 6,
    coverImage: cov,
    specialtySlug: "dermatology",
    body: `
## Photography matters

Natural light and multiple angles distinguish morphology patterns.

## Chronic inflammatory disease

Psoriasis and eczema benefit from stepped topical and systemic strategies tailored to distribution.

## Suspicious lesions

Changing moles require dermoscopy or biopsy—not guesswork online.
`,
  },
  {
    slug: "telepsychiatry-evidence-india",
    title: "Telepsychiatry in India: Evidence and Practical Tips",
    excerpt:
      "Privacy, continuity, and combining therapy with medication management.",
    category: "Mental Health",
    author: { name: "Dr. Karthik Menon", slug: "dr-karthik-menon-psychiatry", role: "Psychiatry" },
    publishedAt: "2025-09-10",
    readingMinutes: 8,
    coverImage: cov,
    specialtySlug: "psychiatry",
    body: `
## Alliance through video

Eye contact and pacing still translate when cameras are positioned well.

## Therapy integration

Medication alone is not always optimal—combine with CBT or related modalities when indicated.

## Crisis pathways

Emergency resources must be identified before crises—store hotline numbers visibly.
`,
  },
  {
    slug: "best-online-doctors-diabetes",
    title: "Getting the Best Online Care for Diabetes in India",
    excerpt:
      "CGM trends, fasting patterns, and kidney-aware medication selection.",
    category: "Diabetes",
    author: { name: "Dr. Swati Kulkarni", slug: "dr-swati-kulkarni-diabetology", role: "Diabetology" },
    publishedAt: "2025-08-30",
    readingMinutes: 7,
    coverImage: cov,
    specialtySlug: "diabetology",
    body: `
## Data over anecdotes

Bring structured glucose downloads rather than selective fingerstick picks.

## Time in range

CGM metrics help clinicians adjust basal and bolus without guesswork.

## Whole-person goals

Sleep, stress, and activity integrate with pharmacotherapy for durable A1c improvements.
`,
  },
  {
    slug: "prescription-online-india-rules",
    title: "Can You Get a Prescription Online in India? Rules Patients Should Know",
    excerpt:
      "Follow-up prescriptions, scheduled substances, and documentation basics.",
    category: "Policy",
    author: { name: "Dr. Manish Gupta", slug: "dr-manish-gupta-general", role: "General Medicine" },
    publishedAt: "2025-08-12",
    readingMinutes: 7,
    coverImage: cov,
    specialtySlug: "general-medicine",
    body: `
## Telemedicine guidelines evolve

Qualified providers may prescribe when clinically appropriate—never guaranteed.

## Controlled substances

Additional safeguards often require in-person evaluation cycles.

## Continuity matters

First visits may emphasize assessment; renewals streamline when stable.
`,
  },
  {
    slug: "pediatric-fever-triage-home",
    title: "Pediatric Fever: When to Stay Home vs Seek Emergency Care",
    excerpt:
      "Hydration cues, breathing signs, and age-specific thresholds.",
    category: "Pediatrics",
    author: { name: "Dr. Sanjay Pillai", slug: "dr-sanjay-pillai-pediatrics", role: "Pediatrics" },
    publishedAt: "2025-07-22",
    readingMinutes: 6,
    coverImage: cov,
    specialtySlug: "pediatrics",
    body: `
## Infant considerations

Young infants with fever often need urgent evaluation—follow local protocols.

## Respiratory distress

Nasal flaring, grunting, or blue tones mean emergency—not tele delay.

## Hydration

Urine frequency and tear production guide oral rehydration success.
`,
  },
  {
    slug: "kidney-health-blood-pressure",
    title: "Protecting Kidney Health: Blood Pressure Goals You Should Discuss",
    excerpt:
      "CKD staging basics and why cardiorenal synergy matters.",
    category: "Kidney Health",
    author: { name: "Dr. Pallavi Shah", slug: "dr-pallavi-shah-nephrology", role: "Nephrology" },
    publishedAt: "2025-07-05",
    readingMinutes: 8,
    coverImage: cov,
    specialtySlug: "nephrology",
    body: `
## Protein matters

Albuminuria changes targets—coordinate ACE/ARB discussions with labs.

## Avoid nephrotoxins

NSAID overuse and contrast protocols should be individualized.

## Multidisciplinary care

Diabetes and hypertension control dominate progression risk—tele visits support titration loops.
`,
  },
];

export function getBlogBySlug(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function latestPosts(n = 3) {
  return [...BLOG_POSTS].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  ).slice(0, n);
}
