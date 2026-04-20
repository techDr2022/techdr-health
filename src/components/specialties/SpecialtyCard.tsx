import Link from "next/link";
import { SpecialtyIcon } from "@/components/specialties/SpecialtyIcon";
import type { SpecialtyRecord } from "@/types/catalog";

export function SpecialtyCard({
  specialty,
  doctorCount,
}: {
  specialty: SpecialtyRecord;
  doctorCount: number;
}) {
  return (
    <Link
      href={`/specialties/${specialty.slug}`}
      className="group flex min-w-[240px] flex-col rounded-2xl border border-border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#0EA5E9]/40 hover:shadow-md sm:min-w-[260px]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="rounded-xl bg-[#0EA5E9]/10 p-3 text-[#0A1628] transition-colors group-hover:bg-[#0EA5E9]/15">
          <SpecialtyIcon iconKey={specialty.iconKey} className="h-7 w-7 text-[#0EA5E9]" />
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {doctorCount}+ doctors
        </span>
      </div>
      <h3 className="mt-4 font-heading text-lg font-semibold text-[#0A1628]">
        {specialty.name}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
        {specialty.shortIntro}
      </p>
      <span className="mt-4 text-sm font-semibold text-[#0EA5E9] group-hover:underline">
        Consult now →
      </span>
    </Link>
  );
}
