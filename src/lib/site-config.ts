export const SITE_NAME = "TechDrHealth";
export const SITE_TAGLINE = "Online Doctor Consultation, Reimagined";
export const SITE_DESCRIPTION =
  "Consult verified doctors online via secure video in minutes. 1000+ specialists across 20+ medical specialties. Book teleconsultation in India with HIPAA-style privacy practices and 4.9 rating.";

export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (raw && !/localhost|127\.0\.0\.1/i.test(raw)) {
    return raw.replace("://www.", "://");
  }
  return "https://techdrhealth.com";
}

export const KEYWORDS_DEFAULT = [
  "online doctor consultation",
  "teleconsultation India",
  "video doctor consultation",
  "consult doctor online",
  "online specialist appointment",
];

export const ORG_TWITTER_HANDLE = "@techdrtelehealth";
