import { auth } from "@/auth";
import { decryptClinicalText, encryptClinicalText } from "@/lib/clinical-encryption";
import { resolveConsultationAccess } from "@/lib/consultation-access";
import { prisma } from "@/lib/prisma";
import type { Soapnote } from "@prisma/client";

export type SoapNoteContent = {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
};

export type SoapNoteClient = SoapNoteContent & {
  aidraftused: boolean;
  finalized: boolean;
  finalizedat: string | null;
  patientshared: boolean;
  sharedat: string | null;
  updatedAt: string;
};

export function extractChiefComplaint(notes: string | null | undefined): string {
  if (!notes) return "";
  const match = notes.match(/Chief complaint:\s*(.+)/i);
  return match?.[1]?.trim() || notes.slice(0, 500);
}

export function encryptSoapFields(content: SoapNoteContent) {
  return {
    subjective: encryptClinicalText(content.subjective),
    objective: encryptClinicalText(content.objective),
    assessment: encryptClinicalText(content.assessment),
    plan: encryptClinicalText(content.plan),
  };
}

export function decryptSoapRecord(record: Soapnote): SoapNoteContent {
  return {
    subjective: decryptClinicalText(record.subjective),
    objective: decryptClinicalText(record.objective),
    assessment: decryptClinicalText(record.assessment),
    plan: decryptClinicalText(record.plan),
  };
}

export function toSoapNoteClient(record: Soapnote): SoapNoteClient {
  const content = decryptSoapRecord(record);
  return {
    ...content,
    aidraftused: record.aidraftused,
    finalized: record.finalized,
    finalizedat: record.finalizedat?.toISOString() ?? null,
    patientshared: record.patientshared,
    sharedat: record.sharedat?.toISOString() ?? null,
    updatedAt: record.updatedAt.toISOString(),
  };
}

type SoapAccess = {
  booking: {
    id: string;
    patientId: string;
    consultType: string;
    notes: string | null;
    doctor: { userId: string };
  };
  isDoctor: boolean;
  isPatient: boolean;
  isAdmin: boolean;
  canEdit: boolean;
  canRead: boolean;
  record: Soapnote | null;
};

export async function resolveSoapNoteAccess(
  bookingId: string,
  joinToken?: string | null
): Promise<SoapAccess | null> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      status: true,
      patientId: true,
      consultType: true,
      notes: true,
      doctor: { select: { userId: true } },
      soapnote: true,
    },
  });
  if (!booking) return null;

  const session = await auth();
  const access = await resolveConsultationAccess(bookingId, booking, joinToken?.trim() || null);

  const isDoctor =
    access?.role === "doctor" ||
    (session?.user?.id === booking.doctor.userId && session.user.role === "DOCTOR");
  const isPatient =
    access?.role === "patient" || session?.user?.id === booking.patientId;
  const isAdmin = session?.user?.role === "ADMIN";
  const record = booking.soapnote;
  const canEdit = isDoctor && !record?.finalized;
  const canRead =
    isDoctor || isAdmin || (isPatient && Boolean(record?.patientshared));

  return {
    booking,
    isDoctor,
    isPatient,
    isAdmin,
    canEdit,
    canRead,
    record,
  };
}
