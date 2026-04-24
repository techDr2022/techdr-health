import type { MetadataRoute } from "next";
import { SEO_KEYWORD_PAGES } from "@/data/seo-keywords";
import { CITY_TARGETS, SYMPTOM_TARGETS } from "@/data/seo-targets";
import { listSpecialtySlugs } from "@/data/specialties";

const SITE_URL = "https://techdrhealth.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPaths = [
    "",
    "/doctors",
    "/specialties",
    "/blog",
    "/consult",
    "/about",
    "/faq",
    "/contact",
    "/join",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? ("daily" as const) : ("weekly" as const),
    priority:
      path === ""
        ? 1
        : path === "/doctors" || path === "/specialties" || path === "/blog"
          ? 0.9
          : 0.8,
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

  const keywordPaths = SEO_KEYWORD_PAGES.map((item) => ({
    url: `${SITE_URL}/care/${item.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.72,
  }));

  return [
    ...staticPaths,
    ...specialtyPaths,
    ...symptomPaths,
    ...cityPaths,
    ...keywordPaths,
  ];
}
