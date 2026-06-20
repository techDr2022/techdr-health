import { Healthrecordtype } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const HEALTH_RECORD_QUOTA_BYTES = 50 * 1024 * 1024;
export const HEALTH_RECORD_MAX_FILE_BYTES = 10 * 1024 * 1024;

export const ALLOWED_HEALTH_RECORD_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

export function inferHealthRecordType(
  mimeType: string,
  fileName: string
): Healthrecordtype {
  const lower = fileName.toLowerCase();
  if (mimeType === "application/pdf" && /lab|blood|test|report|cbc|lipid/.test(lower)) {
    return Healthrecordtype.LAB_REPORT;
  }
  if (/prescription|rx|medicine/.test(lower)) {
    return Healthrecordtype.PRESCRIPTION;
  }
  if (/scan|xray|x-ray|mri|ct|ultrasound|ecg/.test(lower)) {
    return Healthrecordtype.SCAN;
  }
  if (mimeType === "application/pdf") return Healthrecordtype.LAB_REPORT;
  return Healthrecordtype.OTHER;
}

export function extensionForMimeType(mimeType: string) {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType === "image/jpeg" || mimeType === "image/jpg") return "jpg";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return null;
}

export async function getUserHealthRecordUsageBytes(userId: string) {
  const aggregate = await prisma.healthrecord.aggregate({
    where: { userid: userId },
    _sum: { filesize: true },
  });
  return aggregate._sum.filesize ?? 0;
}

export async function assertHealthRecordQuota(userId: string, nextFileSize: number) {
  const used = await getUserHealthRecordUsageBytes(userId);
  if (used + nextFileSize > HEALTH_RECORD_QUOTA_BYTES) {
    throw new Error(
      `Storage limit reached (${Math.round(HEALTH_RECORD_QUOTA_BYTES / (1024 * 1024))}MB). Delete older files to upload more.`
    );
  }
  return { usedBytes: used, remainingBytes: HEALTH_RECORD_QUOTA_BYTES - used };
}

export function canAccessHealthRecord(args: {
  recordUserId: string;
  viewerUserId: string;
  viewerRole: string;
  sharedWith: string[];
}) {
  if (args.recordUserId === args.viewerUserId) return true;
  if (args.viewerRole === "ADMIN") return true;
  return args.sharedWith.includes(args.viewerUserId);
}

export function formatRecordType(type: Healthrecordtype) {
  switch (type) {
    case Healthrecordtype.LAB_REPORT:
      return "Lab report";
    case Healthrecordtype.PRESCRIPTION:
      return "Prescription";
    case Healthrecordtype.SCAN:
      return "Scan";
    default:
      return "Other";
  }
}
