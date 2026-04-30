import type { MetadataRoute } from "next";

const SITE_URL = "https://techdrhealth.com";
const SITEMAPS = [
  `${SITE_URL}/sitemap.xml`,
  `${SITE_URL}/blog/sitemap.xml`,
  `${SITE_URL}/doctors/sitemap.xml`,
  `${SITE_URL}/surgery-guidance/sitemap.xml`,
];

const PRIVATE_PATHS = [
  "/dashboard/",
  "/admin/",
  "/api/",
  "/consultation/",
  "/login",
  "/register",
];

// AI crawlers commonly used for model training/content harvesting.
const AI_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "CCBot",
  "anthropic-ai",
  "ClaudeBot",
  "Claude-Web",
  "Google-Extended",
  "Bytespider",
  "meta-externalagent",
  "meta-externalfetcher",
  "Applebot-Extended",
  "PerplexityBot",
  "Perplexity-User",
  "YouBot",
  "cohere-ai",
  "Amazonbot",
  "Diffbot",
  "omgili",
  "omgilibot",
  "PetalBot",
  "TurnitinBot",
  "TikTokSpider",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/dashboard/", "/admin/", "/api/", "/consultation/"],
      },
      ...AI_BOTS.map((bot) => ({
        userAgent: bot,
        disallow: "/",
      })),
    ],
    sitemap: SITEMAPS,
    host: SITE_URL,
  };
}
