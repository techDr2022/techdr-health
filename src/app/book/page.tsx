import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BookHero } from "@/components/book/BookHero";
import { BookSearchHub } from "@/components/book/BookSearchHub";
import { BookDoctorResults } from "@/components/book/BookDoctorResults";
import { BookHowItWorks } from "@/components/book/BookHowItWorks";
import { SymptomChecker } from "@/components/ai/SymptomChecker";
import { DoctorCard } from "@/components/doctors/DoctorCard";
import { Button } from "@/components/ui/button";
import { filterDoctors, getSpecialtyTitle } from "@/lib/queries";
import {
  getLiveDoctorCatalog,
  getLiveDoctorCountBySpecialty,
} from "@/lib/doctor-catalog";
import type { DoctorRecord } from "@/types/catalog";
import { SPECIALTIES } from "@/data/specialties";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateSEO } from "@/lib/seo";

export const metadata: Metadata = generateSEO({
  title: "Book Specialist Consultation Online",
  description:
    "Search specialist doctors by name or specialty and book teleconsultations quickly with verified profiles, transparent pricing, and secure booking flow.",
  path: "/book",
  keywords: [
    "book specialist doctor online",
    "online specialist consultation India",
    "doctor booking platform",
  ],
});

type SP = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

function getFeaturedSpecialists(
  doctors: Awaited<ReturnType<typeof getLiveDoctorCatalog>>,
  limit = 6
) {
  return [...doctors]
    .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount)
    .slice(0, limit);
}

function sortForBooking(doctors: DoctorRecord[]) {
  return [...doctors].sort((a, b) => {
    if (a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1;
    return b.rating * b.reviewCount - a.rating * a.reviewCount;
  });
}

function SearchHubFallback() {
  return (
    <div className="relative -mt-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="h-[140px] animate-pulse rounded-2xl border border-emerald-100 bg-white shadow-lg" />
    </div>
  );
}

export default async function BookPage({ searchParams }: { searchParams: SP }) {
  const [doctors, counts] = await Promise.all([
    getLiveDoctorCatalog(),
    getLiveDoctorCountBySpecialty(),
  ]);

  const specialty = first(searchParams.specialty);
  const query = first(searchParams.q)?.trim();
  const lang = first(searchParams.lang);
  const minRating = Number(first(searchParams.rating));
  const maxFee = Number(first(searchParams.maxFee));
  const hasFilters = Boolean(
    specialty || query || lang || (minRating > 0 && Number.isFinite(minRating)) || (maxFee > 0 && maxFee < 3000 && Number.isFinite(maxFee))
  );
  const specialtyTitle = getSpecialtyTitle(specialty);

  const specialists = sortForBooking(
    filterDoctors(
      {
        specialty: specialty || undefined,
        query: query || undefined,
        lang: lang || undefined,
        minRating:
          Number.isFinite(minRating) && minRating > 0 ? minRating : undefined,
        maxFee:
          Number.isFinite(maxFee) && maxFee > 0 && maxFee < 3000
            ? maxFee
            : undefined,
      },
      doctors
    )
  );

  const featured = getFeaturedSpecialists(doctors);
  const bookableTotal = doctors.length;

  const resultsHeading = specialtyTitle
    ? `${specialtyTitle} specialists`
    : query
      ? `Results for "${query}"`
      : "Available doctors";

  const resultsSubtext = specialtyTitle
    ? `Verified ${specialtyTitle.toLowerCase()} doctors with open video slots.`
    : query
      ? "Compare profiles, fees, and book instantly."
      : `${bookableTotal} verified specialists ready for video consultation.`;

  return (
    <>
      <Navbar />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Book Specialist Consultation Online",
          description:
            "Search specialist doctors by name or specialty and book teleconsultations quickly with verified profiles, transparent pricing, and secure booking flow.",
          url: "https://techdrhealth.com/book",
          inLanguage: "en-IN",
        }}
      />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30 pt-16">
        <BookHero
          availableCount={bookableTotal}
          specialtyCount={SPECIALTIES.length}
        />

        <Suspense fallback={<SearchHubFallback />}>
          <BookSearchHub
            counts={counts}
            initialQuery={query}
            initialSpecialty={specialty}
            resultCount={hasFilters ? specialists.length : 0}
            hasFilters={hasFilters}
          />
        </Suspense>

        <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
          <SymptomChecker variant="compact" />
        </section>

        {hasFilters ? (
          <BookDoctorResults
            doctors={specialists}
            heading={resultsHeading}
            subtext={resultsSubtext}
          />
        ) : null}

        {!hasFilters ? (
          <section className="mx-auto max-w-7xl px-4 pb-10 pt-2 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-heading text-xl font-semibold text-[#0A1628] sm:text-2xl">
                  Top-rated this week
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Highly trusted specialists across India.
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/doctors">Full directory</Link>
              </Button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((doctor) => (
                <DoctorCard key={doctor.slug} doctor={doctor} variant="compact" />
              ))}
            </div>
          </section>
        ) : null}

        <BookHowItWorks />
      </main>
      <Footer />
    </>
  );
}
