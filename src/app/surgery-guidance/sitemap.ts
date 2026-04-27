import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://techdrhealth.com";
  const posts = getAllPosts();

  return [
    {
      url: `${siteUrl}/surgery-guidance`,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/surgery-guidance/blog`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: `${siteUrl}/surgery-guidance/blog/${post.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}

// Add this route to root robots.txt sitemap entries if needed.
