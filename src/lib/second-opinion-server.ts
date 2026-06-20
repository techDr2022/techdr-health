import { prisma } from "@/lib/prisma";
import { decryptSoapRecord } from "@/lib/soap-notes";
import type { SecondOpinionPrefill } from "@/lib/second-opinion";

export async function getSecondOpinionPrefillForPatient(
  originalBookingId: string,
  patientId: string
): Promise<SecondOpinionPrefill | null> {
  const booking = await prisma.booking.findFirst({
    where: {
      id: originalBookingId,
      patientId,
      status: "COMPLETED",
      payStatus: "CAPTURED",
    },
    include: {
      doctor: { select: { displayName: true, slug: true, specialty: true } },
      prescriptionRecord: { select: { diagnosis: true } },
    },
  });
  if (!booking) return null;

  return {
    originalBookingId: booking.id,
    originalDoctorName: booking.doctor.displayName,
    originalDoctorSlug: booking.doctor.slug,
    originalSpecialty: booking.doctor.specialty,
    originalDiagnosis: booking.prescriptionRecord?.diagnosis ?? booking.diagnosis,
    completedAt: booking.scheduledAt.toISOString(),
  };
}

export async function validateSecondOpinionBooking(args: {
  patientId: string;
  originalBookingId: string;
  newDoctorId: string;
}) {
  const original = await prisma.booking.findFirst({
    where: {
      id: args.originalBookingId,
      patientId: args.patientId,
      status: "COMPLETED",
      payStatus: "CAPTURED",
    },
    select: { id: true, doctorId: true },
  });
  if (!original) {
    return { ok: false as const, error: "Original consultation not found or not completed." };
  }
  if (original.doctorId === args.newDoctorId) {
    return { ok: false as const, error: "Second opinion must be with a different doctor." };
  }
  return { ok: true as const, originalBookingId: original.id };
}

export async function getSecondOpinionContextForDoctor(secondOpinionBookingId: string, doctorUserId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: secondOpinionBookingId },
    include: {
      doctor: { select: { userId: true } },
      originalbooking: {
        include: {
          doctor: { select: { displayName: true, specialty: true } },
          prescriptionRecord: true,
          soapnote: true,
        },
      },
    },
  });

  if (!booking?.issecondopinion || !booking.secondopinionshareconsent) return null;
  if (booking.doctor.userId !== doctorUserId) return null;
  if (!booking.originalbooking) return null;

  const original = booking.originalbooking;
  const soap = original.soapnote;
  const canReadSoap = soap?.sharedwithdoctorids.includes(doctorUserId) ?? false;

  const healthRecords = await prisma.healthrecord.findMany({
    where: {
      userid: booking.patientId,
      sharedwith: { has: doctorUserId },
    },
    orderBy: { uploadedat: "desc" },
    take: 20,
    select: {
      id: true,
      name: true,
      type: true,
      filesize: true,
      uploadedat: true,
    },
  });

  const medicines = original.prescriptionRecord?.medicines;
  const prescriptionMedicines = Array.isArray(medicines)
    ? (medicines as Array<{ name: string; dosage: string; duration: string; instructions: string }>)
    : [];

  return {
    originalBookingId: original.id,
    originalDoctorName: original.doctor.displayName,
    originalSpecialty: original.doctor.specialty,
    originalScheduledAt: original.scheduledAt.toISOString(),
    originalDiagnosis: original.prescriptionRecord?.diagnosis ?? original.diagnosis,
    originalPrescription: original.prescriptionRecord
      ? {
          diagnosis: original.prescriptionRecord.diagnosis,
          medicines: prescriptionMedicines,
          instructions: original.prescriptionRecord.instructions,
          followUpDate: original.prescriptionRecord.followUpDate?.toISOString() ?? null,
        }
      : null,
    soapSummary: canReadSoap && soap
      ? {
          assessment: decryptSoapRecord(soap).assessment,
          plan: decryptSoapRecord(soap).plan,
          subjective: decryptSoapRecord(soap).subjective,
        }
      : null,
    healthRecords,
  };
}
