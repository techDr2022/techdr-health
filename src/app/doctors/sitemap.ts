import type { MetadataRoute } from "next";
import { getLiveDoctorCatalog } from "@/lib/doctor-catalog";

const SITE_URL = "https://techdrhealth.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const liveDoctors = await getLiveDoctorCatalog();

  return liveDoctors.map((doctor) => ({
    url: `${SITE_URL}/doctors/profile/${doctor.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
}
