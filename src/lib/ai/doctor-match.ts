// AI-POWERED
import { prisma } from "@/lib/prisma";
import { PUBLIC_DOCTOR_FILTER, resolveCanonicalSpecialtyName } from "@/lib/doctor-specialty";
import { resolveSpecialtySlug } from "@/lib/doctor-specialty";

export type MatchedDoctorProfile = {
  id: string;
  slug: string;
  name: string;
  specialty: string;
  specialtySlug: string;
  credentials: string;
  experience: number;
  consultFee: number;
  photoUrl: string | null;
  rating: number;
  reviewCount: number;
  languages: string[];
};

export function normalizeAiSpecialties(specialties: string[]): string[] {
  const names = specialties
    .map((item) => resolveCanonicalSpecialtyName(item))
    .filter(Boolean);
  return Array.from(new Set(names));
}

export async function findDoctorsBySpecialties(
  specialties: string[],
  limit = 6
): Promise<MatchedDoctorProfile[]> {
  const canonical = normalizeAiSpecialties(specialties);
  if (canonical.length === 0) return [];

  const doctors = await prisma.doctorProfile.findMany({
    where: {
      ...PUBLIC_DOCTOR_FILTER,
      OR: [
        { specialty: { in: canonical } },
        ...canonical.map((name) => ({
          subSpecialties: { has: name },
        })),
      ],
    },
    include: {
      reviews: { select: { rating: true } },
    },
    take: limit * 3,
  });

  const ranked = doctors
    .map((doctor) => {
      const reviewCount = doctor.reviews.length;
      const rating =
        reviewCount > 0
          ? doctor.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
          : 4.7;

      return {
        id: doctor.id,
        slug: doctor.slug,
        name: doctor.displayName,
        specialty: doctor.specialty,
        specialtySlug: resolveSpecialtySlug(doctor.specialty),
        credentials: doctor.credentials || "MBBS",
        experience: doctor.experience ?? 0,
        consultFee: doctor.consultFee ?? 0,
        photoUrl: doctor.photoUrl,
        rating,
        reviewCount,
        languages: doctor.languages?.length ? doctor.languages : ["English"],
      };
    })
    .sort((a, b) => b.rating * Math.max(b.reviewCount, 1) - a.rating * Math.max(a.reviewCount, 1))
    .slice(0, limit);

  return ranked;
}
