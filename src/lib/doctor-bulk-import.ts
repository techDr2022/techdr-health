import * as XLSX from "xlsx";
import bcrypt from "bcryptjs";
import { ConsultType, PlanType, Prisma, WeekDay } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CONSULTATION_SLOT_MINUTES } from "@/lib/consultation";
import {
  defaultConditionsForSpecialty,
  resolveCanonicalSpecialtyName,
} from "@/lib/doctor-specialty";

const VALID_CONSULT_TYPES: ConsultType[] = ["VIDEO", "AUDIO", "CHAT"];
const VALID_PLAN_TYPES: PlanType[] = ["INDIVIDUAL", "CLINIC", "HOSPITAL"];

export type ParsedDoctorRow = {
  rowNumber: number;
  planType: PlanType;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  specialty: string;
  subSpecialties: string[];
  credentials: string;
  experienceYears: number;
  languages: string[];
  bio: string | null;
  hospitalAffils: string[];
  consultFeeInr: number;
  followUpFeeInr: number;
  consultTypes: ConsultType[];
  availability: Partial<Record<WeekDay, Array<{ startTime: string; endTime: string }>>>;
  isVisible: boolean;
  medRegCertUrl: string | null;
  govIdUrl: string | null;
};

export type ImportRowResult = {
  rowNumber: number;
  fullName: string;
  email: string;
  status: "created" | "failed";
  message?: string;
  slug?: string;
};

export type ParseBulkImportResult = {
  rows: ParsedDoctorRow[];
  headers: string[];
  sheetName: string | null;
};

function normalizeKey(key: string): string {
  return key
    .replace(/^\ufeff/, "")
    .trim()
    .toLowerCase()
    .replace(/[.\s]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function cellValue(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "number" && Number.isFinite(value)) {
    if (Number.isInteger(value) && Math.abs(value) >= 1e9) {
      return String(Math.trunc(value));
    }
    return String(value);
  }

  const text = String(value).trim();
  if (/^\d+(\.\d+)?e\+\d+$/i.test(text)) {
    const num = Number(text);
    if (Number.isFinite(num)) return String(Math.trunc(num));
  }
  return text;
}

function readWorkbook(buffer: Buffer, filename = ""): XLSX.WorkBook {
  const lowerName = filename.toLowerCase();
  if (lowerName.endsWith(".csv")) {
    const text = buffer.toString("utf8").replace(/^\ufeff/, "");
    const firstLine = text.split(/\r?\n/)[0] ?? "";
    const semicolons = (firstLine.match(/;/g) ?? []).length;
    const commas = (firstLine.match(/,/g) ?? []).length;
    return XLSX.read(text, {
      type: "string",
      raw: false,
      codepage: 65001,
      FS: semicolons > commas ? ";" : ",",
    });
  }

  return XLSX.read(buffer, { type: "buffer", raw: false, codepage: 65001 });
}

function getSheetRows(workbook: XLSX.WorkBook): {
  rawRows: Record<string, unknown>[];
  headers: string[];
  sheetName: string | null;
} {
  let bestRows: Record<string, unknown>[] = [];
  let bestHeaders: string[] = [];
  let bestSheetName: string | null = null;

  let bestValidCount = 0;

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
    const headers = rawRows.length > 0 ? Object.keys(rawRows[0] ?? {}) : [];

    const validCount = rawRows.filter((raw) => {
      const normalized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(raw)) {
        normalized[normalizeKey(key)] = value;
      }
      const name = pickCell(normalized, "entityName", "entity_name", "full_name", "fullname", "name");
      const email = pickCell(normalized, "email");
      return Boolean(name || email);
    }).length;

    if (validCount > bestValidCount) {
      bestRows = rawRows;
      bestHeaders = headers;
      bestSheetName = sheetName;
      bestValidCount = validCount;
    }
  }

  return { rawRows: bestRows, headers: bestHeaders, sheetName: bestSheetName };
}

function pickCell(normalized: Record<string, unknown>, ...aliases: string[]): string {
  for (const alias of aliases) {
    const value = cellValue(normalized[normalizeKey(alias)]);
    if (value) return value;
  }
  return "";
}

