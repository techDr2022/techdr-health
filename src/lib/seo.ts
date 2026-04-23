import type { Metadata } from "next";
import { ORG_TWITTER_HANDLE } from "@/lib/site-config";

const SITE_NAME = "TechDrHealth";
const SITE_URL = "https://techdrhealth.com";
const SITE_DESC =
  "Consult verified doctors online via video in minutes. 100+ specialists across 20+ specialities. Book teleconsultation now on TechDrHealth.";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article" | "profile";
  noIndex?: boolean;
  keywords?: string[];
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
}: SEOProps): Metadata {
  const url = `${SITE_URL}${path}`;
  const fullTitle = `${title} | ${SITE_NAME}`;
  const ogImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;
  const mergedKeywords = [
    "online doctor consultation",
    "teleconsultation India",
    "consult doctor online",
    "video doctor consultation",
    ...keywords,
  ].filter(Boolean);

  return {
    title: fullTitle,
    description,
    applicationName: SITE_NAME,
    metadataBase: new URL(SITE_URL),
    keywords: mergedKeywords.join(", "),
    alternates: {
      canonical: url,
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
          },
        },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      type,
      locale: "en_IN",
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
      "geo.region": "IN",
      "geo.placename": "India",
      language: "en-IN",
    },
  };
}

export function getHomepageSEO(): Metadata {
  return generateSEO({
    title: "Online Doctor Consultation India - 100+ Verified Specialists",
    description:
      "Consult verified doctors online via video in minutes. 100+ specialists across 20+ specialities. General Medicine, Cardiology, Dermatology & more. Book now from ₹200.",
    path: "/",
    keywords: [
      "online doctor India",
      "consult doctor online",
      "video doctor consultation",
      "teleconsultation India",
      "online specialist India",
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
    description: `Consult verified ${specialty} doctors online via video. ${doctorCount}+ specialists available. Get diagnosis, treatment plan & digital prescription. Book from ₹200.`,
    path: `/doctors/${slug}`,
    keywords: [
      `online ${specialty.toLowerCase()} consultation`,
      `${specialty.toLowerCase()} doctor online`,
      `${specialty.toLowerCase()} teleconsultation India`,
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
    description: `Consult Dr. ${doctor.name}, ${doctor.specialty} with ${doctor.experience} years experience. ${doctor.credentials}.${ratingSnippet} Book online video consultation. Get digital prescription instantly.`,
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
    description: `Looking for a doctor for ${symptom.toLowerCase()}? Consult verified ${specialty} specialists online via video. Get diagnosis & prescription in minutes. Book now from ₹200.`,
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
    description: `Consult verified doctors online in ${city}. ${doctorCount}+ specialists available for video consultation. No travel needed. Book now from ₹200. Get digital prescription.`,
    path: `/doctors/city/${toSlug(city)}`,
    keywords: [
      `online doctor ${city}`,
      `doctor consultation ${city} online`,
      `teleconsultation ${city}`,
      `video doctor ${city}`,
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
    description: `Read verified patient reviews for online ${specialty} consultations.${ratingSnippet} Compare doctors and book securely.`,
    path: `/doctors/${toSlug(specialty)}/reviews`,
    keywords: [
      `${specialty.toLowerCase()} patient reviews`,
      `${specialty.toLowerCase()} doctor ratings`,
      `best ${specialty.toLowerCase()} doctor online`,
      `online ${specialty.toLowerCase()} consultation reviews`,
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
}): Metadata {
  return generateSEO({
    title: post.title,
    description: post.excerpt || SITE_DESC,
    path: `/blog/${post.slug}`,
    keywords: [
      "teleconsultation",
      "online doctor",
      "health tips India",
      post.category,
    ],
    type: "article",
  });
}
