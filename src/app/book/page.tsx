import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DoctorCard } from "@/components/doctors/DoctorCard";
import { Button } from "@/components/ui/button";
import { filterDoctors } from "@/lib/queries";
import { SPECIALTIES } from "@/data/specialties";
import { getLiveDoctorCatalog } from "@/lib/doctor-catalog";
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

function getFeaturedSpecialists(doctors: Awaited<ReturnType<typeof getLiveDoctorCatalog>>, limit = 6) {
  return [...doctors]
    .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount)
    .slice(0, limit);
}

export default async function BookPage({ searchParams }: { searchParams: SP }) {
  const doctors = await getLiveDoctorCatalog();
  const specialty = first(searchParams.specialty);
  const query = first(searchParams.q)?.trim();

  const specialists = filterDoctors({
    specialty: specialty || undefined,
    query: query || undefined,
    availableOnly: true,
  }, doctors);

  const featured = getFeaturedSpecialists(doctors);

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
      <main className="bg-gradient-to-b from-white via-emerald-50/40 to-white pt-20">
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Book" },
            ]}
          />

          <div className="mt-5 max-w-3xl">
            <h1 className="font-heading text-4xl font-semibold text-[#0A1628] sm:text-5xl">
              Book a specialist consultation
            </h1>
            <p className="mt-3 text-muted-foreground">
              Select a specialist, search doctors, and book instantly.
            </p>
          </div>

          <form
            action="/book"
            method="get"
            className="mt-8 grid gap-4 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm md:grid-cols-[1fr_1fr_auto]"
          >
            <div className="space-y-2">
              <label
                htmlFor="specialty"
                className="text-sm font-medium text-muted-foreground"
              >
                Select specialist
              </label>
              <select
                id="specialty"
                name="specialty"
                defaultValue={specialty ?? ""}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All specialties</option>
                {SPECIALTIES.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="q" className="text-sm font-medium text-muted-foreground">
                Search specialist
              </label>
              <input
                id="q"
                name="q"
                defaultValue={query ?? ""}
                placeholder="Doctor name or keyword"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>

            <div className="flex items-end gap-2">
              <Button type="submit" className="h-10 px-6">
                Search
              </Button>
              <Button asChild type="button" variant="outline" className="h-10">
                <Link href="/book">Clear</Link>
              </Button>
            </div>
          </form>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
              Specialists available for booking
            </h2>
            <p className="text-sm text-muted-foreground">{specialists.length} found</p>
          </div>

          {specialists.length > 0 ? (
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {specialists.map((doctor) => (
                <DoctorCard key={doctor.slug} doctor={doctor} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-emerald-200 bg-white p-8 text-center">
              <p className="text-muted-foreground">
                No specialists matched your search. Try another specialty or keyword.
              </p>
            </div>
          )}
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-[#0A1628] sm:text-3xl">
                Featured specialists
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Top-rated specialists trusted by patients.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/doctors">View full directory</Link>
            </Button>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featured.map((doctor) => (
              <DoctorCard key={doctor.slug} doctor={doctor} variant="compact" />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
