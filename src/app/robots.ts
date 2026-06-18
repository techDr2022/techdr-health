import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-config";

const SITE_URL = getSiteUrl();
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
  "/consult/payment",
  "/login",
  "/register",
  "/forgot-password",
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
        disallow: ["/dashboard/", "/admin/", "/api/", "/consultation/", "/consult/payment"],
      },
      // Allow AI crawlers on public content for AEO/GEO visibility
      {
        userAgent: "GPTBot",
        allow: ["/", "/blog/", "/faq", "/teleconsultation/", "/care/", "/doctors/", "/specialties/", "/about", "/llms.txt"],
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "ClaudeBot",
        allow: ["/", "/blog/", "/faq", "/teleconsultation/", "/care/", "/llms.txt"],
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/blog/", "/faq", "/teleconsultation/", "/care/", "/llms.txt"],
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "Google-Extended",
        allow: ["/", "/blog/", "/faq", "/teleconsultation/", "/care/"],
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "anthropic-ai",
        allow: ["/", "/blog/", "/faq", "/teleconsultation/", "/llms.txt"],
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: SITEMAPS,
    host: SITE_URL,
  };
}
