import type { SpecialtyRecord } from "@/types/catalog";

export const SPECIALTIES: SpecialtyRecord[] = [
  {
    slug: "cardiology",
    name: "Cardiology",
    shortIntro:
      "Expert cardiologists for blood pressure, chest pain, palpitations, and heart risk—online, with clear follow-up plans.",
    iconKey: "Heart",
    conditions: [
      "Hypertension",
      "Coronary artery disease",
      "Heart failure",
      "Arrhythmias",
      "High cholesterol",
      "Post-heart attack care",
      "Chest pain evaluation",
      "Palpitations",
      "Preventive cardiology",
      "Peripheral artery disease",
      "Stress test follow-up",
    ],
    relatedSlugs: ["endocrinology", "nephrology", "general-medicine"],
    description: `Cardiology focuses on disorders of the heart and blood vessels, from hypertension and coronary disease to rhythm problems and structural heart conditions. Teleconsultation is highly effective for medication titration, lifestyle coaching, interpretation of recent investigations, and planning in-person tests when needed. Patients across India increasingly choose online cardiologist consultations to reduce travel, access second opinions faster, and maintain continuity with the same specialist.

During a structured video visit, a qualified cardiologist can review your history, symptoms, blood pressure logs, ECG uploads, lab results, and prior imaging summaries. Many conditions—including blood pressure management, lipid optimization, stable angina follow-up, and medication reviews—can be guided safely online with clear escalation criteria if red-flag symptoms appear. Telecare also helps after hospital discharge or stent procedures, ensuring you understand medications, activity levels, and warning signs.

At techDr Tele Health, our cardiologists emphasize evidence-based therapy, shared decision-making, and culturally appropriate diet and activity guidance. We explain trade-offs clearly, coordinate with your local physician, and document a care plan you can follow at home. If your condition requires physical examination, stress testing, or urgent care, your doctor will direct you promptly to the right facility.

Common goals in online cardiology visits include refining antihypertensive regimens, interpreting palpitations in context, preparing for elective procedures, and reducing long-term cardiovascular risk using a holistic plan—nutrition, sleep, stress, smoking cessation, and appropriate screening. Whether you live in a metro or a tier-2 city, you can consult a cardiologist online to stay on track between in-person appointments.

Choose teleconsultation when you need timely expert input, prescription adjustments, lifestyle planning, or simply peace of mind from a verified specialist.`,
    faq: [
      {
        question: "Can a cardiologist help me online without a physical exam?",
        answer:
          "Yes, for many stable conditions and follow-ups. Your doctor uses your history, vitals you measure at home, uploaded ECGs, and lab work. They will advise in-person evaluation for acute chest pain, fainting with injury, or other red flags.",
      },
      {
        question: "What should I keep ready for a heart specialist online visit?",
        answer:
          "Recent blood pressure readings, medication list, prior ECG or echo reports, lipid panels, and a short symptom timeline. If you use a smartwatch ECG export, upload that as well.",
      },
      {
        question: "Will I get a prescription after an online cardiology consultation?",
        answer:
          "If medically appropriate and compliant with telemedicine guidelines, your doctor may provide a prescription with clear documentation. Emergency symptoms require emergency care—not teleconsult.",
      },
    ],
  },
  {
    slug: "dermatology",
    name: "Dermatology",
    shortIntro:
      "Visible skin, hair, and nail concerns reviewed by dermatologists—with clear treatment plans and follow-up.",
    iconKey: "Sparkles",
    conditions: [
      "Acne",
      "Eczema",
      "Psoriasis",
      "Fungal infections",
      "Hair loss",
      "Urticaria",
      "Rosacea",
      "Pigmentation disorders",
      "Nail disorders",
      "Sexually transmitted dermatoses (evaluation)",
    ],
    relatedSlugs: ["allergy-immunology", "general-medicine", "psychiatry"],
    description: `Dermatology addresses the skin, hair, nails, and mucous membranes—conditions that are often visible and photograph-friendly, making teleconsultation uniquely practical. Patients seeking an online dermatologist consultation can upload high-quality images, describe evolution of rashes, and receive structured therapy plans including topical regimens, oral medications when indicated, and guidance on cosmetics or triggers.

Tele dermatology excels for inflammatory conditions like eczema and psoriasis flares, acne treatment ladders, fungal infections when clinical pattern is clear, and chronic urticaria management. Your dermatologist educates on gentle skin barrier repair, sunscreen use, and photoprotection tailored to Indian tones and climates. For lesions requiring dermoscopy or biopsy, your doctor coordinates timely in-person referral.

Video visits also support medication safety—reviewing steroid potency, duration limits, pregnancy considerations, and interactions. Many patients appreciate discreet access for scalp disorders, pigmentary concerns, or adolescent acne without long clinic waits.

techDr Tele Health dermatologists prioritize accurate diagnosis cues—distribution, morphology, aggravating factors—and clear documentation you can share with local pharmacies or labs. Whether you need a rapid flare plan or long-term clearance strategy, specialist-led teleconsultation combines convenience with accountability.

Choose online dermatology when you want expert guidance on persistent skin conditions, cosmetic dermatology counseling within medical scope, or coordinated care with allergy and internal medicine colleagues.`,
    faq: [
      {
        question: "Are photos enough for an online dermatology diagnosis?",
        answer:
          "Often yes for many inflammatory and infectious patterns when images are well-lit and in focus. Your doctor may request additional angles or in-person biopsy if a lesion looks suspicious.",
      },
      {
        question: "How should I photograph a skin rash?",
        answer:
          "Use natural light, avoid flash glare, include a reference object for scale, capture close-ups and wider context shots, and photograph progressive changes over days if possible.",
      },
      {
        question: "Can dermatology prescribe isotretinoin online?",
        answer:
          "Protocols vary by risk and regulation. Your dermatologist will explain monitoring needs and whether an in-person visit or lab monitoring is mandatory before certain therapies.",
      },
    ],
  },
  {
    slug: "gynecology",
    name: "Gynecology",
    shortIntro:
      "Women’s health visits for periods, contraception, infections, PCOS, and menopause—private and judgment-free.",
    iconKey: "Flower2",
    conditions: [
      "Irregular periods",
      "PCOS",
      "Menopause symptoms",
      "Contraception counseling",
      "UTI evaluation",
      "Vaginal infections",
      "Pelvic pain triage",
      "Pap follow-up counseling",
      "Family planning",
      "Pregnancy-related counseling (non-emergency)",
    ],
    relatedSlugs: ["fertility-ivf", "endocrinology", "general-medicine"],
    description: `Gynecology covers menstrual health, contraception, infections, pelvic pain, menopause, and preventive screening counseling. Teleconsultation offers privacy, reduces stigma, and helps patients who cannot travel due to work or childcare. While not every complaint can be fully managed online, many common issues benefit from structured history-taking, symptom diaries, and laboratory-directed care.

During a gynecologist online appointment, you can discuss cycle mapping, contraceptive choices, PCOS lifestyle and medication plans, recurrent UTI prevention, and menopausal hot flash management. Your physician will identify when speculum exams, ultrasound, or STI testing must be arranged locally—and provide a clear request form to guide that visit.

Non-pregnant patients often need counseling on abnormal bleeding patterns, contraceptive side effects, or vaginitis symptom clusters that narrow diagnosis before swabs. Telemedicine complements—not replaces—cancer screening programs; your doctor will align with national guidelines for Pap and HPV strategies.

At techDr Tele Health, we respect confidentiality, communicate clearly about emergency symptoms like severe pain or heavy bleeding, and integrate multidisciplinary support when endocrine or mental health factors overlap. Cultural sensitivity and consent are central to every visit.

Online gynecology is ideal when you need timely specialist advice, prescription adjustments, contraception changes, or pre-visit preparation so local testing is targeted and efficient.`,
    faq: [
      {
        question: "Can I get birth control prescribed online?",
        answer:
          "Often yes after a thorough risk assessment and blood pressure history when relevant. Emergency symptoms need urgent in-person care.",
      },
      {
        question: "When is gynecology teleconsult not appropriate?",
        answer:
          "Suspected ectopic pregnancy, severe acute pain, heavy bleeding with instability, or fever with pelvic symptoms require emergency services or in-person evaluation.",
      },
      {
        question: "How private is the visit?",
        answer:
          "Sessions are encrypted and conducted in secure rooms. Choose a private space and use headphones for additional comfort.",
      },
    ],
  },
  {
    slug: "pediatrics",
    name: "Pediatrics",
    shortIntro:
      "Child health guidance from feeding and fever protocols to growth, allergies, and developmental red flags.",
    iconKey: "Baby",
    conditions: [
      "Common colds",
      "Fever protocols",
      "Allergic rhinitis",
      "Asthma follow-up",
      "Eczema in children",
      "Nutrition counseling",
      "Sleep and routine",
      "Vaccine schedule questions",
      "ADHD triage",
      "Constipation",
    ],
    relatedSlugs: ["general-medicine", "allergy-immunology", "psychiatry"],
    description: `Pediatrics centers on infants, children, and adolescents—a population where caregiver education and safety-netting matter as much as diagnosis. Telepediatrics can accelerate access to specialist advice on feeding difficulties, recurrent wheeze, eczema regimens, sleep or behavior patterns, and growth concerns—especially when paired with locally obtained vitals and growth charts.

Video allows observation of breathing work, hydration status clues, interaction, and limited physical signs. Pediatricians emphasize red-flag criteria for sepsis, respiratory distress, dehydration, or neurologic emergencies—situations where emergency departments remain essential.

Parents often seek online pediatric consultation for clarity after conflicting advice, medication dosing reassurance, school-health forms, and coordinated plans with teachers or therapists. Breastfeeding medicine overlaps may be guided alongside lactation support resources.

techDr Tele Health pediatricians communicate age-appropriately with teens when indicated, involve guardians transparently, and align with vaccination schedules endorsed by national bodies.

Teleconsultation suits non-emergency guidance, chronic disease follow-up, behavioral health integration, and care navigation. It should not delay care when a child looks seriously unwell—your doctor will say so plainly.`,
    faq: [
      {
        question: "Can antibiotics be prescribed online for my child?",
        answer:
          "Only when medically appropriate after assessment. Many childhood infections are viral; antibiotics are avoided when unnecessary. Severe infections need in-person care.",
      },
      {
        question: "What vitals help a telepediatrics visit?",
        answer:
          "Temperature, breathing rate observations, urine output estimates, oral intake, alertness, and rash photos when relevant.",
      },
      {
        question: "Do you see adolescents privately?",
        answer:
          "Protocols depend on age, maturity, and legal frameworks. Your doctor explains consent models and involves guardians when safety requires it.",
      },
    ],
  },
  {
    slug: "psychiatry",
    name: "Psychiatry",
    shortIntro:
      "Evidence-based mental health care for anxiety, depression, ADHD, and more—with therapy coordination options.",
    iconKey: "Brain",
    conditions: [
      "Depression",
      "Anxiety disorders",
      "Panic disorder",
      "Insomnia",
      "ADHD",
      "Bipolar disorder (stable follow-up)",
      "OCD",
      "PTSD",
      "Stress burnout",
      "Addiction counseling triage",
    ],
    relatedSlugs: ["neurology", "general-medicine", "pediatrics"],
    description: `Psychiatry addresses mental health conditions with biological, psychological, and social lenses. Telepsychiatry has strong evidence for mood and anxiety disorders, ADHD follow-up, and medication management when combined with safety planning. Many patients prefer home-based visits that reduce stigma and commute burden.

Psychiatrist teleconsultation includes detailed history, validated screening tools, risk assessment for self-harm, and collaborative goal setting. Therapy referrals may complement medications. Crisis situations require emergency resources; your clinician will identify them.

Medication initiation and titration, side-effect management, sleep-wake schedules, and work accommodations are commonly managed online with scheduled follow-ups. Cultural context around family expectations, career stress, and social support is integrated.

techDr Tele Health psychiatrists document clearly, coordinate with counselors, and communicate with consent to other specialists when comorbid endocrine or neurological issues exist.

Online psychiatry fits therapy-responsive conditions with structured follow-up—not acute mania with impulsivity, acute psychosis without support, or intoxication crises. Your safety is paramount; escalation pathways are explicit.`,
    faq: [
      {
        question: "Is telepsychiatry as effective as in-person care?",
        answer:
          "For many mood and anxiety conditions, outcomes are comparable when visits are regular and therapeutic alliance is nurtured through video.",
      },
      {
        question: "What about controlled substances?",
        answer:
          "Prescribing follows local regulations and clinical appropriateness. Some controlled medications may require in-person evaluation per policy.",
      },
      {
        question: "What if I’m in crisis?",
        answer:
          "Contact local emergency services or a crisis hotline immediately. Telehealth is not a substitute for emergencies.",
      },
    ],
  },
  {
    slug: "orthopedics",
    name: "Orthopedics",
    shortIntro:
      "Sports injuries, joint pain, spine complaints, and post-operative guidance from orthopedic specialists.",
    iconKey: "Bone",
    conditions: [
      "Knee pain",
      "Shoulder pain",
      "Low back pain (non-red flag)",
      "Sprains and strains",
      "Arthritis management",
      "Post-fracture rehab planning",
      "Plantar fasciitis",
      "Tennis elbow",
      "Meniscus tear triage",
      "Osteoporosis counseling",
    ],
    relatedSlugs: ["rheumatology", "neurology", "general-medicine"],
    description: `Orthopedics manages muscles, bones, joints, ligaments, and tendons. While physical examination remains important, tele orthopedics adds value in triage, rehabilitation planning, imaging review, and post-operative checklists. Patients can demonstrate range of motion on video and share X-ray or MRI summaries.

Musculoskeletal complaints are among the top reasons working-age adults seek care. An online orthopedic consultation clarifies likely diagnoses, braces or splints, physiotherapy prescriptions, ergonomic changes, and when MRI or surgery discussion is warranted—reducing unnecessary imaging.

Sports medicine topics—overuse injuries, load management, return-to-play grading—translate well to virtual coaching with objective functional tests demonstrated at home.

techDr Tele Health orthopedic specialists align with rheumatology when inflammatory arthritis is suspected, and with neurosurgery referral pathways for progressive weakness or cauda equina symptoms.

Choose teleconsultation for injury guidance, conservative care strategies, second opinions on MRI language, and prehab before procedures. Emergency neurovascular compromise or open fractures always need immediate hospital care.`,
    faq: [
      {
        question: "Can you diagnose a tear without touching my knee?",
        answer:
          "Often we can estimate probability from mechanism, exam maneuvers you perform with instruction, and imaging if available—but some cases need in-person orthopedic exam.",
      },
      {
        question: "Should I get an MRI before the call?",
        answer:
          "Not always. Your doctor may start with history-driven management; unnecessary MRIs carry cost and incidental findings.",
      },
      {
        question: "What red flags mean emergency care?",
        answer:
          "Loss of pulse, severe deformity, numbness in the saddle area, bowel or bladder dysfunction with back pain, or fever with a joint—seek emergency care.",
      },
    ],
  },
  {
    slug: "neurology",
    name: "Neurology",
    shortIntro:
      "Headaches, seizures, neuropathy, and movement symptoms—guided by neurologists with clear escalation criteria.",
    iconKey: "Activity",
    conditions: [
      "Migraine",
      "Tension headache",
      "Epilepsy follow-up",
      "Peripheral neuropathy",
      "Tremor evaluation",
      "Multiple sclerosis follow-up",
      "Stroke risk factors",
      "Vertigo triage",
      "Cognitive concerns (non-acute)",
      "Restless legs",
    ],
    relatedSlugs: ["psychiatry", "endocrinology", "cardiology"],
    description: `Neurology spans the central and peripheral nervous systems. Tele neurology aids in headache pattern recognition, seizure medication titration with patient diaries, tremor characterization on video, and longitudinal MS care—especially for stable patients balancing travel constraints.

Migraine care—lifestyle triggers, acute therapy plans, preventive regimens—is well suited to virtual visits with structured headache calendars. Peripheral neuropathy may be guided with blood tests done locally and foot exam coaching for diabetics.

Neurologists use teleconsultation to review prior imaging reports, coordinate physical therapy for vertigo variants, and counsel families on prognosis. Acute stroke, sudden focal weakness, thunderclap headache, or new seizure with injury are emergencies beyond telemedicine scope.

techDr Tele Health neurologists highlight when lumbar puncture, EMG, or inpatient care is indicated, and expedite referrals. Cognitive concerns are handled sensitively with caregiver input and depression screening overlap.

Tele neurology strengthens access in regions with shortages of subspecialists, while preserving safety nets for urgent presentations.`,
    faq: [
      {
        question: "Can migraines be treated fully online?",
        answer:
          "Often yes with trigger management, acute and preventive medications, and lifestyle structure. Red flags need neuroimaging or emergency services.",
      },
      {
        question: "Do I need EEG for seizure follow-up?",
        answer:
          "Sometimes. Your neurologist decides based on seizure type, control, and changes. EEG is arranged locally when necessary.",
      },
      {
        question: "How do you assess tremor virtually?",
        answer:
          "Through directed tasks—rest and action components, handwriting samples, and gait when visible—correlated with medication history.",
      },
    ],
  },
  {
    slug: "endocrinology",
    name: "Endocrinology",
    shortIntro:
      "Hormonal health—thyroid, adrenal, pituitary, calcium—and integrated diabetes care with coordinated labs.",
    iconKey: "Zap",
    conditions: [
      "Hypothyroidism",
      "Hyperthyroidism",
      "Thyroid nodules (triage)",
      "Diabetes mellitus",
      "PCOS (endocrine aspects)",
      "Osteoporosis",
      "Adrenal disorders",
      "Calcium disorders",
      "Growth concerns (referred pathways)",
      "Transgender hormone therapy counseling (policy-based)",
    ],
    relatedSlugs: ["diabetology", "gynecology", "nephrology"],
    description: `Endocrinology manages hormones—from thyroid, adrenal, and pituitary axes to metabolic bone disease. Tele endocrinology enables lab-driven titration of levothyroxine, diabetes medication optimization with glucose downloads, and nuanced discussion of testosterone replacement candidates.

Patients upload trends rather than single-point labs, enabling safer adjustments. Thyroid ultrasound or biopsy cannot be replaced online; endocrinologists advise when fine-needle aspiration is indicated based on ultrasound reports.

Diabetes overlaps often involve cardiometabolic goals—blood pressure and lipids coordinated with nutrition counseling. CGM data integration enhances remote insulin adjustments when available.

techDr Tele Health endocrinologists communicate cross-specialty with cardiology for GLP-1 agonists in high-risk patients, nephrology for diabetic kidney disease, and OB-GYN for gestational pathways.

Teleconsultation excels at longitudinal hormone disorder management when monitoring infrastructure exists locally. Hyperglycemic crises or adrenal crises remain emergencies.`,
    faq: [
      {
        question: "Can diabetes medications be adjusted remotely?",
        answer:
          "Yes with glucose logs or CGM exports and kidney function awareness. Severe hyperglycemia or DKA needs emergency management.",
      },
      {
        question: "How often should thyroid labs be checked after a dose change?",
        answer:
          "Typically 6–8 weeks for levothyroxine adjustments, sooner if clinically indicated—your endocrinologist sets a personalized schedule.",
      },
      {
        question: "Do you treat osteoporosis online?",
        answer:
          "Counseling, risk scoring, and therapy selection—yes; DXA scans are arranged locally when needed.",
      },
    ],
  },
  {
    slug: "gastroenterology",
    name: "Gastroenterology",
    shortIntro:
      "Digestive symptoms, IBS, GERD, liver enzyme issues, and colon health counseling with clear test plans.",
    iconKey: "Apple",
    conditions: [
      "GERD",
      "IBS",
      "IBD follow-up",
      "Chronic constipation",
      "Fatty liver",
      "Hepatitis B/C counseling",
      "Peptic ulcer disease",
      "Celiac suspicion",
      "Gallstone triage",
      "Colonoscopy prep counseling",
    ],
    relatedSlugs: ["general-medicine", "oncology", "endocrinology"],
    description: `Gastroenterology spans esophagus to colon, plus liver and pancreas. History-rich conditions like GERD, IBS, functional dyspepsia, and medication-related liver injury can be explored deeply in teleconsultation with diet diaries and targeted labs.

Patients share endoscopy or colonoscopy reports for interpretation, polyp surveillance intervals, and IBD maintenance plans. Stool studies or breath tests may be ordered through partner labs based on geography.

Tele GI care educates on red-flag symptoms—bleeding, weight loss, iron deficiency anemia—that must trigger timely endoscopy. Screening age-appropriate colorectal strategies are personalized to family history.

techDr Tele Health gastroenterologists align with oncology for alarm symptoms, hepatology pathways for abnormal LFTs, and surgery for complicated gallbladder disease.

Online consultation streamlines flare management for known IBD with shared decision-making on step-up therapy and monitoring. Emergencies like suspected acute abdomen or massive bleeding always need emergency departments.`,
    faq: [
      {
        question: "Can IBS be diagnosed online?",
        answer:
          "Often yes using Rome criteria and alarm feature screening. Sometimes limited testing excludes mimics like celiac disease.",
      },
      {
        question: "When do I need endoscopy urgently?",
        answer:
          "Difficulty swallowing with weight loss, GI bleeding, iron deficiency anemia without explanation, or new persistent vomiting.",
      },
      {
        question: "Can you prescribe PPIs long-term online?",
        answer:
          "With periodic review for bone, kidney, and infection risk, and attempts to step down when possible.",
      },
    ],
  },
  {
    slug: "pulmonology",
    name: "Pulmonology",
    shortIntro:
      "Asthma, COPD, cough evaluation, sleep apnea triage, and post-COVID breathing concerns.",
    iconKey: "Wind",
    conditions: [
      "Asthma",
      "COPD",
      "Chronic cough",
      "Allergic bronchitis",
      "Sleep apnea triage",
      "Post-viral fatigue dyspnea",
      "Pneumonia follow-up",
      "Interstitial lung disease follow-up",
      "Smoking cessation",
      "Pulmonary hypertension screening education",
    ],
    relatedSlugs: ["allergy-immunology", "cardiology", "general-medicine"],
    description: `Pulmonology treats lung and pleural conditions. Tele pulmonology leverages home spirometry when available, inhaler technique checks over video, cough characterization, and oximetry readings. Asthma and COPD action plans translate beautifully to virtual care with objective trends.

Sleep apnea suspicion can be triaged with screening questionnaires and arranged home sleep studies. Post-viral dyspnea syndromes need cardiopulmonary differentiation—pulmonologists coordinate testing for PE, anemia, anxiety overlap, or deconditioning.

Interstitial lung disease patients benefit from imaging review and oxygen needs discussion, while recognizing that high-resolution CT must be obtained locally.

techDr Tele Health pulmonologists stress infection control education, vaccination strategies, and PR (pulmonary rehabilitation) prescriptions. Acute severe shortness of breath, hypoxia, or hemoptysis are not for telemedicine.

Teleconsultation helps you stay on guideline-based inhaler therapy, optimize smoking cessation pharmacotherapy, and navigate long COVID symptom clusters with realistic expectations.`,
    faq: [
      {
        question: "Can you hear my lungs online?",
        answer:
          "We rely on symptom patterns, vitals you measure, history, and sometimes peak flow or spirometry devices at home—not auscultation directly.",
      },
      {
        question: "Do I need a chest X-ray before the call?",
        answer:
          "Only if indicated by persistent symptoms or risk factors—your pulmonologist will guide after history.",
      },
      {
        question: "Can oxygen therapy be started remotely?",
        answer:
          "Oxygen titration typically requires documented hypoxemia; we coordinate testing and DME prescriptions per local rules.",
      },
    ],
  },
  {
    slug: "ophthalmology",
    name: "Ophthalmology",
    shortIntro:
      "Red eye triage, dry eye, glaucoma medication questions, and diabetic eye follow-up counseling.",
    iconKey: "Eye",
    conditions: [
      "Dry eye",
      "Allergic conjunctivitis",
      "Blepharitis",
      "Refractive questions",
      "Glaucoma medication review",
      "Diabetic retinopathy follow-up counseling",
      "AMD education",
      "Stye management",
      "Computer vision syndrome",
      "Post-cataract questions (non-emergency)",
    ],
    relatedSlugs: ["endocrinology", "general-medicine", "diabetology"],
    description: `Ophthalmology is both highly visual and procedure-driven. Tele ophthalmology supports red-eye triage distinguishing allergic, viral, and bacterial patterns; dry eye stepwise therapy; glaucoma medication side effects; and counseling on diabetic retinopathy screening intervals with retinal imaging interpretation if uploaded.

Acute angle closure, penetrating injury, sudden vision loss, flashes and floaters with field defects, or chemical injury need emergency ophthalmology—not video.

Patients can learn contact lens hygiene, demonstrate pupillary concerns, and share slit-lamp photos from partner centers. Pediatric eye alignment questions may prompt timely specialist exams.

techDr Tele Health eye specialists align timing of anti-VEGF injections for AMD with retina centers and coordinate cataract readiness discussions when visual function data is present.

Teleconsultation offers education, medication optimization, and triage—not replacement for comprehensive dilated exams on appropriate schedules.`,
    faq: [
      {
        question: "Can pink eye be treated online?",
        answer:
          "Often—if symptoms match an allergic or typical viral pattern. Bacterial cases may need cultures; severe pain or vision loss needs emergency care.",
      },
      {
        question: "How often should diabetics screen for retinopathy?",
        answer:
          "Intervals depend on baseline findings and glycemic control—your ophthalmologist aligns with guideline-based schedules.",
      },
      {
        question: "Can I get glasses prescription online?",
        answer:
          "Some platforms offer refraction tech; clinically, updating refractive error still often needs in-person refraction for accuracy.",
      },
    ],
  },
  {
    slug: "ent",
    name: "ENT",
    shortIntro:
      "Ear, nose, and throat issues—sinusitis, hearing loss triage, vertigo overlap, tonsil questions.",
    iconKey: "Mic2",
    conditions: [
      "Allergic rhinitis",
      "Chronic sinusitis",
      "Vertigo overlap",
      "Hearing loss triage",
      "Tinnitus counseling",
      "Epistaxis first aid",
      "Tonsillitis follow-up",
      "Salivary gland swelling triage",
      "Voice strain",
      "Sleep apnea ENT aspects",
    ],
    relatedSlugs: ["allergy-immunology", "pulmonology", "neurology"],
    description: `ENT (otolaryngology) spans hearing, balance, sinonasal disease, voice, and airway. Tele ENT excels in chronic rhinosinusitis medication ladders, allergic rhinitis immunotherapy discussions, vertigo differentiation between peripheral and central red flags, and tinnitus counseling with sleep strategies.

Patients may share audiograms for interpretation or discuss CPAP intolerance with ENT overlap. Acute mastoiditis, airway compromise, epistaxis with hemodynamic impact, or sudden sensorineural hearing loss are emergencies.

techDr Tele Health ENT specialists coordinate endoscopy when hoarseness persists beyond expected windows, and fine-needle aspiration plans for thyroid nodules with suspicious features on ultrasound.

Virtual care streamlines medication management, allergy integration, and follow-up after surgery—wound checks when images help, pain control counseling, and return precautions.

Choose online ENT consultation for persistent non-emergency symptoms, second opinions on surgical recommendations, and comprehensive education on self-care maneuvers.`,
    faq: [
      {
        question: "Is sudden hearing loss an emergency?",
        answer:
          "Yes—sudden sensorineural hearing loss warrants urgent ENT or emergency evaluation for possible steroids and workup.",
      },
      {
        question: "Can sinus infections be treated online?",
        answer:
          "Often, with appropriate duration criteria and local resistance patterns considered. Complex or recurrent cases may need imaging.",
      },
      {
        question: "What helps tinnitus virtually?",
        answer:
          "CBT-informed strategies, sound therapy plans, sleep optimization, and evaluation for reversible causes like cerumen impaction locally.",
      },
    ],
  },
  {
    slug: "urology",
    name: "Urology",
    shortIntro:
      "UTI recurrence, prostate symptoms, kidney stone prevention, and men’s sexual health counseling.",
    iconKey: "Droplets",
    conditions: [
      "Recurrent UTI",
      "Prostate enlargement symptoms",
      "Kidney stone prevention",
      "Hematuria triage",
      "Erectile dysfunction",
      "Male infertility counseling",
      "Interstitial cystitis",
      "Overactive bladder",
      "Testicular pain triage",
      "Post-prostate surgery follow-up",
    ],
    relatedSlugs: ["nephrology", "gynecology", "oncology"],
    description: `Urology addresses urinary tract organs and male reproductive health. Tele urology supports uncomplicated UTI prevention strategies, BPH medication tuning with symptom scores, stone prevention metabolic panels, and sexual health counseling within guideline frameworks.

Patients upload flowmetry reports or IPSS scores; imaging summaries guide stone surgery decisions. PSA discussions occur with shared screening preferences and informed consent nuances.

Acute urinary retention, fever with obstruction, trauma to genitals, or suspected testicular torsion require emergency services.

techDr Tele Health urologists coordinate oncology pathways for hematuria workups and bladder cancer surveillance education. Female pelvic floor overlap may involve gynecology co-management.

Teleconsultation shines in longitudinal symptom tracking, medication optimization, and preparation for in-office procedures—so visits are efficient.`,
    faq: [
      {
        question: "Can erectile dysfunction be treated online?",
        answer:
          "Often—after cardiovascular risk screening and medication interaction review. Some therapies require in-person BP checks.",
      },
      {
        question: "When is blood in urine urgent?",
        answer:
          "Visible blood with clots, pain, or inability to urinate warrants urgent evaluation; microscopic hematuria needs timely workup planning.",
      },
      {
        question: "Can kidney stones be diagnosed online?",
        answer:
          "Suspicion yes—based on classic colic patterns and imaging if already done; definitive care planning integrates CT findings done locally.",
      },
    ],
  },
  {
    slug: "nephrology",
    name: "Nephrology",
    shortIntro:
      "Kidney health—CKD staging, electrolytes, dialysis education, transplant medication questions.",
    iconKey: "Filter",
    conditions: [
      "Chronic kidney disease",
      "Hypertensive nephrosclerosis",
      "Diabetic kidney disease",
      "Electrolyte disorders",
      "Nephrotic syndrome follow-up",
      "Dialysis modality education",
      "Transplant medication adjustments",
      "STONE prevention with CKD",
      "Anemia of CKD",
      "Medication renal dosing review",
    ],
    relatedSlugs: ["cardiology", "endocrinology", "urology"],
    description: `Nephrology focuses on kidney function, electrolytes, hypertension secondary to renal disease, dialysis, and transplantation medicine. Tele nephrology thrives on laboratory trends—eGFR trajectories, proteinuria quantification, mineral bone disorder labs—and medication adjustments with kidney-aware dosing.

CKD education empowers patients on blood pressure targets, RAAS inhibition where appropriate, SGLT2 inhibitor candidacy, and dialysis modality choices when nearing Stage 5.

Dialysis patients may discuss access issues triage—not definitive vascular decisions without exam—and transplant recipients require coordinated immunosuppression labs locally.

Hyperkalemia emergencies, anuria, or pulmonary edema from fluid overload require urgent in-person care.

techDr Tele Health nephrologists integrate cardiology for cardiorenal syndrome and endocrinology for glycemic agents in CKD.

Online nephrology optimizes chronic care, anticipates complications, and personalizes slowing of progression when evidence-based.`,
    faq: [
      {
        question: "Can CKD be managed online?",
        answer:
          "Yes—with regular labs from local labs and blood pressure home monitoring; specialist visits complement primary care.",
      },
      {
        question: "When should I go to ER for kidney issues?",
        answer:
          "Little or no urine output, confusion with high potassium suspicion, crushing chest pain with fluid overload, or BP extremes.",
      },
      {
        question: "Can you adjust transplant meds remotely?",
        answer:
          "Sometimes with trough levels—your center protocols and local labs must integrate; urgent rejection signs need immediate hospital care.",
      },
    ],
  },
  {
    slug: "oncology",
    name: "Oncology",
    shortIntro:
      "Cancer treatment education, symptom management, survivorship, and coordination—alongside your treating center.",
    iconKey: "Ribbon",
    conditions: [
      "Chemotherapy symptom management",
      "Immunotherapy side effects triage",
      "Survivorship fatigue",
      "Pain management coordination",
      "Nutrition during therapy",
      "Genetic counseling referral",
      "Surveillance planning education",
      "Radiation side effect counseling",
      "Tumor marker interpretation caveats",
      "Palliative supportive care",
    ],
    relatedSlugs: ["general-medicine", "psychiatry", "oncology"],
    description: `Oncology teleconsultation emphasizes education, toxicity triage guidance, survivorship planning, and psychosocial support—not replacing infusion centers or radiation facilities. Patients clarify treatment schedules, manage nausea patterns, understand lab trends, and receive empathy-rich counseling.

Immunotherapy immune-related adverse events may require urgent local assessment—tele oncologists educate on warning signs. Genetic risk discussions can initiate referrals for counseling.

Pain regimens align with multimodal strategies and specialist coordination. Survivorship addresses fear of recurrence, cardiometabolic late effects, and fertility preservation retrospectively where relevant.

techDr Tele Health oncologists respect institutional protocols from primary treating hospitals and augment—not contradict—those plans.

Tele oncology improves access for second opinions on imaging summaries and pathology reports when uploaded. Emergencies like neutropenic fever remain hospital pathways.

Compassionate, evidence-based conversations about goals of care may begin online with local follow-through.`,
    faq: [
      {
        question: "Is chemo prescribed online?",
        answer:
          "Infusional chemotherapy is administered in accredited centers; tele visits support symptom control and clarifications.",
      },
      {
        question: "What side effect needs ER now?",
        answer:
          "Fever during neutropenia, sudden shortness of breath, uncontrolled vomiting, chest pain, or new neurologic deficits.",
      },
      {
        question: "Can I get a second opinion online?",
        answer:
          "Yes by sharing pathology, imaging summaries, and treatment history; full records improve accuracy.",
      },
    ],
  },
  {
    slug: "general-medicine",
    name: "General Medicine",
    shortIntro:
      "Comprehensive adult primary care—prevention, chronic disease, and coordinated referrals when you need a specialist.",
    iconKey: "Stethoscope",
    conditions: [
      "Preventive health",
      "Hypertension",
      "Diabetes screening",
      "Thyroid screening",
      "Fatigue evaluation",
      "Travel health",
      "Minor infections triage",
      "Medication reconciliation",
      "Weight management",
      "Multimorbidity coordination",
    ],
    relatedSlugs: ["cardiology", "endocrinology", "psychiatry"],
    description: `General medicine (internal medicine) provides holistic adult care—combining prevention, diagnosis, and chronic disease management. Tele general medicine strengthens access to longitudinal relationships, medication safety reviews, and preventive planning with age-appropriate screening discussions.

Patients with multimorbidity benefit from a quarterback who integrates cardiology, endocrine, and kidney goals—reducing conflicting advice. Pre-travel consultations address vaccines and prophylaxis references per destination.

Telemedicine is not ideal for ambiguous acute severe illness; your internist screens for red flags and routes quickly. Lifestyle medicine—nutrition, sleep, substance use—anchors many visits.

techDr Tele Health internists emphasize shared decision-making, culturally aware communication, and clear documentation for family members when authorized.

Choose online general medicine for check-ins, chronic disease tuning, preventive strategizing, and coordinated specialty referrals—anchoring your health journey with consistency.`,
    faq: [
      {
        question: "Is telemedicine a replacement for a family doctor?",
        answer:
          "It complements local care—especially specialist access—but some exams and vaccines require in-person visits.",
      },
      {
        question: "Can you order labs online?",
        answer:
          "We provide lab requisitions integrated with partner networks where available; bring results back for interpretation.",
      },
      {
        question: "How do you handle emergencies?",
        answer:
          "We advise emergency services immediately and do not delay care for serious symptoms.",
      },
    ],
  },
  {
    slug: "diabetology",
    name: "Diabetology",
    shortIntro:
      "Focused diabetes care—CGM-driven titrations, hypoglycemia prevention, and complication risk reduction.",
    iconKey: "Syringe",
    conditions: [
      "Type 2 diabetes",
      "Type 1 diabetes (stable follow-up)",
      "Gestational diabetes counseling",
      "Insulin pump questions",
      "Hypoglycemia patterns",
      "DKA prevention education",
      "Diabetic foot screening education",
      "CGM interpretation",
      "Nutrition timing",
      "Hypertension in diabetes",
    ],
    relatedSlugs: ["endocrinology", "nephrology", "ophthalmology"],
    description: `Diabetology dedicates expertise to glucose regulation across Type 1, Type 2, gestational, and secondary diabetes. Tele diabetology harnesses CGM time-in-range metrics, fasting and post-meal patterns, and hypoglycemia episodes to fine-tune insulin and non-insulin regimens.

Food timing, cultural dietary patterns in India, and exercise integration are individualized. Coaching on foot self-exams and footwear reduces ulcer risk; retinal screening intervals are reinforced.

Technology—pumps and hybrid closed loops—may be discussed with referrals to certified centers for starts. Sick-day rules and ketone monitoring for Type 1 are emphasized.

techDr Tele Health diabetologists collaborate with cardiologists on SGLT2/GLP-1 cardiorenal benefits, nephrologists on proteinuria, and podiatry when lesions appear.

Teleconsultation optimizes glycemic stability while stressing that DKA, HHS, or non-healing wounds need urgent escalation.

Long-term, patients achieve better outcomes when data trends—not single glucoses—drive therapy.`,
    faq: [
      {
        question: "Do I need a CGM for tele diabetes care?",
        answer:
          "Not mandatory, but helpful—fingerstick logs with structure work when consistent; CGM reduces blind spots.",
      },
      {
        question: "Can insulin be started online?",
        answer:
          "Selectively—with education, baseline labs, and follow-up cadence; first-time insulin in frail elders may need closer in-person overlap per policy.",
      },
      {
        question: "What foot finding is urgent?",
        answer:
          "New ulcer, redness tracking up the leg, fever with foot infection, or black discoloration—seek urgent care.",
      },
    ],
  },
  {
    slug: "allergy-immunology",
    name: "Allergy & Immunology",
    shortIntro:
      "Allergic diseases, asthma overlap, immunodeficiency triage, and testing plans coordinated locally.",
    iconKey: "Shield",
    conditions: [
      "Allergic rhinitis",
      "Food allergy management",
      "Drug allergy histories",
      "Chronic urticaria",
      "Asthma allergy overlap",
      "Eczema immunology overlap",
      "Immunodeficiency suspicion",
      "Venom allergy counseling",
      "Allergen immunotherapy education",
      "Anaphylaxis action plans",
    ],
    relatedSlugs: ["pulmonology", "dermatology", "pediatrics"],
    description: `Allergy and immunology diagnoses and treats immune-mediated conditions from rhinitis and asthma to food and drug hypersensitivity and immune deficiency. Tele allergists take meticulous histories—the cornerstone of allergy practice—and design testing plans executed locally.

Chronic urticaria step therapy, anaphylaxis action plans with epinephrine teaching, and food label reading education suit virtual delivery. Spirometry or skin testing must be performed in-person at partner centers.

Patients with recurrent infections may receive preliminary immune workup lists and referral triage—not definitive IVIG decisions without evaluation.

techDr Tele Health allergists align with dermatology for atopic dermatitis biologics discussions and pulmonology for allergic asthma phenotypes.

Teleconsultation strengthens self-management skills, medication access, and school/workplace accommodation letters when appropriate—while stressing that respiratory distress or anaphylaxis triggers emergency protocols.`,
    faq: [
      {
        question: "Can food allergies be diagnosed online?",
        answer:
          "Suspicion and plan—yes; definitive oral challenges or skin tests require supervised settings.",
      },
      {
        question: "How do I use an epinephrine auto-injector?",
        answer:
          "Your allergist demonstrates with trainer devices and reviews expiration, carrying two pens, and when to call EMS.",
      },
      {
        question: "Are allergy shots possible via telemedicine?",
        answer:
          "Education and protocol planning—yes; injections are administered in qualified centers with observation.",
      },
    ],
  },
  {
    slug: "rheumatology",
    name: "Rheumatology",
    shortIntro:
      "Joint pain, autoimmune diseases, and inflammation—therapy planning with labs and imaging you can complete nearby.",
    iconKey: "Dumbbell",
    conditions: [
      "Rheumatoid arthritis",
      "Psoriatic arthritis",
      "Ankylosing spondylitis",
      "Lupus management support",
      "Gout",
      "Osteoporosis meds",
      "Sjogren syndrome",
      "Vasculitis follow-up",
      "Fibromyalgia approaches",
      "Sjogren overlap",
    ],
    relatedSlugs: ["orthopedics", "dermatology", "nephrology"],
    description: `Rheumatology cares for autoimmune and musculoskeletal inflammation. Tele rheumatology reviews joint distribution, morning stiffness patterns, inflammatory markers, and imaging to tune DMARD and biologic therapy—with local lab safety monitoring.

Gout flare prophylaxis during ULT initiation, lupus hydroxychloroquine eye screening education, and osteoporosis medication sequencing are commonly virtual.

Physical exam elements are partially replaced by patient-guided joint counts and videos, but new synovitis may still need ultrasound in clinic.

techDr Tele Health rheumatologists coordinate ophthalmology for antimalarial monitoring and screen for infections before biologics conceptually—local completion.

Seronegative arthritis phenotypes overlap with GI and skin—multidisciplinary integration is emphasized.

Teleconsultation supports sustained remission strategies, medication adherence, and prompt escalation if infection or cytopenias signal.

Emergencies like catastrophic APS, acute visual loss from GCA suspicion, or febrile neutropenia on therapy need emergency departments.`,
    faq: [
      {
        question: "Can RA be managed fully online?",
        answer:
          "Many stable patients—yes—with periodic labs and shared remission targets; new diagnosis may need sooner in-person exam.",
      },
      {
        question: "What labs do biologics require?",
        answer:
          "CBC, liver tests, tuberculosis screening per guideline, and infection surveillance—arranged locally on schedule.",
      },
      {
        question: "Is fibromyalgia diagnosed online?",
        answer:
          "Often by tender point history overlap, sleep features, and exclusion of inflammatory disorders with directed testing.",
      },
    ],
  },
  {
    slug: "fertility-ivf",
    name: "Fertility & IVF",
    shortIntro:
      "Fertility journey guidance, cycle explanations, hormonal testing interpretation, and when to escalate to IVF centers.",
    iconKey: "HeartHandshake",
    conditions: [
      "Infertility evaluation",
      "Ovulation tracking",
      "PCOS fertility",
      "Male factor counseling",
      "IVF cycle education",
      "Miscarriage counseling",
      "Advanced maternal age planning",
      "Endometriosis fertility",
      "Recurrent pregnancy loss workup planning",
      "Fertility preservation education",
    ],
    relatedSlugs: ["gynecology", "endocrinology", "urology"],
    description: `Fertility medicine supports conception through ovulation optimization, hormonal testing interpretation, ultrasound review when available, and IVF education. Tele fertility consultations help couples understand timelines, success rate nuance, and lifestyle factors—without replacing embryology labs.

Male factor basics—semen analysis review, varicocele triage—can start online; procedures remain in clinics. PCOS ovulation induction strategies may be outlined with monitoring plans nearby.

IVF medication teach-backs reduce errors; psychosocial stress is validated with optional counseling referrals.

techDr Tele Health fertility specialists emphasize evidence, age-related expectations, and ethical ovarian reserve discussions with AMH contexts.

Emergency topics like ectopic suspicion, OHSS severe features, or heavy bleeding early pregnancy need urgent care—not teleconsult alone.

Teleconsultation humanizes complex paths, aligns partner expectations, and prepares you for structured in-person fertility center visits with questions in hand.`,
    faq: [
      {
        question: "Can IVF be done online?",
        answer:
          "Stimulation and retrieval require a physical center; teleconsult educates and coordinates care with that center.",
      },
      {
        question: "When should we see a specialist sooner?",
        answer:
          "Age over 35 with 6 months trying, irregular cycles, known endometriosis, or two losses—examples that warrant earlier workups.",
      },
      {
        question: "Are supplements for fertility recommended?",
        answer:
          "Selective evidence-based options may be discussed; avoid blanket multitudes without indication.",
      },
    ],
  },
];

export function getSpecialtyBySlug(slug: string) {
  return SPECIALTIES.find((s) => s.slug === slug);
}

export function listSpecialtySlugs() {
  return SPECIALTIES.map((s) => s.slug);
}
