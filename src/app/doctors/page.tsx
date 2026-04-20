import type { Metadata } from "next";
import Image from "next/image";
import { DoctorFilters } from "@/components/doctors/DoctorFilters";
import { DoctorCard } from "@/components/doctors/DoctorCard";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  filterDoctors,
  paginate,
  getSpecialtyTitle,
} from "@/lib/queries";
import { SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Find Online Doctors — Teleconsult Directory | ${SITE_NAME}`,
  description:
    "Filter 1000+ verified specialists by specialty, language, rating, fee, and availability for teleconsultation India-wide.",
};

type SP = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export default function DoctorsDirectoryPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const specialty = first(searchParams.specialty);
  const lang = first(searchParams.lang);
  const q = first(searchParams.q) ?? first(searchParams.query);
  const page = Math.max(1, Number(first(searchParams.page)) || 1);
  const minExp = Number(first(searchParams.minExp));
  const rating = Number(first(searchParams.rating));
  const maxFee = Number(first(searchParams.maxFee));
  const available = first(searchParams.available);

  const filters = {
    specialty,
    lang,
    query: q,
    minExperience: Number.isFinite(minExp) ? minExp : undefined,
    minRating: Number.isFinite(rating) ? rating : undefined,
    maxFee: Number.isFinite(maxFee) ? maxFee : undefined,
    availableOnly: available === "1",
  };

  const filtered = filterDoctors(filters);
  const { items, totalPages, total } = paginate(filtered, page, 12);

  const specialtyTitle = getSpecialtyTitle(specialty);
  const h1 = specialtyTitle
    ? `Online ${specialtyTitle}s — Book Teleconsultation`
    : "Find online doctors & specialists";

  const buildLink = (nextPage: number) => {
    const p = new URLSearchParams();
    if (specialty) p.set("specialty", specialty);
    if (lang) p.set("lang", lang);
    if (q) p.set("q", q);
    if (filters.minExperience != null && filters.minExperience > 0)
      p.set("minExp", String(filters.minExperience));
    if (filters.minRating != null && filters.minRating > 0)
      p.set("rating", String(filters.minRating));
    if (filters.maxFee != null && filters.maxFee < 3000)
      p.set("maxFee", String(filters.maxFee));
    if (filters.availableOnly) p.set("available", "1");
    p.set("page", String(nextPage));
    return `/doctors?${p.toString()}`;
  };

  return (
    <>
      <Navbar />
      <main className="bg-gradient-to-b from-white via-emerald-50/30 to-white pt-20">
        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <h1 className="font-heading text-4xl font-semibold text-[#0A1628] sm:text-5xl">
              {h1}
            </h1>
            <p className="mt-3 text-muted-foreground">
              Showing {items.length} of {total} doctors
              {specialty ? ` in ${specialtyTitle}` : ""}. Browse verified
              specialists with transparent pricing and availability.
            </p>
          </div>
          <div className="relative h-52 overflow-hidden rounded-2xl border border-emerald-100 shadow-sm sm:h-60">
            <Image
              src="https://images.unsplash.com/photo-1612531385446-f7b6b8f8f68b?auto=format&fit=crop&w=1400&q=80"
              alt="Doctors available for online consultation"
              fill
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 50vw"
            />
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Doctors" },
            ]}
          />
          <div className="mt-8 flex flex-col gap-10 lg:flex-row">
            <DoctorFilters defaultSpecialty={specialty} />
            <div className="flex-1">
              <div className="grid gap-6 md:grid-cols-2">
                {items.map((d) => (
                  <DoctorCard key={d.slug} doctor={d} />
                ))}
              </div>
              {totalPages > 1 ? (
                <div className="mt-10 flex justify-center gap-2">
                  {page > 1 ? (
                    <Button asChild variant="outline">
                      <Link href={buildLink(page - 1)}>Previous</Link>
                    </Button>
                  ) : null}
                  <span className="flex items-center px-4 text-sm text-muted-foreground">
                    Page {page} / {totalPages}
                  </span>
                  {page < totalPages ? (
                    <Button asChild variant="outline">
                      <Link href={buildLink(page + 1)}>Next</Link>
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
