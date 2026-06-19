import { revalidatePath } from "next/cache";
import { resolveSpecialtySlug } from "@/lib/doctor-specialty";

export function revalidateDoctorPublicPages(specialty?: string) {
  revalidatePath("/");
  revalidatePath("/doctors");
  revalidatePath("/specialties");

  if (specialty?.trim()) {
    const slug = resolveSpecialtySlug(specialty);
    revalidatePath(`/doctors/${slug}`);
    revalidatePath(`/specialties/${slug}`);
  }
}
