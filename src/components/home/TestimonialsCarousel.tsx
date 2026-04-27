"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RatingStars } from "@/components/ui/RatingStars";
import { Button } from "@/components/ui/button";
import type { TestimonialRecord } from "@/types/catalog";

export function TestimonialsCarousel({
  testimonials,
}: {
  testimonials: TestimonialRecord[];
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    skipSnaps: false,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    const onReInit = () => setScrollSnaps(emblaApi.scrollSnapList());

    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect();

    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onReInit);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onReInit);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || isPaused) {
      return;
    }

    const timer = setInterval(() => {
      emblaApi.scrollNext();
    }, 4500);

    return () => clearInterval(timer);
  }, [emblaApi, isPaused]);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div className="mt-8 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={scrollPrev}
          aria-label="Previous patient story"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={scrollNext}
          aria-label="Next patient story"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="mt-4 overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {testimonials.map((item) => (
            <blockquote
              key={item.name + item.quote.slice(0, 12)}
              className="min-w-0 shrink-0 basis-full rounded-2xl border border-border bg-white p-6 shadow-sm md:basis-[calc(50%-12px)] lg:basis-[calc(33.333%-16px)]"
            >
              <RatingStars value={item.rating} />
              <p className="mt-4 text-sm leading-relaxed text-foreground">
                &ldquo;{item.quote}&rdquo;
              </p>
              <footer className="mt-4 text-xs font-semibold text-[#0A1628]">
                {item.name}
                <span className="block font-normal text-muted-foreground">
                  {item.role}
                </span>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Go to patient story slide ${index + 1}`}
            className={`h-2.5 w-2.5 rounded-full transition ${
              index === selectedIndex ? "bg-[#0A1628]" : "bg-slate-300"
            }`}
            onClick={() => scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
}
