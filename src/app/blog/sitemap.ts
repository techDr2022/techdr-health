import type { MetadataRoute } from "next";
import { listSpecialtySlugs } from "@/data/specialties";
import { getMergedPublishedPosts } from "@/lib/blog-posts";

const SITE_URL = "https://techdrhealth.com";

function getBlogPriorityByAge(publishedAt: string | undefined) {
  if (!publishedAt) return 0.66;
  const publishedMs = new Date(publishedAt).getTime();
  if (Number.isNaN(publishedMs)) return 0.66;

  const ageDays = Math.floor((Date.now() - publishedMs) / (1000 * 60 * 60 * 24));
  if (ageDays <= 30) return 0.8;
  if (ageDays <= 90) return 0.75;
  if (ageDays <= 180) return 0.72;
  if (ageDays <= 365) return 0.68;
  return 0.64;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const publishedPosts = await getMergedPublishedPosts();

  const blogCategoryPaths = listSpecialtySlugs().map((slug) => ({
    url: `${SITE_URL}/blog?category=${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.74,
  }));

  const postPaths = publishedPosts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.publishedAt ? new Date(p.publishedAt) : now,
    changeFrequency: "monthly" as const,
    priority: getBlogPriorityByAge(p.publishedAt),
  }));

  return [...blogCategoryPaths, ...postPaths];
}
