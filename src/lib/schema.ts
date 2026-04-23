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
    logo: `${SITE_URL}/techdrhealth-logo.png`,
    description:
      "India's trusted teleconsultation platform with 100+ verified doctors across 20+ specialities.",
    telephone: "+91-9032292171",
    email: "techdrtelehealth@gmail.com",
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "1st floor, Sri Lalitha Devi Nilayam, 16-11-16, N/118, West Prasanth Nagar, Malakpet Extension, New Malakpet",
      postalCode: "500036",
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
  reviews?: {
    rating: number;
    comment: string;
    patientName: string;
    createdAt?: string;
  }[];
}) {
  const reviewSchema = (doctor.reviews ?? [])
    .filter((review) => Boolean(review.comment?.trim()))
    .slice(0, 8)
    .map((review) => {
      const payload: Record<string, unknown> = {
        "@type": "Review",
        reviewBody: review.comment,
        reviewRating: {
          "@type": "Rating",
          ratingValue: review.rating,
          bestRating: "5",
          worstRating: "1",
        },
        author: {
          "@type": "Person",
          name: review.patientName || "Verified patient",
        },
      };
      if (review.createdAt) payload.datePublished = review.createdAt;
      return payload;
    });

  const baseSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["Physician", "Person"],
    "@id": `${SITE_URL}/doctors/profile/${doctor.slug}/#physician`,
    name: `Dr. ${doctor.name.replace(/^Dr\.?\s*/i, "")}`,
    image: doctor.photoUrl || `${SITE_URL}/placeholder-doctor.png`,
    url: `${SITE_URL}/doctors/profile/${doctor.slug}`,
    mainEntityOfPage: `${SITE_URL}/doctors/profile/${doctor.slug}`,
    jobTitle: doctor.specialty,
    description: `${doctor.specialty} with ${doctor.experience} years of experience. ${doctor.credentials}.`,
    medicalSpecialty: doctor.specialty,
    areaServed: "IN",
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

  if (doctor.reviewCount > 0) {
    baseSchema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: doctor.rating.toFixed(1),
      reviewCount: doctor.reviewCount,
      bestRating: "5",
      worstRating: "1",
    };
  }
  if (reviewSchema.length > 0) {
    baseSchema.review = reviewSchema;
  }

  return baseSchema;
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

export function getSpecialtyReviewsSchema(input: {
  specialty: string;
  specialtySlug: string;
  reviews: {
    rating: number;
    comment: string;
    patientName: string;
    createdAt?: string;
    doctorName: string;
    doctorSlug: string;
  }[];
}) {
  const url = `${SITE_URL}/doctors/${input.specialtySlug}/reviews`;
  const validReviews = input.reviews.filter((review) => Boolean(review.comment?.trim()));
  const reviewCount = validReviews.length;
  const avgRating =
    reviewCount > 0
      ? validReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
      : 0;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${input.specialty} Patient Reviews`,
    url,
    description: `Verified patient feedback for online ${input.specialty} consultations.`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: validReviews.slice(0, 20).map((review, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Review",
          reviewBody: review.comment,
          reviewRating: {
            "@type": "Rating",
            ratingValue: review.rating,
            bestRating: "5",
            worstRating: "1",
          },
          author: {
            "@type": "Person",
            name: review.patientName,
          },
          itemReviewed: {
            "@type": "Physician",
            name: review.doctorName,
            url: `${SITE_URL}/doctors/profile/${review.doctorSlug}`,
          },
          ...(review.createdAt ? { datePublished: review.createdAt } : {}),
        },
      })),
    },
    ...(reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount,
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
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
        url: `${SITE_URL}/techdrhealth-logo.png`,
      },
    },
  };
}
