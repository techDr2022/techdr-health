"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import type { DoctorRecord } from "@/types/catalog";
import { BookNowModal } from "@/components/doctors/BookNowModal";
import { DoctorLanguages } from "@/components/doctors/DoctorLanguages";
import { AvailabilityBadge } from "@/components/ui/AvailabilityBadge";
import { ConsultationFeeTag } from "@/components/ui/ConsultationFeeTag";
import { RatingStars } from "@/components/ui/RatingStars";
import { Button } from "@/components/ui/button";
import { getSafeImageSrc } from "@/lib/image";

function specialtyLabel(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

type Props = {
  doctors: DoctorRecord[];
  heading: string;
  subtext: string;
  emptyHref?: string;
};

export function BookDoctorResults({ doctors, heading, subtext }: Props) {
  if (doctors.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-dashed border-emerald-200 bg-gradient-to-br from-white to-emerald-50/50 p-8 text-center sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <Clock className="h-7 w-7" aria-hidden />
          </div>
          <h2 className="mt-5 font-heading text-xl font-semibold text-[#0A1628] sm:text-2xl">
            No doctors match right now
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Try a different specialty, widen your fee range, or browse all
            available doctors.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/book">View all doctors</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/specialties">Browse specialties</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-[#0A1628] sm:text-3xl">
            {heading}
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
            {subtext}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          {doctors.length} available
        </div>
      </div>

      <div className="mt-6 space-y-3 sm:space-y-4 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0 xl:grid-cols-3">
        {doctors.map((doctor, index) => (
          <motion.article
            key={doctor.slug}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.04, 0.32), duration: 0.35 }}
            className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-lg hover:shadow-emerald-900/5"
          >
            <div className="flex flex-col sm:flex-row lg:flex-col">
              <div className="flex gap-4 p-4 sm:flex-1 lg:gap-0 lg:p-0">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-24 sm:w-24 lg:h-auto lg:w-full lg:rounded-none lg:rounded-t-2xl lg:aspect-[4/3]">
                  <Image
                    src={getSafeImageSrc(
                      doctor.photoUrl,
                      "/images/placeholders/doctor-avatar.svg"
                    )}
                    alt={`${doctor.name}, ${doctor.credentials}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width:640px) 80px, (max-width:1024px) 96px, 33vw"
                    loading={index < 6 ? "eager" : "lazy"}
                  />
                  <div className="absolute left-2 top-2 lg:left-3 lg:top-3">
                    <AvailabilityBadge available={doctor.isAvailable} />
                  </div>
                </div>

                <div className="min-w-0 flex-1 lg:p-4">
                  <Link
                    href={`/doctors/profile/${doctor.slug}`}
                    className="font-heading text-base font-semibold text-[#0A1628] hover:text-[#0EA5E9] sm:text-lg line-clamp-1"
                  >
                    {doctor.name}
                  </Link>
                  <p className="mt-0.5 text-sm font-medium text-[#0EA5E9]">
                    {specialtyLabel(doctor.specialtySlug)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                    {doctor.credentials}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <span className="inline-flex items-center gap-1">
                      <RatingStars value={doctor.rating} size={12} />
                      <span className="font-medium text-[#0A1628]">
                        {doctor.rating.toFixed(1)}
                      </span>
                      <span className="text-muted-foreground">({doctor.reviewCount})</span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 font-semibold text-amber-800">
                      <Clock className="h-3 w-3" aria-hidden />
                      {doctor.experience}+ yrs
                    </span>
                    <DoctorLanguages languages={doctor.languages} variant="compact" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-3 sm:border-l sm:border-t-0 lg:border-l-0 lg:border-t">
                <ConsultationFeeTag inr={doctor.consultFee} />
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="hidden text-xs sm:inline-flex"
                  >
                    <Link href={`/doctors/profile/${doctor.slug}`}>
                      Profile
                      <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </Button>
                  <BookNowModal
                    doctor={doctor}
                    triggerLabel="Book slot"
                    triggerSize="sm"
                    triggerClassName="rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] min-h-[40px] px-4"
                  />
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
