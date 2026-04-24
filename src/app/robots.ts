import type { MetadataRoute } from "next";

const SITE_URL = "https://techdrhealth.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/admin/",
          "/api/",
          "/consultation/",
          "/login",
          "/register",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/dashboard/", "/admin/", "/api/", "/consultation/"],
      },
    ],
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/blog/sitemap.xml`,
      `${SITE_URL}/doctors/sitemap.xml`,
    ],
    host: SITE_URL,
  };
}
