export const SITE_NAME = "TechDrHealth";
export const SITE_TAGLINE = "Worldwide Online Doctor Consultation";
export const SITE_DESCRIPTION =
  "Consult verified doctors online via secure HD video from anywhere in the world. 1000+ specialists across 20+ medical specialties. Global teleconsultation with HIPAA-style privacy, digital prescriptions, and 24/7 booking.";

export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (raw && !/localhost|127\.0\.0\.1/i.test(raw)) {
    return raw.replace("://www.", "://");
  }
  return "https://techdrhealth.com";
}

export const SITE_URL = getSiteUrl();

export const KEYWORDS_DEFAULT = [
  "online doctor consultation",
  "teleconsultation",
  "video doctor consultation",
  "consult doctor online",
  "worldwide telehealth",
  "global telemedicine",
  "online specialist appointment",
  "virtual doctor visit",
];

export const ORG_TWITTER_HANDLE = "@techdrtelehealth";

export const GLOBAL_LANGUAGES = [
  "English",
  "Hindi",
  "Telugu",
  "Tamil",
  "Arabic",
  "Spanish",
  "French",
];

export const WORLDWIDE_REGIONS_SERVED = [
  "India",
  "United States",
  "United Kingdom",
  "United Arab Emirates",
  "Canada",
  "Australia",
  "Singapore",
  "Saudi Arabia",
  "Germany",
  "France",
  "South Africa",
  "Philippines",
  "Bangladesh",
  "Nepal",
  "Sri Lanka",
];
