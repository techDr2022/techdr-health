import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/data/blog";
import { SEO_KEYWORD_PAGES } from "@/data/seo-keywords";
import { CITY_TARGETS, SYMPTOM_TARGETS } from "@/data/seo-targets";
import { listSpecialtySlugs } from "@/data/specialties";
import { getLiveDoctorCatalog } from "@/lib/doctor-catalog";

const SITE_URL = "https://techdrhealth.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const liveDoctors = await getLiveDoctorCatalog();

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
    priority: path === "" ? 1 : 0.8,
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
    priority: 0.8,
  }));

  const cityPaths = CITY_TARGETS.map((city) => ({
    url: `${SITE_URL}/doctors/city/${city}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  const keywordPaths = SEO_KEYWORD_PAGES.map((item) => ({
    url: `${SITE_URL}/care/${item.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.72,
  }));

  const doctors = liveDoctors.map((d) => ({
    url: `${SITE_URL}/doctors/profile/${d.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const posts = BLOG_POSTS.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...staticPaths,
    ...specialtyPaths,
    ...symptomPaths,
    ...cityPaths,
    ...keywordPaths,
    ...doctors,
    ...posts,
  ];
}
