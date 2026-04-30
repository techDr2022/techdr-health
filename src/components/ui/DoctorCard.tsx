import Link from "next/link";
import { Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DoctorCardProps {
  name: string;
  specialty: string;
  credentials: string;
  experience: number;
  rating: number;
  reviewCount: number;
  consultFee: number;
  languages: string[];
  isAvailable: boolean;
  initials: string;
  slug: string;
  nextSlot?: string;
  patientCount?: number;
}

export function DoctorCard(props: DoctorCardProps) {
  const {
    name,
    specialty,
    credentials,
    experience,
    rating,
    reviewCount,
    consultFee,
    languages,
    isAvailable,
    initials,
    slug,
    nextSlot,
    patientCount,
  } = props;

  return (
    <div
      className={cn(
        "group overflow-hidden rounded-2xl border border-slate-200 bg-white",
        "transition-all duration-300 hover:-translate-y-1.5",
        "hover:border-blue-300 hover:shadow-[0_12px_40px_rgba(35,72,196,.12)]"
      )}
    >
      <div className="relative flex items-start justify-between overflow-hidden bg-blue-950 px-5 pb-4 pt-5">
        <div
          className="absolute -right-16 -top-20 h-48 w-48 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(92,124,250,.2), transparent)" }}
        />

        <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-xl border-2 border-blue-400/30 bg-blue-800 font-display text-[18px] font-[800] text-blue-300">
          {initials}
        </div>

        {isAvailable && (
          <div className="relative z-10 flex items-center gap-1.5 rounded-full border border-green-400/25 bg-green-500/15 px-2.5 py-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
            <span className="font-body text-[10px] font-[700] text-green-400">Available Now</span>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="mb-0.5 font-display text-[16px] font-[700] text-slate-900">Dr. {name}</h3>
        <p className="mt-1 text-sm font-semibold text-primary line-clamp-1">{specialty}</p>
        <p className="mb-4 mt-0.5 font-body text-[11px] text-slate-400">
          {credentials} · {experience} yrs exp
        </p>

        <div className="mb-4 flex gap-4">
          <div>
            <div className="flex items-center gap-1 font-display text-[14px] font-[700] text-slate-800">
              <Star className="h-3 w-3 fill-amber-400 stroke-none" />
              {rating.toFixed(1)}
            </div>
            <div className="font-body text-[10px] uppercase tracking-wide text-slate-400">
              {reviewCount.toLocaleString()} reviews
            </div>
          </div>
          {patientCount ? (
            <div>
              <div className="font-display text-[14px] font-[700] text-slate-800">{patientCount.toLocaleString()}+</div>
              <div className="font-body text-[10px] uppercase tracking-wide text-slate-400">patients</div>
            </div>
          ) : null}
          <div>
            <div className="font-display text-[14px] font-[700] text-slate-800">{experience} yrs</div>
            <div className="font-body text-[10px] uppercase tracking-wide text-slate-400">experience</div>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {languages.slice(0, 3).map((language) => (
            <span
              key={language}
              className="rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 font-body text-[10px] font-[600] text-blue-700"
            >
              {language}
            </span>
          ))}
        </div>

        {nextSlot ? (
          <div className="mb-4 flex items-center gap-1.5 text-teal-600">
            <Clock className="h-3 w-3" />
            <span className="font-body text-[11px] font-[600]">Next: {nextSlot}</span>
          </div>
        ) : null}

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            <span className="font-body text-[10px] text-slate-400">Consultation</span>
            <p className="font-display text-[20px] font-[800] text-slate-900">₹{consultFee}</p>
          </div>
          <Button
            asChild
            size="sm"
            className="rounded-xl bg-blue-600 px-4 font-body text-[13px] font-[700] text-white shadow shadow-blue-600/20 hover:bg-blue-700"
          >
            <Link href={`/doctors/profile/${slug}`}>Book Now →</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
