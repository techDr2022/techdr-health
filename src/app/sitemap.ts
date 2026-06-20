import type { MetadataRoute } from "next";
import { GLOBAL_REGIONS } from "@/data/global-regions";
import { SEO_KEYWORD_PAGES } from "@/data/seo-keywords";
import { CITY_TARGETS, SYMPTOM_TARGETS } from "@/data/seo-targets";
import { listSpecialtySlugs } from "@/data/specialties";
import { getLiveDoctorCountBySpecialty } from "@/lib/doctor-catalog";
import { listCitySpecialtyStaticParams } from "@/lib/city-specialty-seo";
import { getSiteUrl } from "@/lib/site-config";

const SITE_URL = getSiteUrl();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPaths = [
    "",
    "/doctors",
    "/specialties",
    "/blog",
    "/book",
    "/pricing",
    "/about",
    "/faq",
    "/contact",
    "/join",
    "/teleconsultation",
    "/privacy-policy",
    "/telemedicine-consent",
    "/grievance",
    "/terms-and-conditions",
    "/surgery-guidance",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? ("daily" as const) : ("weekly" as const),
    priority:
      path === ""
        ? 1
        : path === "/doctors" ||
            path === "/specialties" ||
            path === "/blog" ||
            path === "/teleconsultation"
          ? 0.9
          : 0.8,
  }));

  const globalRegionPaths = GLOBAL_REGIONS.map((region) => ({
    url: `${SITE_URL}/teleconsultation/${region.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.88,
  }));

  const specialtyPaths = listSpecialtySlugs().flatMap((slug) => [
    {
      url: `${SITE_URL}/specialties/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/doctors/${slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
  ]);

  const symptomPaths = Object.keys(SYMPTOM_TARGETS).map((symptom) => ({
    url: `${SITE_URL}/symptoms/${symptom}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.78,
  }));

  const cityPaths = CITY_TARGETS.map((city) => ({
    url: `${SITE_URL}/doctors/city/${city}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.82,
  }));

  const specialtyCounts = await getLiveDoctorCountBySpecialty();
  const citySpecialtyParams = await listCitySpecialtyStaticParams(specialtyCounts);
  const citySpecialtyPaths = citySpecialtyParams.map(({ slug, specialty }) => ({
    url: `${SITE_URL}/doctors/${slug}/${specialty}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const keywordPaths = SEO_KEYWORD_PAGES.map((item) => ({
    url: `${SITE_URL}/care/${item.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.72,
  }));

  return [
    ...staticPaths,
    ...globalRegionPaths,
    ...specialtyPaths,
    ...symptomPaths,
    ...cityPaths,
    ...citySpecialtyPaths,
    ...keywordPaths,
  ];
}
