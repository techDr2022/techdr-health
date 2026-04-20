const SITE_URL = "https://techdrhealth.com";
const SITE_NAME = "TechDrHealth";

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function getMedicalOrgSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      "India's trusted teleconsultation platform with 100+ verified doctors across 20+ specialities.",
    telephone: "+91-XXXXXXXXXX",
    email: "support@techdrhealth.com",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
      addressLocality: "Hyderabad",
      addressRegion: "Telangana",
    },
    sameAs: [
      "https://www.facebook.com/techdrhealth",
      "https://twitter.com/techdrhealth",
      "https://www.linkedin.com/company/techdrhealth",
      "https://www.instagram.com/techdrhealth",
    ],
    medicalSpecialty: [
      "Cardiology",
      "Dermatology",
      "General Medicine",
      "Gynecology",
      "Pediatrics",
      "Psychiatry",
      "Orthopedics",
      "Neurology",
    ],
    availableService: {
      "@type": "MedicalTherapy",
      name: "Online Video Consultation",
      description: "HD video consultation with verified specialist doctors",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "50000",
      bestRating: "5",
      worstRating: "1",
    },
  };
}

export function getWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/doctors?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function getDoctorSchema(doctor: {
  name: string;
  specialty: string;
  credentials: string;
  experience: number;
  rating: number;
  reviewCount: number;
  consultFee: number;
  photoUrl?: string;
  slug: string;
  medRegNumber?: string;
  languages: string[];
  education: { degree: string; institution: string; year: string | number }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": ["Physician", "Person"],
    "@id": `${SITE_URL}/doctors/profile/${doctor.slug}/#physician`,
    name: `Dr. ${doctor.name.replace(/^Dr\.?\s*/i, "")}`,
    image: doctor.photoUrl || `${SITE_URL}/placeholder-doctor.png`,
    url: `${SITE_URL}/doctors/profile/${doctor.slug}`,
    jobTitle: doctor.specialty,
    description: `${doctor.specialty} with ${doctor.experience} years of experience. ${doctor.credentials}.`,
    medicalSpecialty: doctor.specialty,
    knowsLanguage: doctor.languages,
    alumniOf: doctor.education.map((edu) => ({
      "@type": "EducationalOrganization",
      name: edu.institution,
    })),
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      name: doctor.credentials,
      credentialCategory: "Medical Degree",
    },
    worksFor: {
      "@type": "MedicalOrganization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: doctor.rating.toFixed(1),
      reviewCount: doctor.reviewCount,
      bestRating: "5",
      worstRating: "1",
    },
    priceRange: `₹${doctor.consultFee}`,
    availableService: {
      "@type": "MedicalTherapy",
      name: "Online Video Consultation",
      description: "HD video consultation",
      offers: {
        "@type": "Offer",
        price: doctor.consultFee,
        priceCurrency: "INR",
      },
    },
    ...(doctor.medRegNumber ? { identifier: doctor.medRegNumber } : {}),
  };
}

export function getFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };
}

export function getBreadcrumbSchema(crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`,
    })),
  };
}

export function getSpecialtyPageSchema(specialty: string, doctorCount: number) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: `Online ${specialty} Consultation`,
    url: `${SITE_URL}/doctors/${toSlug(specialty)}`,
    description: `Consult verified ${specialty} doctors online. ${doctorCount}+ specialists available.`,
    medicalAudience: {
      "@type": "MedicalAudience",
      audienceType: "Patient",
    },
    about: {
      "@type": "MedicalSpecialty",
      name: specialty,
    },
    provider: {
      "@type": "MedicalOrganization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function getArticleSchema(post: {
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  authorName: string;
  imageUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    url: `${SITE_URL}/blog/${post.slug}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    image: post.imageUrl || `${SITE_URL}/og-default.png`,
    author: {
      "@type": "Person",
      name: post.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
  };
}
