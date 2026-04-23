import Link from "next/link";
import type { Metadata } from "next";
import { SpecialtyIcon } from "@/components/specialties/SpecialtyIcon";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { SPECIALTIES } from "@/data/specialties";
import { getLiveDoctorCountBySpecialty } from "@/lib/doctor-catalog";
import { generateSEO } from "@/lib/seo";

export const metadata: Metadata = generateSEO({
  title: "Medical Specialties for Online Consultation",
  description:
    "Explore medical specialties for online consultation in India, compare doctor availability by specialty, and navigate to dedicated specialty hubs.",
  path: "/specialties",
  keywords: [
    "online doctor specialties",
    "specialist consultation India",
    "teleconsultation specialties list",
  ],
});

export default async function SpecialtiesIndexPage() {
  const counts = await getLiveDoctorCountBySpecialty();
  return (
    <>
      <Navbar />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Medical Specialties for Online Consultation",
          description:
            "Explore medical specialties for online consultation in India, compare doctor availability by specialty, and navigate to dedicated specialty hubs.",
          url: "https://techdrhealth.com/specialties",
          inLanguage: "en-IN",
        }}
      />
      <main className="bg-gradient-to-b from-white via-emerald-50/30 to-white pt-20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-semibold text-[#0A1628]">
            All specialties
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Each specialty hub includes clinician-written education, FAQs, long-tail
            condition targeting, and internal links to curated doctors - optimized for
            specialty keywords like online cardiologist consultation.
          </p>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SPECIALTIES.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/specialties/${s.slug}`}
                  className="flex h-full flex-col rounded-2xl border border-border bg-white p-6 shadow-sm transition hover:border-[#0EA5E9]/40 hover:shadow-md"
                >
                  <SpecialtyIcon
                    iconKey={s.iconKey}
                    className="h-10 w-10 text-[#0EA5E9]"
                  />
                  <h2 className="mt-4 font-heading text-xl font-semibold text-[#0A1628]">
                    {s.name}
                  </h2>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-3">
                    {s.shortIntro}
                  </p>
                  <span className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#0EA5E9]">
                    {counts[s.slug] ?? 0}+ doctors - View hub →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
