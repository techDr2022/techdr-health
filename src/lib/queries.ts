import type { DoctorRecord } from "@/types/catalog";
import { SPECIALTIES } from "@/data/specialties";

export type DoctorSearchFilters = {
  specialty?: string;
  lang?: string;
  query?: string;
  minExperience?: number;
  minRating?: number;
  maxFee?: number;
  availableOnly?: boolean;
};

function matchesLang(doctor: DoctorRecord, lang?: string) {
  if (!lang) return true;
  const q = lang.toLowerCase();
  return doctor.languages.some((l) => l.toLowerCase().includes(q));
}

export function filterDoctors(
  filters: DoctorSearchFilters,
  sourceDoctors: DoctorRecord[] = []
): DoctorRecord[] {
  return sourceDoctors.filter((d) => {
    if (filters.specialty && filters.specialty !== d.specialtySlug)
      return false;
    if (filters.availableOnly && !d.isAvailable) return false;
    if (
      filters.minExperience != null &&
      d.experience < filters.minExperience
    )
      return false;
    if (filters.minRating != null && d.rating < filters.minRating)
      return false;
    if (filters.maxFee != null && d.consultFee > filters.maxFee)
      return false;
    if (!matchesLang(d, filters.lang)) return false;
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const blob = `${d.name} ${d.credentials} ${d.specialtySlug} ${d.bio}`.toLowerCase();
      if (!blob.includes(q)) return false;
    }
    return true;
  });
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const p = Math.max(1, page);
  const start = (p - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page: p,
    pageSize,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
  };
}

export function getSpecialtyTitle(slug: string | undefined) {
  if (!slug) return null;
  return SPECIALTIES.find((s) => s.slug === slug)?.name ?? null;
}

export function relatedDoctorsForSpecialty(
  specialtySlug: string,
  excludeSlug?: string,
  limit = 6,
  sourceDoctors: DoctorRecord[] = []
) {
  const pool = sourceDoctors.filter(
    (d) =>
      d.specialtySlug === specialtySlug &&
      (!excludeSlug || d.slug !== excludeSlug)
  );
  return pool.slice(0, limit);
}

export function crossSpecialtyDoctors(
  slugs: string[],
  limit = 8,
  sourceDoctors: DoctorRecord[] = []
) {
  const seen = new Set<string>();
  const out: DoctorRecord[] = [];
  for (const slug of slugs) {
    for (const d of sourceDoctors) {
      if (d.specialtySlug === slug && !seen.has(d.slug)) {
        seen.add(d.slug);
        out.push(d);
        if (out.length >= limit) return out;
      }
    }
  }
  return out;
}
