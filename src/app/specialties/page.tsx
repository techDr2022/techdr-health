import Link from "next/link";
import type { Metadata } from "next";
import { SpecialtyIcon } from "@/components/specialties/SpecialtyIcon";
import { SPECIALTIES } from "@/data/specialties";
import { countDoctorsBySpecialty } from "@/data/doctors";
import { SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Medical Specialties — ${SITE_NAME}`,
  description:
    "Explore 20+ specialties for teleconsultation India patients—from cardiology and dermatology to fertility—with doctor counts and SEO-rich detail pages.",
};

export default function SpecialtiesIndexPage() {
  const counts = countDoctorsBySpecialty();
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-4xl font-semibold text-[#0A1628]">
        All specialties
      </h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Each specialty hub includes clinician-written education, FAQs, long-tail
        condition targeting, and internal links to curated doctors—optimized for
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
                {counts[s.slug] ?? 0}+ doctors · View hub →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
