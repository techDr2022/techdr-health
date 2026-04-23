import type { DoctorRecord } from "@/types/catalog";
import { SPECIALTIES } from "./specialties";

// Seed doctor data intentionally empty.
// Real doctors should come from DB via `getLiveDoctorCatalog()`.
export const DOCTORS: DoctorRecord[] = [];

export function getDoctorBySlug(slug: string) {
  return DOCTORS.find((d) => d.slug === slug);
}

export function doctorsBySpecialty(specialtySlug: string) {
  return DOCTORS.filter((d) => d.specialtySlug === specialtySlug);
}

export function countDoctorsBySpecialty(): Record<string, number> {
  const map: Record<string, number> = {};
  for (const s of SPECIALTIES) map[s.slug] = 0;
  for (const d of DOCTORS) {
    map[d.specialtySlug] = (map[d.specialtySlug] ?? 0) + 1;
  }
  return map;
}
