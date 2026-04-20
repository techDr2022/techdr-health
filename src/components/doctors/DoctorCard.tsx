import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { DoctorRecord } from "@/types/catalog";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/ui/RatingStars";
import { AvailabilityBadge } from "@/components/ui/AvailabilityBadge";
import { ConsultationFeeTag } from "@/components/ui/ConsultationFeeTag";
import { Card, CardContent } from "@/components/ui/card";

export function DoctorCard({
  doctor,
  variant = "default",
}: {
  doctor: DoctorRecord;
  variant?: "default" | "compact";
}) {
  return (
    <Card className="overflow-hidden border-border/80 shadow-sm transition-all hover:shadow-md hover:border-primary/30">
      <CardContent className={variant === "compact" ? "p-4" : "p-5"}>
        <div className="flex gap-4">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-28 sm:w-28">
            <Image
              src={doctor.photoUrl}
              alt={`${doctor.name}, ${doctor.credentials}`}
              fill
              className="object-cover"
              sizes="(max-width:768px) 96px, 112px"
              loading="lazy"
            />
          </div>
          <div className="min-w-0 flex-1">
            <Link
              href={`/doctors/profile/${doctor.slug}`}
              className="font-heading text-lg font-semibold text-[#0A1628] hover:text-primary truncate block"
            >
              {doctor.name}
            </Link>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {doctor.credentials}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <RatingStars value={doctor.rating} size={14} />
              <span className="text-xs text-muted-foreground">
                ({doctor.reviewCount})
              </span>
              <AvailabilityBadge available={doctor.isAvailable} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {doctor.experience}+ yrs · {doctor.languages.slice(0, 2).join(", ")}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <ConsultationFeeTag inr={doctor.consultFee} />
          <Button asChild size="sm" className="gap-1 shadow-sm">
            <Link href={`/consult?doctor=${doctor.slug}`}>
              Book Now <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
