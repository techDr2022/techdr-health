import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { BookingWidget } from "@/components/doctors/BookingWidget";
import { DoctorCard } from "@/components/doctors/DoctorCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { RatingStars } from "@/components/ui/RatingStars";
import { DOCTORS, getDoctorBySlug } from "@/data/doctors";
import { getSpecialtyBySlug } from "@/data/specialties";
import { getDoctorProfileSEO } from "@/lib/seo";
import { relatedDoctorsForSpecialty } from "@/lib/queries";
import { getDoctorSchema } from "@/lib/schema";

export const revalidate = 3600;

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return DOCTORS.map((d) => ({ slug: d.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const d = getDoctorBySlug(params.slug);
  if (!d) return { title: "Doctor" };
  const spec = getSpecialtyBySlug(d.specialtySlug)?.name ?? d.specialtySlug;
  return getDoctorProfileSEO({
    name: d.name.replace(/^Dr\.?\s*/i, ""),
    specialty: spec,
    credentials: d.credentials,
    experience: d.experience,
    slug: d.slug,
  });
}

export default function DoctorProfilePage({ params }: Props) {
  const doctor = getDoctorBySlug(params.slug);
  if (!doctor) notFound();

  const specialty = getSpecialtyBySlug(doctor.specialtySlug);
  const similar = relatedDoctorsForSpecialty(doctor.specialtySlug, doctor.slug);
  const doctorSchema = getDoctorSchema({
    name: doctor.name.replace(/^Dr\.?\s*/i, ""),
    specialty: specialty?.name ?? doctor.specialtySlug,
    credentials: doctor.credentials,
    experience: doctor.experience,
    rating: doctor.rating,
    reviewCount: doctor.reviewCount,
    consultFee: doctor.consultFee,
    photoUrl: doctor.photoUrl,
    slug: doctor.slug,
    languages: doctor.languages,
    education: doctor.education.map((e) => ({
      degree: e.degree,
      institution: e.institution,
      year: e.year,
    })),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd data={doctorSchema} />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Doctors", href: "/doctors" },
          {
            label: specialty?.name ?? "Specialty",
            href: `/doctors/${doctor.specialtySlug}`,
          },
          { label: doctor.name },
        ]}
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <article>
          <div className="flex flex-col gap-8 sm:flex-row">
            <div className="relative mx-auto aspect-[3/4] w-full max-w-[280px] overflow-hidden rounded-3xl bg-muted shadow-lg sm:mx-0">
              <Image
                src={doctor.photoUrl}
                alt={`${doctor.name}, ${doctor.credentials}`}
                fill
                priority
                className="object-cover"
                sizes="(max-width:1024px) 280px, 320px"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#0EA5E9]">
                {specialty?.name}
              </p>
              <h1 className="mt-2 font-heading text-4xl font-semibold text-[#0A1628]">
                {doctor.name} - Online {specialty?.name ?? "Specialty"} Consultation
              </h1>
              <p className="mt-2 text-muted-foreground">{doctor.credentials}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <RatingStars value={doctor.rating} />
                <span className="text-sm text-muted-foreground">
                  {doctor.reviewCount}+ reviews
                </span>
                <span className="text-sm text-muted-foreground">
                  · {doctor.experience}+ years experience
                </span>
              </div>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                {doctor.bio}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {doctor.subSpecialties.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <section className="mt-12">
            <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
              Education & training
            </h2>
            <ul className="mt-4 space-y-3">
              {doctor.education.map((e) => (
                <li
                  key={e.degree + e.year}
                  className="rounded-xl border border-border bg-white px-4 py-3 text-sm shadow-sm"
                >
                  <span className="font-semibold">{e.degree}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {e.institution} ({e.year})
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12">
            <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
              Hospital affiliations
            </h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {doctor.hospitalAffils.map((h) => (
                <li key={h} className="rounded-lg bg-[#F8FAFC] px-3 py-2 text-sm">
                  {h}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12">
            <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
              Languages
            </h2>
            <p className="mt-2 text-muted-foreground">
              {doctor.languages.join(", ")}
            </p>
          </section>

          <section className="mt-12">
            <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
              Conditions treated
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {doctor.conditions.map((c) => (
                <li key={c}>
                  <Link
                    href={`/doctors/${doctor.specialtySlug}`}
                    className="rounded-full border border-border bg-white px-3 py-1 text-sm hover:border-[#0EA5E9]/40"
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12">
            <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
              Patient reviews
            </h2>
            <div className="mt-6 space-y-4">
              {doctor.reviews.map((r, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-white p-5 shadow-sm"
                >
                  <RatingStars value={r.rating} />
                  <p className="mt-3 text-sm leading-relaxed">{r.comment}</p>
                  <p className="mt-3 text-xs font-semibold text-[#0A1628]">
                    {r.patientName}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-14">
            <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
              Related specialties
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Explore adjacent hubs for overlapping symptoms—your clinician may
              recommend coordinated care.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {Array.from(
                new Set([
                  doctor.specialtySlug,
                  ...(specialty?.relatedSlugs ?? []),
                ])
              )
                .slice(0, 4)
                .map((slug) => (
                  <Link
                    key={slug}
                    href={`/doctors/${slug}`}
                    className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary hover:bg-primary/15"
                  >
                    {getSpecialtyBySlug(slug)?.name ?? slug}
                  </Link>
                ))}
            </div>
          </section>

          <section className="mt-14">
            <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
              Similar doctors
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {similar.map((d) => (
                <DoctorCard key={d.slug} doctor={d} />
              ))}
            </div>
          </section>
        </article>

        <aside className="lg:sticky lg:top-24 h-fit space-y-6">
          <BookingWidget doctor={doctor} />
        </aside>
      </div>
    </div>
  );
}
