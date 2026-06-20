import { revalidatePath, revalidateTag } from "next/cache";
import { DOCTOR_CATALOG_CACHE_TAG } from "@/lib/doctor-catalog";
import { resolveSpecialtySlug } from "@/lib/doctor-specialty";
import { CITY_TARGETS } from "@/data/seo-targets";

export function revalidateDoctorPublicPages(specialty?: string, doctorSlug?: string) {
  revalidateTag(DOCTOR_CATALOG_CACHE_TAG);
  revalidatePath("/");
  revalidatePath("/doctors");
  revalidatePath("/specialties");

  if (specialty?.trim()) {
    const slug = resolveSpecialtySlug(specialty);
    revalidatePath(`/doctors/${slug}`);
    revalidatePath(`/specialties/${slug}`);
    for (const city of CITY_TARGETS) {
      revalidatePath(`/doctors/${city}/${slug}`);
    }
  }

  if (doctorSlug?.trim()) {
    revalidatePath(`/doctors/profile/${doctorSlug.trim()}`);
  }
}
