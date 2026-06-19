import { z } from "zod";

const educationEntrySchema = z.object({
  degree: z.string().min(1),
  institution: z.string().min(1),
  year: z.number().int().min(1950).max(2100),
});

function emptyToUndefined(value: unknown) {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
}

function emptyToNull(value: unknown) {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  return value;
}

export function normalizeIndianPhoneDigits(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 10) return digits;
  return digits.slice(-10);
}

const requiredPhoneSchema = z
  .string()
  .trim()
  .transform(normalizeIndianPhoneDigits)
  .refine((value) => value.length === 10, {
    message: "Enter a valid 10-digit phone number.",
  });

const optionalPhoneSchema = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .trim()
    .transform(normalizeIndianPhoneDigits)
    .refine((value) => value.length === 10, {
      message: "Enter a valid 10-digit phone number.",
    })
    .optional()
);

const optionalText = (min: number, max: number) =>
  z.preprocess(emptyToUndefined, z.string().trim().min(min).max(max).optional());

export function formatAdminDoctorSchemaError(error: z.ZodError) {
  const issue = error.issues[0];
  if (!issue) return "Invalid doctor data.";
  if (issue.path[0] === "phone") return "Enter a valid 10-digit phone number.";
  if (issue.path[0] === "email") return "Enter a valid email address.";
  if (issue.path[0] === "password") return "Password must be at least 6 characters.";
  return issue.message || "Invalid doctor data.";
}

export const adminCreateDoctorSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: requiredPhoneSchema,
  password: z.string().min(6).max(120),
  specialty: z.string().trim().min(2).max(120),
  credentials: z.string().trim().min(2).max(120),
  medRegNumber: optionalText(2, 80),
  experience: z.number().int().min(0).max(80).optional(),
  bio: z.preprocess(emptyToNull, z.string().max(5000).nullable().optional()),
  languages: z.array(z.string().min(1)).max(20).optional(),
  subSpecialties: z.array(z.string().min(1)).max(30).optional(),
  hospitalAffils: z.array(z.string().min(1)).max(30).optional(),
  education: z.array(educationEntrySchema).max(20).optional(),
  consultFee: z.number().int().min(0).max(100000),
  isVisible: z.boolean().optional(),
});

export const adminUpdateDoctorSchema = z.object({
  displayName: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().email().optional(),
  phone: optionalPhoneSchema,
  password: z.preprocess(emptyToUndefined, z.string().min(6).max(120).optional()),
  specialty: optionalText(2, 120),
  credentials: optionalText(2, 120),
  medRegNumber: optionalText(2, 80),
  experience: z.number().int().min(0).max(80).optional(),
  bio: z.preprocess(emptyToNull, z.string().max(5000).nullable().optional()),
  languages: z.array(z.string().min(1)).max(20).optional(),
  subSpecialties: z.array(z.string().min(1)).max(30).optional(),
  hospitalAffils: z.array(z.string().min(1)).max(30).optional(),
  conditions: z.array(z.string().min(1)).max(50).optional(),
  education: z.array(educationEntrySchema).max(20).optional(),
  consultFee: z.number().int().min(0).max(100000).optional(),
  followUpFee: z.number().int().min(0).max(100000).optional(),
  consultDuration: z.number().int().min(5).max(120).optional(),
  consultTypes: z.array(z.enum(["VIDEO", "AUDIO", "CHAT"])).min(1).optional(),
  approvalStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  isVisible: z.boolean().optional(),
  rejectionReason: z.preprocess(emptyToNull, z.string().max(500).nullable().optional()),
  metaTitle: z.preprocess(emptyToNull, z.string().max(120).nullable().optional()),
  metaDesc: z.preprocess(emptyToNull, z.string().max(300).nullable().optional()),
});

export type AdminUpdateDoctorPayload = z.infer<typeof adminUpdateDoctorSchema>;
