import { SPECIALTIES } from "@/data/specialties";
import { resolveSpecialtySlug } from "@/lib/doctor-specialty";

const LANGUAGE_OPTIONS = [
  "English",
  "Hindi",
  "Telugu",
  "Tamil",
  "Kannada",
  "Malayalam",
  "Marathi",
  "Gujarati",
  "Bengali",
  "Urdu",
  "Arabic",
  "Punjabi",
];

const SPECIALTY_NAMES = SPECIALTIES.map((item) => item.name);

function normalizeSpecialty(value?: string) {
  if (!value?.trim()) return undefined;
  const slug = resolveSpecialtySlug(value);
  const specialty = SPECIALTIES.find((item) => item.slug === slug);
  return specialty?.name ?? value.trim();
}

export type ParsedEducationEntry = {
  degree: string;
  institution: string;
  year: number;
};

export type ParsedDoctorResume = {
  entityName?: string;
  email?: string;
  phone?: string;
  specialty?: string;
  subSpecialties?: string[];
  experience?: string;
  credentials?: string;
  medRegNumber?: string;
  languages?: string[];
  consultationFee?: string;
  whatsappNumber?: string;
  clinicName?: string;
  hospitalName?: string;
  address?: string;
  city?: string;
  pincode?: string;
  numberOfDoctors?: string;
  bio?: string;
  education?: ParsedEducationEntry[];
  hospitalAffils?: string[];
  conditions?: string[];
};

const RESUME_JSON_SCHEMA = `{
  "entityName": "doctor full legal name",
  "email": "email address",
  "phone": "10+ digit mobile number",
  "specialty": "primary medical specialty",
  "subSpecialties": ["sub-specialty areas"],
  "experience": "total years of practice as digits only, e.g. 12",
  "credentials": "all degrees, e.g. MBBS, MD (Cardiology), DM",
  "medRegNumber": "medical council registration number",
  "languages": ["every language the doctor speaks"],
  "consultationFee": "consultation fee in INR if mentioned",
  "whatsappNumber": "whatsapp number if different from phone",
  "clinicName": "current clinic name",
  "hospitalName": "current hospital name",
  "address": "clinic or hospital street address",
  "city": "city",
  "pincode": "6-digit pincode",
  "numberOfDoctors": "doctors in clinic if mentioned",
  "bio": "2-4 sentence professional summary from resume",
  "education": [{"degree":"MBBS","institution":"College name","year":2010}],
  "hospitalAffils": ["hospitals or clinics worked at"],
  "conditions": ["conditions or clinical focus areas mentioned"]
}`;

function cleanString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizePhone(value?: string) {
  if (!value) return undefined;
  const digits = value.replace(/\D/g, "");
  if (digits.length < 10) return undefined;
  return digits.length > 10 ? digits.slice(-10) : digits;
}

function normalizeLanguages(values?: string[]) {
  if (!Array.isArray(values)) return undefined;

  const result = values
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => {
      const exact = LANGUAGE_OPTIONS.find(
        (language) => language.toLowerCase() === value.toLowerCase()
      );
      if (exact) return exact;

      const partial = LANGUAGE_OPTIONS.find(
        (language) =>
          value.toLowerCase().includes(language.toLowerCase()) ||
          language.toLowerCase().includes(value.toLowerCase())
      );
      if (partial) return partial;

      return value.charAt(0).toUpperCase() + value.slice(1);
    });

  return result.length > 0 ? Array.from(new Set(result)) : undefined;
}

function normalizeExperience(value: unknown): string | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return String(Math.floor(value));
  }
  if (typeof value === "string") {
    const match = value.match(/(\d{1,2})/);
    return match?.[1];
  }
  return undefined;
}

function normalizeEducation(value: unknown): ParsedEducationEntry[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const entries = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const degree = cleanString(row.degree);
      const institution = cleanString(row.institution);
      const year =
        typeof row.year === "number"
          ? row.year
          : Number(String(row.year ?? "").replace(/\D/g, "").slice(0, 4));

      if (!degree || !institution || !Number.isFinite(year) || year < 1950 || year > 2100) {
        return null;
      }

      return { degree, institution, year };
    })
    .filter((item): item is ParsedEducationEntry => item !== null);

  return entries.length > 0 ? entries.slice(0, 12) : undefined;
}