function splitList(value: string): string[] {
  if (!value) return [];
  return value
    .split(/[,;]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseYesNo(value: string, defaultValue = false): boolean {
  const normalized = value.trim().toUpperCase();
  if (normalized === "YES" || normalized === "Y" || normalized === "TRUE" || normalized === "1") return true;
  if (normalized === "NO" || normalized === "N" || normalized === "FALSE" || normalized === "0") return false;
  return defaultValue;
}

function parsePlanType(value: string): PlanType {
  const normalized = value.trim().toUpperCase();
  if (VALID_PLAN_TYPES.includes(normalized as PlanType)) {
    return normalized as PlanType;
  }
  return "INDIVIDUAL";
}

function parseConsultTypes(value: string): ConsultType[] {
  const types = splitList(value.toUpperCase()).filter((type): type is ConsultType =>
    VALID_CONSULT_TYPES.includes(type as ConsultType)
  );
  return types.length > 0 ? types : ["VIDEO"];
}

function parseAvailability(
  value: string
): Partial<Record<WeekDay, Array<{ startTime: string; endTime: string }>>> {
  const result: Partial<Record<WeekDay, Array<{ startTime: string; endTime: string }>>> = {};
  if (!value) return result;

  for (const segment of value.split("|")) {
    const trimmed = segment.trim();
    const match = trimmed.match(/^(MON|TUE|WED|THU|FRI|SAT|SUN):(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/i);
    if (!match) continue;

    const day = match[1].toUpperCase() as WeekDay;
    const startTime = match[2].length === 4 ? `0${match[2]}` : match[2];
    const endTime = match[3].length === 4 ? `0${match[3]}` : match[3];
    result[day] = [...(result[day] || []), { startTime, endTime }];
  }

  return result;
}

function buildLocationBio(parts: {
  address: string;
  city: string;
  pincode: string;
  numberOfDoctors: string;
  existingBio: string;
}): string | null {
  const lines: string[] = [];
  if (parts.existingBio) lines.push(parts.existingBio);
  if (parts.address) lines.push(`Address: ${parts.address}`);
  if (parts.city) lines.push(`City: ${parts.city}`);
  if (parts.pincode) lines.push(`Pincode: ${parts.pincode}`);
  if (parts.numberOfDoctors) lines.push(`Number of doctors: ${parts.numberOfDoctors}`);
  return lines.length > 0 ? lines.join(" | ") : null;
}

function validateRow(row: ParsedDoctorRow): string | null {
  if (!row.fullName || row.fullName.length < 2) return "entityName is required";
  if (!row.email || !row.email.includes("@")) return "valid email is required";
  if (!row.phone || row.phone.length < 10) return "phone is required (min 10 digits)";
  if (!row.password || row.password.length < 6) return "password is required (min 6 chars)";
  if (!row.specialty) return "specialty is required";
  if (!row.credentials) return "Credentials is required";
  return null;
}

export function parseBulkImportFile(buffer: Buffer, filename = ""): ParsedDoctorRow[] {
  return parseBulkImportFileDetailed(buffer, filename).rows;
}

export function parseBulkImportFileDetailed(buffer: Buffer, filename = ""): ParseBulkImportResult {
  const workbook = readWorkbook(buffer, filename);
  const { rawRows, headers, sheetName } = getSheetRows(workbook);
  const rows: ParsedDoctorRow[] = [];

  rawRows.forEach((raw, index) => {
    const normalized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(raw)) {
      normalized[normalizeKey(key)] = value;
    }

    const email = pickCell(normalized, "email").toLowerCase();
    const fullName =
      pickCell(normalized, "entityName", "entity_name", "full_name", "fullname", "name") ||
      (email ? email.split("@")[0] : "");
    if (!fullName && !email) return;

    const rowNumber =
      Number(pickCell(normalized, "S.no", "s_no", "sr_no", "sno", "serial_no")) || index + 2;

    const hospitalAffils = splitList(pickCell(normalized, "hospital_affiliations", "hospital affiliations"));
    const clinicName = pickCell(normalized, "clinic Name", "clinic_name", "clinicname");
    const hospitalName = pickCell(normalized, "hospital Name", "hospital_name", "hospitalname");
    if (clinicName) hospitalAffils.unshift(clinicName);
    if (hospitalName && !hospitalAffils.includes(hospitalName)) hospitalAffils.push(hospitalName);

    const languages = splitList(pickCell(normalized, "languages"));

    rows.push({
      rowNumber,
      planType: parsePlanType(pickCell(normalized, "planType", "plan_type", "plantype")),
      fullName,
      email,
      phone: pickCell(normalized, "phone"),
      password: pickCell(normalized, "password"),
      specialty: resolveCanonicalSpecialtyName(
        pickCell(normalized, "specialty") || "General Medicine"
      ),
      subSpecialties: splitList(pickCell(normalized, "subSpecialties", "sub_specialties", "subspecialties")),
      credentials: pickCell(normalized, "Credentials", "credentials") || "MBBS",
      experienceYears: Number(pickCell(normalized, "experience", "experience_years", "experienceyears")) || 0,
      languages: languages.length > 0 ? languages : ["English"],
      bio: buildLocationBio({
        address: pickCell(normalized, "address"),
        city: pickCell(normalized, "city"),
        pincode: pickCell(normalized, "pincode"),
        numberOfDoctors: pickCell(normalized, "number Of Doctors", "number_of_doctors", "numberofdoctors"),
        existingBio: pickCell(normalized, "bio"),
      }),
      hospitalAffils: Array.from(new Set(hospitalAffils)),
      consultFeeInr:
        Number(pickCell(normalized, "ConsultationFee", "consultation_fee", "consultationfee", "consult_fee_inr")) ||
        500,
      followUpFeeInr: Number(pickCell(normalized, "follow_up_fee_inr", "followupfee")) || 0,
      consultTypes: parseConsultTypes(pickCell(normalized, "consult_types", "consulttypes")),
      availability: parseAvailability(pickCell(normalized, "availability")),
      isVisible: parseYesNo(pickCell(normalized, "is_visible", "isvisible"), true),
      medRegCertUrl: pickCell(normalized, "med Reg Cert Url", "med_reg_cert_url", "medregcerturl") || null,
      govIdUrl: pickCell(normalized, "gov Id", "gov_id", "govid", "gov_id_url") || null,
    });
  });

  return { rows, headers, sheetName };
}

export async function importDoctorRow(row: ParsedDoctorRow): Promise<ImportRowResult> {
  const validationError = validateRow(row);
  if (validationError) {
    return {
      rowNumber: row.rowNumber,
      fullName: row.fullName,
      email: row.email,
      status: "failed",
      message: `Row ${row.rowNumber}: ${validationError}`,
    };
  }

  try {
    const passwordHash = await bcrypt.hash(row.password, 12);
    const slugBase = row.fullName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const slug = `dr-${slugBase}-${Date.now().toString().slice(-6)}`;

    const created = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: row.email,
          phone: row.phone,
          passwordHash,
          role: "DOCTOR",
          name: row.fullName,
          isVerified: true,
          emailVerified: true,
          authProvider: "email",
        },
      });

      const profile = await tx.doctorProfile.create({
        data: {
          userId: user.id,
          slug,
          displayName: row.fullName,
          specialty: row.specialty,
          subSpecialties: row.subSpecialties,
          credentials: row.credentials,
          medRegNumber: `ADMIN-${user.id.slice(-6)}`,
          experience: row.experienceYears,
          education: [],
          hospitalAffils: row.hospitalAffils,
          bio: row.bio,
          languages: row.languages,
          conditions: defaultConditionsForSpecialty(row.specialty),
          consultFee: row.consultFeeInr,
          followUpFee: row.followUpFeeInr,
          consultDuration: CONSULTATION_SLOT_MINUTES,
          consultTypes: row.consultTypes,
          approvalStatus: "APPROVED",
          isVisible: row.isVisible,
          medRegCertUrl: row.medRegCertUrl,
          govIdUrl: row.govIdUrl,
        },
      });

      await tx.subscription.create({
        data: {
          doctorId: profile.id,
          plan: row.planType,
          status: "ACTIVE",
          priceINR: 0,
          purchasedAt: new Date(),
          activatedAt: new Date(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });

      for (const [day, daySlots] of Object.entries(row.availability) as Array<
        [WeekDay, Array<{ startTime: string; endTime: string }>]
      >) {
        if (daySlots.length === 0) continue;
        await tx.doctorTiming.create({
          data: {
            doctorId: profile.id,
            day,
            isOpen: true,
            slots: {
              create: daySlots.map((slot) => ({
                startTime: slot.startTime,
                endTime: slot.endTime,
              })),
            },
          },
        });
      }

      return { slug: profile.slug };
    });

    return {
      rowNumber: row.rowNumber,
      fullName: row.fullName,
      email: row.email,
      status: "created",
      slug: created.slug,
    };
  } catch (error) {
    let message = "Unable to create doctor.";
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      message = "Email or phone is already registered.";
    }
    return {
      rowNumber: row.rowNumber,
      fullName: row.fullName,
      email: row.email,
      status: "failed",
      message: `Row ${row.rowNumber}: ${message}`,
    };
  }
}

export async function bulkImportDoctors(rows: ParsedDoctorRow[]): Promise<ImportRowResult[]> {
  const results: ImportRowResult[] = [];
  const seenEmails = new Set<string>();
  const seenPhones = new Set<string>();

  for (const row of rows) {
    if (seenEmails.has(row.email)) {
      results.push({
        rowNumber: row.rowNumber,
        fullName: row.fullName,
        email: row.email,
        status: "failed",
        message: `Row ${row.rowNumber}: Duplicate email in file.`,
      });
      continue;
    }
    if (seenPhones.has(row.phone)) {
      results.push({
        rowNumber: row.rowNumber,
        fullName: row.fullName,
        email: row.email,
        status: "failed",
        message: `Row ${row.rowNumber}: Duplicate phone in file.`,
      });
      continue;
    }

    seenEmails.add(row.email);
    seenPhones.add(row.phone);
    results.push(await importDoctorRow(row));
  }

  return results;
}
