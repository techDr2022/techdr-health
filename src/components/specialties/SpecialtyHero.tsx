import { SpecialtyIcon } from "@/components/specialties/SpecialtyIcon";
import type { SpecialtyRecord } from "@/types/catalog";

export function SpecialtyHero({
  specialty,
  doctorCount,
}: {
  specialty: SpecialtyRecord;
  doctorCount: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-[#0A1628] via-[#0d1f3a] to-[#0A1628] px-6 py-12 text-[#F8FAFC] sm:px-12">
      <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-[#0EA5E9]/10 blur-3xl" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-[#7dd3fc] ring-1 ring-white/10">
            <SpecialtyIcon iconKey={specialty.iconKey} className="h-4 w-4" />
            {doctorCount}+ specialists live on techDr Tele Health
          </div>
          <h1 className="mt-6 font-heading text-4xl font-semibold tracking-tight sm:text-5xl text-balance">
            Online {specialty.name} Consultation - Book Verified{" "}
            {specialty.name} Doctors
          </h1>
          <p className="mt-4 text-lg text-slate-300 leading-relaxed">
            {specialty.shortIntro}
          </p>
        </div>
      </div>
    </div>
  );
}