function normalizeStringArray(value: unknown, max = 20): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, max);
  return items.length > 0 ? Array.from(new Set(items)) : undefined;
}

function enrichFromResumeText(parsed: ParsedDoctorResume, resumeText: string): ParsedDoctorResume {
  const text = resumeText.replace(/\s+/g, " ");

  if (!parsed.experience) {
    const experienceMatch =
      text.match(/(\d{1,2})\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp(?:erience)?)/i) ||
      text.match(/experience\s*[:\-]?\s*(\d{1,2})\+?\s*(?:years?|yrs?)/i);
    if (experienceMatch?.[1]) parsed.experience = experienceMatch[1];
  }

  if (!parsed.languages?.length) {
    const languageLine =
      text.match(/languages?\s*(?:known|spoken)?\s*[:\-]\s*([^\n.;]+)/i) ||
      text.match(/(?:fluent in|speaks?)\s+([A-Za-z,\s/|]+)/i);
    if (languageLine?.[1]) {
      parsed.languages = normalizeLanguages(
        languageLine[1].split(/[,;/|]/).map((item) => item.trim())
      );
    }
  }

  if (!parsed.medRegNumber) {
    const regMatch =
      text.match(/(?:med(?:ical)?\s*reg(?:istration)?|registration|mci|nmc|tsmc|apmc|kmc)\s*(?:no|number|#)?\s*[:\-]?\s*([A-Z0-9/-]{4,})/i) ||
      text.match(/reg(?:istration)?\s*(?:no|number|#)?\s*[:\-]?\s*([A-Z0-9/-]{4,})/i);
    if (regMatch?.[1]) parsed.medRegNumber = regMatch[1].trim();
  }

  if (!parsed.credentials) {
    const credentialMatch = text.match(/\b((?:MBBS|MD|MS|DM|MCh|DNB|BDS|MDS)(?:[,\s]+(?:MBBS|MD|MS|DM|MCh|DNB|BDS|MDS))*)\b/i);
    if (credentialMatch?.[1]) parsed.credentials = credentialMatch[1].replace(/\s+/g, " ").trim();
  }

  return parsed;
}

function normalizeParsedResume(raw: Record<string, unknown>): ParsedDoctorResume {
  const phone = normalizePhone(cleanString(raw.phone));
  const whatsappNumber = normalizePhone(cleanString(raw.whatsappNumber));
  const hospitalAffils = normalizeStringArray(raw.hospitalAffils);
  const clinicName = cleanString(raw.clinicName);
  const hospitalName = cleanString(raw.hospitalName);

  if (clinicName && hospitalAffils && !hospitalAffils.includes(clinicName)) {
    hospitalAffils.unshift(clinicName);
  }
  if (hospitalName && hospitalAffils && !hospitalAffils.includes(hospitalName)) {
    hospitalAffils.push(hospitalName);
  }

  return {
    entityName: cleanString(raw.entityName),
    email: cleanString(raw.email)?.toLowerCase(),
    phone,
    specialty: normalizeSpecialty(cleanString(raw.specialty)),
    subSpecialties: normalizeStringArray(raw.subSpecialties, 8),
    experience: normalizeExperience(raw.experience),
    credentials: cleanString(raw.credentials),
    medRegNumber: cleanString(raw.medRegNumber),
    languages: normalizeLanguages(
      Array.isArray(raw.languages)
        ? raw.languages.filter((item): item is string => typeof item === "string")
        : undefined
    ),
    consultationFee:
      typeof raw.consultationFee === "number"
        ? String(raw.consultationFee)
        : cleanString(raw.consultationFee)?.replace(/\D/g, "") || undefined,
    whatsappNumber: whatsappNumber ?? phone,
    clinicName,
    hospitalName,
    address: cleanString(raw.address),
    city: cleanString(raw.city),
    pincode: cleanString(raw.pincode)?.replace(/\D/g, "").slice(0, 6),
    numberOfDoctors: normalizeExperience(raw.numberOfDoctors),
    bio: cleanString(raw.bio),
    education: normalizeEducation(raw.education),
    hospitalAffils,
    conditions: normalizeStringArray(raw.conditions, 30),
  };
}

export function countFilledResumeFields(data: ParsedDoctorResume): number {
  return Object.entries(data).filter(([, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
  }).length;
}

export function formatParsedEducation(education?: ParsedEducationEntry[]) {
  if (!education?.length) return "";
  return education.map((entry) => `${entry.degree} | ${entry.institution} | ${entry.year}`).join("\n");
}

export function joinParsedList(values?: string[]) {
  return values?.length ? values.join(", ") : "";
}

export async function extractTextFromResumeFile(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (mimeType === "text/plain") {
    return buffer.toString("utf-8").trim();
  }

  if (mimeType === "application/pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return (result.text || "").trim();
    } finally {
      await parser.destroy().catch(() => undefined);
    }
  }

  return "";
}

async function callOpenAIForResume(input: {
  resumeText?: string;
  imageBase64?: string;
  imageMimeType?: string;
}): Promise<ParsedDoctorResume> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Resume AI parsing is not configured. Add OPENAI_API_KEY or fill the form manually.");
  }

  const systemPrompt = `You extract structured doctor onboarding data from resumes/CVs.
Return ONLY valid JSON matching this schema:
${RESUME_JSON_SCHEMA}

Critical rules:
- Extract EVERY field that appears in the resume. Do not skip languages, experience, education, hospitals, or registration numbers.
- experience must be returned as digits only (example: "15" for 15 years).
- languages must list ALL languages mentioned, even if there are many.
- education must include every degree/college/year block you can find.
- hospitalAffils must include hospitals, clinics, and current workplaces.
- Pick specialty from this list when possible: ${SPECIALTY_NAMES.join(", ")}
- Use Indian medical context when relevant.
- Do not invent emails, phone numbers, or registration numbers that are not in the resume.
- credentials should combine all visible degrees (example: MBBS, MD (General Medicine)).
- If consultation fee is not mentioned, omit consultationFee.`;

  const userContent: Array<Record<string, unknown>> = [];

  if (input.resumeText) {
    userContent.push({
      type: "text",
      text: `Extract all doctor profile fields from this resume text:\n\n${input.resumeText.slice(0, 14000)}`,
    });
  }

  if (input.imageBase64 && input.imageMimeType) {
    userContent.push({
      type: "image_url",
      image_url: {
        url: `data:${input.imageMimeType};base64,${input.imageBase64}`,
      },
    });
    userContent.push({
      type: "text",
      text: "Extract all doctor profile fields from this resume image.",
    });
  }

  if (userContent.length === 0) {
    throw new Error("Could not read any text from the uploaded resume.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_RESUME_MODEL?.trim() || "gpt-5.4-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("resume parse openai error", response.status, errorBody);
    throw new Error("AI resume analysis failed. Please try again or fill the form manually.");
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("AI resume analysis returned an empty response.");
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(content) as Record<string, unknown>;
  } catch {
    throw new Error("AI resume analysis returned invalid data.");
  }

  return normalizeParsedResume(parsed);
}

export async function parseDoctorResumeFile(
  buffer: Buffer,
  mimeType: string
): Promise<ParsedDoctorResume> {
  const resumeText = await extractTextFromResumeFile(buffer, mimeType);
  const isImage = mimeType.startsWith("image/");

  let parsed: ParsedDoctorResume;
  if (resumeText.length >= 80) {
    parsed = await callOpenAIForResume({ resumeText });
    parsed = enrichFromResumeText(parsed, resumeText);
  } else if (isImage) {
    parsed = await callOpenAIForResume({
      imageBase64: buffer.toString("base64"),
      imageMimeType: mimeType,
    });
  } else if (resumeText.length > 0) {
    parsed = await callOpenAIForResume({ resumeText });
    parsed = enrichFromResumeText(parsed, resumeText);
  } else {
    throw new Error("Could not read the resume. Upload a clearer PDF or image file.");
  }

  return parsed;
}
