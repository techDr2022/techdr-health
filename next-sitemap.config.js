/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://techdrhealth.com",
  generateRobotsTxt: false,
  changefreq: "daily",
  priority: 0.7,
  sitemapSize: 5000,
  generateIndexSitemap: false,
  outDir: "public",
  exclude: [
    "/dashboard/*",
    "/admin/*",
    "/api/*",
    "/consultation/*",
    "/login",
    "/register",
  ],
  robotsTxtOptions: {
    additionalSitemaps: ["https://techdrhealth.com/sitemap.xml"],
  },
};
