import type { MetadataRoute } from "next";
import { DOCTORS } from "@/data/doctors";
import { listSpecialtySlugs } from "@/data/specialties";
import { BLOG_POSTS } from "@/data/blog";

const SITE_URL = "https://techdrhealth.com";

const SYMPTOMS = [
  "fever",
  "headache",
  "back-pain",
  "skin-rash",
  "chest-pain",
  "cough",
  "anxiety",
  "diabetes",
  "hair-loss",
  "acne",
  "stomach-pain",
  "joint-pain",
  "fatigue",
  "insomnia",
  "allergies",
];

const CITIES = [
  "hyderabad",
  "mumbai",
  "bangalore",
  "delhi",
  "chennai",
  "kolkata",
  "pune",
  "ahmedabad",
  "jaipur",
  "lucknow",
  "chandigarh",
  "kochi",
  "coimbatore",
  "nagpur",
  "vizag",
];

export default function sitemap(): MetadataRoute.Sitemap {
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

  const symptomPaths = SYMPTOMS.map((symptom) => ({
    url: `${SITE_URL}/symptoms/${symptom}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const cityPaths = CITIES.map((city) => ({
    url: `${SITE_URL}/doctors/city/${city}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  const doctors = DOCTORS.map((d) => ({
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
    ...doctors,
    ...posts,
  ];
}
