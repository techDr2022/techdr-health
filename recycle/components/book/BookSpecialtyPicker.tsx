import Link from "next/link";
import { SPECIALTIES } from "@/data/specialties";
import { SpecialtyIcon } from "@/components/specialties/SpecialtyIcon";
import { cn } from "@/lib/utils";

const POPULAR_SLUGS = [
  "general-medicine",
  "dermatology",
  "cardiology",
  "pediatrics",
  "psychiatry",
  "gynecology",
  "orthopedics",
  "ent",
  "diabetology",
  "gastroenterology",
];

type Props = {
  activeSpecialty?: string;
  counts: Record<string, number>;
};

export function BookSpecialtyPicker({ activeSpecialty, counts }: Props) {
  const popular = POPULAR_SLUGS.map((slug) =>
    SPECIALTIES.find((s) => s.slug === slug)
  ).filter(Boolean) as typeof SPECIALTIES;

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-[#0A1628]">
        Popular specialties
      </p>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/book"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
            !activeSpecialty
              ? "border-[#0EA5E9] bg-[#0EA5E9]/10 text-[#0369a1]"
              : "border-border bg-white text-muted-foreground hover:border-[#0EA5E9]/40 hover:text-[#0A1628]"
          )}
        >
          All doctors
        </Link>
        {popular.map((specialty) => {
          const isActive = activeSpecialty === specialty.slug;
          const count = counts[specialty.slug] ?? 0;
          return (
            <Link
              key={specialty.slug}
              href={`/book?specialty=${specialty.slug}`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-[#0EA5E9] bg-[#0EA5E9]/10 text-[#0369a1]"
                  : "border-border bg-white text-muted-foreground hover:border-[#0EA5E9]/40 hover:text-[#0A1628]"
              )}
            >
              <SpecialtyIcon iconKey={specialty.iconKey} className="h-3.5 w-3.5" />
              {specialty.name}
              {count > 0 ? (
                <span className="text-xs opacity-70">({count})</span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
