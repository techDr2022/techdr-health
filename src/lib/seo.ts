import type { Metadata } from "next";
import {
  KEYWORDS_DEFAULT,
  ORG_TWITTER_HANDLE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site-config";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article" | "profile";
  noIndex?: boolean;
  keywords?: string[];
  locale?: string;
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function generateSEO({
  title,
  description,
  path,
  image = "/techdrhealth-logo.png",
  type = "website",
  noIndex = false,
  keywords = [],
  locale = "en",
}: SEOProps): Metadata {
  const url = `${SITE_URL}${path}`;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const ogImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;
  const mergedKeywords = [...KEYWORDS_DEFAULT, ...keywords].filter(Boolean);

  return {
    title: fullTitle,
    description,
    applicationName: SITE_NAME,
    metadataBase: new URL(SITE_URL),
    keywords: mergedKeywords.join(", "),
    alternates: {
      canonical: url,
      languages: {
        en: url,
        "en-IN": url,
        "x-default": `${SITE_URL}/`,
      },
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      type,
      locale,
      alternateLocale: ["en_IN", "en_US", "en_GB", "en_AE"],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
      site: ORG_TWITTER_HANDLE,
      creator: ORG_TWITTER_HANDLE,
    },
    other: {
      "geo.region": "WORLD",
      "geo.placename": "Worldwide",
      language: locale === "en" ? "en" : locale,
      "content-language": "en",
    },
  };
}

export function getHomepageSEO(): Metadata {
  return generateSEO({
    title: "Worldwide Online Doctor Consultation - 1000+ Verified Specialists",
    description: SITE_DESCRIPTION,
    path: "/",
    keywords: [
      "online doctor worldwide",
      "teleconsultation global",
      "international telemedicine",
      "video doctor consultation India",
      "medical tourism teleconsultation",
      "consult specialist online",
    ],
  });
}

export function getGlobalTeleconsultationSEO(): Metadata {
  return generateSEO({
    title: "Global Teleconsultation - Online Doctors Worldwide",
    description:
      "Book video consultations with verified specialists from anywhere. TechDrHealth serves patients across 15+ countries with secure telehealth, digital prescriptions, and multilingual doctors.",
    path: "/teleconsultation",
    keywords: [
      "global teleconsultation",
      "international online doctor",
      "telemedicine worldwide",
      "cross-border healthcare",
    ],
  });
}

export function getRegionPageSEO(region: {
  name: string;
  slug: string;
  description: string;
}): Metadata {
  return generateSEO({
    title: `Online Doctor Consultation ${region.name} - Video Telehealth`,
    description: region.description,
    path: `/teleconsultation/${region.slug}`,
    keywords: [
      `online doctor ${region.name}`,
      `teleconsultation ${region.name}`,
      `video doctor ${region.name}`,
      `telehealth ${region.name}`,
    ],
  });
}

export function getSpecialtyPageSEO(
  specialty: string,
  doctorCount: number,
): Metadata {
  const slug = toSlug(specialty);
  return generateSEO({
    title: `Online ${specialty} Consultation - Book Verified ${specialty} Doctors`,
    description: `Consult verified ${specialty} doctors online via HD video worldwide. ${doctorCount}+ specialists available. Get diagnosis, treatment plan & digital prescription. Book from ₹200 / $5.`,
    path: `/doctors/${slug}`,
    keywords: [
      `online ${specialty.toLowerCase()} consultation`,
      `${specialty.toLowerCase()} doctor online`,
      `global ${specialty.toLowerCase()} teleconsultation`,
    ],
    type: "website",
  });
}

export function getDoctorProfileSEO(doctor: {
  name: string;
  specialty: string;
  credentials: string;
  experience: number;
  slug: string;
  rating?: number;
  reviewCount?: number;
  city?: string;
}): Metadata {
  const ratingSnippet =
    doctor.reviewCount && doctor.reviewCount > 0 && doctor.rating
      ? ` Rated ${doctor.rating.toFixed(1)}/5 from ${doctor.reviewCount}+ patient reviews.`
      : "";
  return generateSEO({
    title: `Dr. ${doctor.name} - Online ${doctor.specialty} Consultation`,
    description: `Consult Dr. ${doctor.name}, ${doctor.specialty} with ${doctor.experience} years experience. ${doctor.credentials}.${ratingSnippet} Book online video consultation worldwide. Get digital prescription instantly.`,
    path: `/doctors/profile/${doctor.slug}`,
    keywords: [
      `Dr ${doctor.name}`,
      `online ${doctor.specialty.toLowerCase()} doctor`,
      doctor.city
        ? `${doctor.specialty.toLowerCase()} doctor ${doctor.city}`
        : "",
    ],
    type: "profile",
  });
}

export function getSymptomPageSEO(symptom: string, specialty: string): Metadata {
  return generateSEO({
    title: `Doctor for ${symptom} Online - Consult ${specialty} Specialist`,
    description: `Looking for a doctor for ${symptom.toLowerCase()}? Consult verified ${specialty} specialists online via video from anywhere. Get diagnosis & prescription in minutes.`,
    path: `/symptoms/${toSlug(symptom)}`,
    keywords: [
      `doctor for ${symptom.toLowerCase()} online`,
      `online doctor ${symptom.toLowerCase()}`,
      `${symptom.toLowerCase()} doctor consultation`,
    ],
  });
}

export function getCityPageSEO(city: string, doctorCount: number): Metadata {
  return generateSEO({
    title: `Online Doctor Consultation ${city} - ${doctorCount}+ Verified Doctors`,
    description: `Consult verified doctors online in ${city} and worldwide. ${doctorCount}+ specialists available for HD video consultation. No travel needed. Digital prescription included.`,
    path: `/doctors/city/${toSlug(city)}`,
    keywords: [
      `online doctor ${city}`,
      `doctor consultation ${city} online`,
      `teleconsultation ${city}`,
      `video doctor ${city}`,
    ],
  });
}

export function getCitySpecialtyPageSEO(
  city: string,
  specialty: string,
  doctorCount: number
): Metadata {
  const citySlug = toSlug(city);
  const specialtySlug = toSlug(specialty);
  return generateSEO({
    title: `Best ${specialty} Doctor Online in ${city}`,
    description: `Book online ${specialty.toLowerCase()} consultation in ${city}. ${doctorCount}+ verified ${specialty.toLowerCase()} specialists available via HD video. Digital prescription, transparent fees from ₹200.`,
    path: `/doctors/${citySlug}/${specialtySlug}`,
    keywords: [
      `${specialty.toLowerCase()} doctor online ${city}`,
      `online ${specialty.toLowerCase()} consultation ${city}`,
      `best ${specialty.toLowerCase()} doctor ${city}`,
      `${specialty.toLowerCase()} specialist ${city} teleconsultation`,
    ],
  });
}

export function getSpecialtyReviewsSEO(
  specialty: string,
  reviewCount: number,
  avgRating?: number,
): Metadata {
  const ratingSnippet =
    reviewCount > 0 && avgRating
      ? ` Average rating ${avgRating.toFixed(1)}/5 from ${reviewCount} patient reviews.`
      : "";
  return generateSEO({
    title: `${specialty} Patient Reviews - Verified Feedback`,
    description: `Read verified patient reviews for online ${specialty} consultations worldwide.${ratingSnippet} Compare doctors and book securely.`,
    path: `/doctors/${toSlug(specialty)}/reviews`,
    keywords: [
      `${specialty.toLowerCase()} patient reviews`,
      `${specialty.toLowerCase()} doctor ratings`,
      `best ${specialty.toLowerCase()} doctor online`,
    ],
    type: "website",
  });
}

export function getBlogPostSEO(post: {
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: string;
  author: string;
  category: string;
  specialtySlug?: string;
}): Metadata {
  const titleTerms = post.title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((term) => term.length > 3)
    .slice(0, 5);

  return generateSEO({
    title: post.title,
    description: post.excerpt || SITE_DESCRIPTION,
    path: `/blog/${post.slug}`,
    keywords: [
      "teleconsultation",
      "online doctor",
      "global health tips",
      `${post.category} guide`,
      post.specialtySlug ? `online ${post.specialtySlug} consultation` : "",
      ...titleTerms,
    ],
    type: "article",
  });
}

export { toSlug };
