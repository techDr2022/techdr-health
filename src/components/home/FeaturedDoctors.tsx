"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DoctorCard } from "@/components/doctors/DoctorCard";
import type { DoctorRecord } from "@/types/catalog";

function reviewScore(doctor: DoctorRecord) {
  const avgFromComments =
    doctor.reviews.length > 0
      ? doctor.reviews.reduce((sum, item) => sum + item.rating, 0) / doctor.reviews.length
      : doctor.rating;
  const weightedRating = avgFromComments * 0.65 + doctor.rating * 0.35;
  const confidenceBoost = Math.log10(doctor.reviewCount + 1);
  return weightedRating * confidenceBoost;
}

export function FeaturedDoctors({ doctors }: { doctors: DoctorRecord[] }) {
  const featured = [...doctors]
    .sort((a, b) => reviewScore(b) - reviewScore(a))
    .slice(0, 6);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    skipSnaps: false,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section className="border-y border-border bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl font-semibold text-[#0A1628] sm:text-4xl">
              Featured doctors
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Ranked by patient reviews and ratings so top quality doctors appear
              first.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              aria-label="Previous doctors"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={scrollNext}
              aria-label="Next doctors"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="mt-10 overflow-hidden" ref={emblaRef}>
          {featured.length > 0 ? (
            <div className="flex gap-6">
              {featured.map((d) => (
                <div
                  key={d.slug}
                  className="min-w-0 shrink-0 basis-[min(100%,380px)]"
                >
                  <DoctorCard doctor={d} variant="compact" />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 p-6 text-sm text-muted-foreground">
              No doctors added yet. Register and approve doctors to feature them here.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
