import { CITY_TARGETS, CITY_UNIQUE_COPY } from "@/data/seo-targets";
import { getSpecialtyBySlug, listSpecialtySlugs } from "@/data/specialties";

export const RESERVED_DOCTOR_CITY_SEGMENTS = new Set(["profile", "city", "sitemap"]);

export function formatCityName(slug: string): string {
  if (slug.toLowerCase() === "vizag") return "Visakhapatnam";
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

export function resolveCitySlug(slug: string) {
  const normalized = slug.toLowerCase();
  if (RESERVED_DOCTOR_CITY_SEGMENTS.has(normalized)) return null;
  return CITY_TARGETS.find((city) => city === normalized) ?? null;
}

export function getTopCitiesForSpecialty(limit = 5) {
  return CITY_TARGETS.slice(0, limit);
}

export function buildCitySpecialtyPath(city: string, specialtySlug: string) {
  return `/doctors/${city.toLowerCase()}/${specialtySlug}`;
}

export function buildCitySpecialtyIntro(cityName: string, specialtyName: string, citySlug: string) {
  const uniqueCopy = CITY_UNIQUE_COPY[citySlug as (typeof CITY_TARGETS)[number]];
  const base = `Book an online ${specialtyName.toLowerCase()} consultation in ${cityName} with NMC-verified specialists on TechDrHealth. Consult via secure HD video from home, receive digital prescriptions when medically appropriate, and see transparent fees before payment.`;
  return uniqueCopy ? `${base} ${uniqueCopy}` : base;
}

export function buildCitySpecialtyFaqs(
  cityName: string,
  specialtyName: string,
  doctorCount: number
) {
  const specialtyLower = specialtyName.toLowerCase();
  return [
    {
      question: `How do I consult a ${specialtyLower} doctor online in ${cityName}?`,
      answer: `Choose a verified ${specialtyLower} specialist on TechDrHealth, select an available slot, pay securely, and join your video consultation from ${cityName} or anywhere in India.`,
    },
    {
      question: `Are online ${specialtyLower} prescriptions valid in ${cityName}?`,
      answer:
        "Yes. When clinically appropriate, doctors issue digital prescriptions aligned with Indian telemedicine guidelines. Emergency symptoms require in-person emergency care.",
    },
    {
      question: `What is the fee for ${specialtyLower} online consultation in ${cityName}?`,
      answer:
        "Consultation fees start from ₹200 and vary by doctor experience. Final fees are shown before payment with no hidden charges.",
    },
    {
      question: `How many ${specialtyLower} doctors are available for ${cityName} patients?`,
      answer: `${doctorCount}+ verified ${specialtyLower} specialists are currently available for online consultation through TechDrHealth.`,
    },
    {
      question: `Can I share lab reports before my ${specialtyLower} video consult?`,
      answer:
        "Yes. Upload reports during booking or from your Health Records vault so your doctor can review them before or during the consultation.",
    },
  ];
}

export async function listCitySpecialtyStaticParams(
  specialtyCounts: Record<string, number>
) {
  const params: { slug: string; specialty: string }[] = [];

  for (const city of CITY_TARGETS) {
    for (const specialty of listSpecialtySlugs()) {
      if ((specialtyCounts[specialty] ?? 0) > 0) {
        params.push({ slug: city, specialty });
      }
    }
  }

  return params;
}

export function isValidCitySpecialtyRoute(city: string, specialty: string) {
  return resolveCitySlug(city) !== null && getSpecialtyBySlug(specialty) !== null;
}
