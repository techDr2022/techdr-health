import { SPECIALTIES } from "@/data/specialties";
import { ApprovalStatus } from "@prisma/client";

/** Maps common free-text specialty labels to catalog slugs. */
const SPECIALTY_ALIASES: Record<string, string> = {
  gynaecologist: "gynecology",
  gynecologist: "gynecology",
  obstetrician: "gynecology",
  "obstetrician-gynaecologist": "gynecology",
  "obstetrician-and-gynecologist": "gynecology",
  dermatologist: "dermatology",
  urologist: "urology",
  cardiologist: "cardiology",
  neurologist: "neurology",
  psychiatrist: "psychiatry",
  pediatrician: "pediatrics",
  paediatrician: "pediatrics",
  orthopedist: "orthopedics",
  orthopaedic: "orthopedics",
  oncologist: "oncology",
  "surgical-oncologist": "oncology",
  "senior-consultant-surgical-oncologist": "oncology",
  hematologist: "oncology",
  hematology: "oncology",
  homoeopathy: "general-medicine",
  homeopathy: "general-medicine",
  "general-laser-laparoscopic-surgeon": "general-medicine",
  surgeon: "general-medicine",
};

export const PUBLIC_DOCTOR_FILTER = {
  isVisible: true,
  approvalStatus: ApprovalStatus.APPROVED,
} as const;

export function resolveSpecialtySlug(value: string) {
  const raw = (value || "").trim();
  if (!raw) return "general-medicine";

  const lowered = raw.toLowerCase();
  const bySlug = SPECIALTIES.find((item) => item.slug === lowered);
  if (bySlug) return bySlug.slug;

  const compact = lowered.replace(/[^a-z0-9]+/g, "");
  const byName = SPECIALTIES.find(
    (item) => item.name.toLowerCase().replace(/[^a-z0-9]+/g, "") === compact
  );
  if (byName) return byName.slug;

  const slugKey = lowered.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const alias = SPECIALTY_ALIASES[slugKey] ?? SPECIALTY_ALIASES[compact];
  if (alias) return alias;

  return slugKey || "general-medicine";
}

export function resolveCanonicalSpecialtyName(value: string) {
  const slug = resolveSpecialtySlug(value);
  const specialty = SPECIALTIES.find((item) => item.slug === slug);
  return specialty?.name ?? value.trim();
}

export function defaultConditionsForSpecialty(specialtyName: string) {
  const slug = resolveSpecialtySlug(specialtyName);
  const specialty = SPECIALTIES.find((item) => item.slug === slug);
  return specialty?.conditions?.slice(0, 12) ?? [];
}
