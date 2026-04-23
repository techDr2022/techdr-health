import type { DoctorRecord, ReviewEntry } from "@/types/catalog";
import { SPECIALTIES } from "@/data/specialties";
import { prisma } from "@/lib/prisma";

const dayMap: Record<string, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
};

function normalizeSpecialtySlug(value: string) {
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

  return lowered.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "general-medicine";
}

function parseEducation(value: unknown): DoctorRecord["education"] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const degree = typeof row.degree === "string" ? row.degree.trim() : "";
      const institution =
        typeof row.institution === "string" ? row.institution.trim() : "";
      const yearNum =
        typeof row.year === "number" ? row.year : Number(String(row.year ?? ""));

      if (!degree || !institution || !Number.isFinite(yearNum)) return null;

      return {
        degree,
        institution,
        year: yearNum,
      };
    })
    .filter((item): item is DoctorRecord["education"][number] => item !== null);
}

function maskPatientName(name?: string | null, index = 0) {
  const clean = (name || "").trim();
  if (!clean) return `Patient ${index + 1}`;
  return `${clean[0] ?? "P"}***`;
}

function formatReviews(
  ratings: {
    rating: number;
    comment: string | null;
    createdAt: Date;
    booking: { patient: { name: string } | null };
  }[]
): ReviewEntry[] {
  return ratings.slice(0, 5).map((review, index) => ({
    rating: review.rating,
    comment: review.comment?.trim() || "Verified patient review.",
    patientName: maskPatientName(review.booking?.patient?.name, index),
    createdAt: review.createdAt.toISOString(),
  }));
}

export async function getLiveDoctorCatalog(): Promise<DoctorRecord[]> {
  try {
    const doctors = await prisma.doctorProfile.findMany({
      include: {
        timings: {
          include: {
            slots: true,
          },
        },
        reviews: {
          select: {
            rating: true,
            comment: true,
            createdAt: true,
            booking: {
              select: {
                patient: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    if (doctors.length === 0) return [];

    return doctors.map((doctor) => {
      const reviewCount = doctor.reviews.length;
      const rating =
        reviewCount > 0
          ? doctor.reviews.reduce((sum, item) => sum + item.rating, 0) / reviewCount
          : 4.7;

      const availabilities = doctor.timings.flatMap((timing) => {
        if (!timing.isOpen) return [];
        return timing.slots.map((slot) => ({
          dayOfWeek: dayMap[timing.day] ?? 1,
          startTime: slot.startTime,
          endTime: slot.endTime,
        }));
      });

      return {
        slug: doctor.slug,
        name: doctor.displayName,
        credentials: doctor.credentials || "MBBS",
        specialtySlug: normalizeSpecialtySlug(doctor.specialty),
        subSpecialties: doctor.subSpecialties ?? [],
        experience: doctor.experience ?? 0,
        bio:
          doctor.bio?.trim() ||
          `${doctor.displayName} is available for online specialist consultation.`,
        photoUrl: doctor.photoUrl || "/images/placeholders/doctor-avatar.svg",
        languages: doctor.languages?.length ? doctor.languages : ["English"],
        consultFee: doctor.consultFee ?? 0,
        rating,
        reviewCount,
        isAvailable: availabilities.length > 0,
        conditions: doctor.conditions ?? [],
        education: parseEducation(doctor.education),
        hospitalAffils: doctor.hospitalAffils ?? [],
        reviews: formatReviews(doctor.reviews),
        availabilities,
      };
    });
  } catch (error) {
    console.error("live doctor catalog fallback to seed data", error);
    return [];
  }
}

export async function getLiveDoctorCountBySpecialty(): Promise<Record<string, number>> {
  const doctors = await getLiveDoctorCatalog();
  const countMap: Record<string, number> = {};
  for (const specialty of SPECIALTIES) {
    countMap[specialty.slug] = 0;
  }
  for (const doctor of doctors) {
    countMap[doctor.specialtySlug] = (countMap[doctor.specialtySlug] ?? 0) + 1;
  }
  return countMap;
}
