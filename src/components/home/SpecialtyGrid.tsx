import Link from "next/link";
import { SPECIALTIES } from "@/data/specialties";
import { SpecialtyCard } from "@/components/specialties/SpecialtyCard";
import { getLiveDoctorCountBySpecialty } from "@/lib/doctor-catalog";

export async function SpecialtyGrid() {
  const counts = await getLiveDoctorCountBySpecialty();
  const featuredSpecialties = SPECIALTIES.slice(0, 8);

  return (
    <section className="border-y border-emerald-100 bg-gradient-to-b from-[#F8FAFC] to-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Care categories
              </p>
              <h2 className="mt-2 font-heading text-3xl font-semibold text-[#0A1628] sm:text-4xl">
                20+ specialties
              </h2>
              <p className="mt-3 text-muted-foreground">
                From cardiology to fertility, each hub includes long-form medical
                education, FAQs, and condition lists to help you self-triage
                before booking.
              </p>
            </div>
            <Link
              href="/specialties"
              className="inline-flex h-10 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-5 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-100"
            >
              View all specialties
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {featuredSpecialties.map((s) => (
              <SpecialtyCard
                key={s.slug}
                specialty={s}
                doctorCount={counts[s.slug] ?? 0}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
