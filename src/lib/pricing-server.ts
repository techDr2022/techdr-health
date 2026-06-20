import { prisma } from "@/lib/prisma";
import { computePricingMultiplier, type PricingMultiplierResult } from "@/lib/pricing";

export async function resolveSurgePricingForDoctor(
  doctorId: string,
  slotDateTime: Date
): Promise<PricingMultiplierResult> {
  const doctor = await prisma.doctorProfile.findUnique({
    where: { id: doctorId },
    select: { specialty: true, surgepricingenabled: true },
  });
  if (!doctor) {
    return { multiplier: 1, reasons: [], surgeEnabled: false };
  }

  const specialtyDoctorCount = await prisma.doctorProfile.count({
    where: {
      specialty: doctor.specialty,
      isVisible: true,
      approvalStatus: "APPROVED",
    },
  });

  return computePricingMultiplier({
    slotDateTime,
    specialtyDoctorCount,
    surgeEnabled: doctor.surgepricingenabled,
  });
}

export async function getSpecialtyDoctorCount(specialty: string): Promise<number> {
  return prisma.doctorProfile.count({
    where: {
      specialty,
      isVisible: true,
      approvalStatus: "APPROVED",
    },
  });
}
