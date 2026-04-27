import type { Metadata } from "next";
import Script from "next/script";
import { ContactForm } from "./components/ContactForm";
import { HeroSection } from "./components/HeroSection";
import { HospitalPartners } from "./components/HospitalPartners";
import { HowItWorks } from "./components/HowItWorks";
import { MedicalTourism } from "./components/MedicalTourism";
import { TreatmentOptions } from "./components/TreatmentOptions";
import { surgeryGuidanceMetadata } from "./metadata";

export async function generateMetadata(): Promise<Metadata> {
  return surgeryGuidanceMetadata;
}

const faq = [
  ["Do you charge patients for guidance?", "No. Patient guidance is free."],
  ["Do you only work with NABH hospitals?", "We prioritize NABH accredited and vetted hospitals."],
  ["Can I request a second opinion?", "Yes, we coordinate second opinions with specialists."],
  ["Do you help international patients?", "Yes, including medical tourism support."],
  ["What surgeries are covered?", "Cardiac, ortho, neuro, gastro, urology, and more."],
  ["Can you negotiate package prices?", "Yes, we help present package options and negotiated estimates."],
];

export default function SurgeryGuidancePage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://techdrhealth.com";

  return (
    <main>
      <HeroSection />
      <HowItWorks />
      <TreatmentOptions />
      <HospitalPartners />
      <MedicalTourism />
      <ContactForm />

      <Script id="sg-org-schema" type="application/ld+json" strategy="lazyOnload" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Organization", name: "Surgery Guidance Hyderabad", description: "Free patient guidance service connecting patients with NABH accredited hospitals and expert surgeons in Hyderabad", url: `${siteUrl}/surgery-guidance`, areaServed: "Hyderabad, Telangana, India", telephone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+91-XXXXXXXXXX", email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "guidance@techdrhealth.com", serviceType: "Medical Patient Guidance", priceRange: "Free" }) }} />
      <Script id="sg-local-schema" type="application/ld+json" strategy="lazyOnload" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "LocalBusiness", name: "Surgery Guidance", address: { "@type": "PostalAddress", addressLocality: "Hyderabad", addressRegion: "Telangana", addressCountry: "IN" }, geo: { "@type": "GeoCoordinates", latitude: 17.385, longitude: 78.4867 }, openingHoursSpecification: { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "09:00", closes: "20:00" } }) }} />
      <Script id="sg-faq-schema" type="application/ld+json" strategy="lazyOnload" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }) }} />
      <Script id="sg-medicalorg-schema" type="application/ld+json" strategy="lazyOnload" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "MedicalOrganization", name: "Surgery Guidance Hyderabad", medicalSpecialty: ["Cardiology", "Orthopedics", "Oncology", "Neurology", "Urology", "Gastroenterology"] }) }} />
    </main>
  );
}
