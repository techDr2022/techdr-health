import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BriefcaseMedical,
  Building2,
  GraduationCap,
  Languages,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { BookingWidget } from "@/components/doctors/BookingWidget";
import { DoctorCard } from "@/components/doctors/DoctorCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { RatingStars } from "@/components/ui/RatingStars";
import { getSpecialtyBySlug } from "@/data/specialties";
import { getSafeImageSrc } from "@/lib/image";
import { getLiveDoctorCatalog } from "@/lib/doctor-catalog";
import { getDoctorProfileSEO } from "@/lib/seo";
import { relatedDoctorsForSpecialty } from "@/lib/queries";
import { getBreadcrumbSchema, getDoctorSchema } from "@/lib/schema";

export const dynamic = "force-dynamic";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doctors = await getLiveDoctorCatalog();
  const d = doctors.find((doctor) => doctor.slug === params.slug);
  if (!d) return { title: "Doctor" };
  const spec = getSpecialtyBySlug(d.specialtySlug)?.name ?? d.specialtySlug;
  return getDoctorProfileSEO({
    name: d.name.replace(/^Dr\.?\s*/i, ""),
    specialty: spec,
    credentials: d.credentials,
    experience: d.experience,
    rating: d.rating,
    reviewCount: d.reviewCount,
    slug: d.slug,
  });
}

export default async function DoctorProfilePage({ params }: Props) {
  const doctors = await getLiveDoctorCatalog();
  const doctor = doctors.find((item) => item.slug === params.slug);
  if (!doctor) notFound();

  const specialty = getSpecialtyBySlug(doctor.specialtySlug);
  const similar = relatedDoctorsForSpecialty(
    doctor.specialtySlug,
    doctor.slug,
    6,
    doctors
  );
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
    reviews: doctor.reviews.map((review) => ({
      rating: review.rating,
      comment: review.comment,
      patientName: review.patientName,
      createdAt: review.createdAt,
    })),
  });
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Doctors", path: "/doctors" },
    { name: specialty?.name ?? "Specialty", path: `/doctors/${doctor.specialtySlug}` },
    { name: doctor.name, path: `/doctors/profile/${doctor.slug}` },
  ]);

  return (
    <>
      <Navbar />
      <main className="pt-20">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <JsonLd data={doctorSchema} />
          <JsonLd data={breadcrumbSchema} />
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
          <section className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-[#f8fcff] to-[#f5fffb] p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-8 sm:flex-row">
              <div className="relative mx-auto aspect-[3/4] w-full max-w-[280px] overflow-hidden rounded-3xl bg-muted shadow-lg sm:mx-0">
                <Image
                  src={getSafeImageSrc(
                    doctor.photoUrl,
                    "/images/placeholders/doctor-avatar.svg"
                  )}
                  alt={`${doctor.name}, ${doctor.credentials}`}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width:1024px) 280px, 320px"
                />
              </div>
              <div className="flex-1">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified Specialist
                </span>
                <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-[#0EA5E9]">
                  {specialty?.name}
                </p>
                <h1 className="mt-2 font-heading text-3xl font-semibold leading-tight text-[#0A1628] sm:text-4xl">
                  {doctor.name}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">{doctor.credentials}</p>

                <div className="mt-5 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Experience
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {doctor.experience}+ years
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Consultation Fee
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      INR {doctor.consultFee.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Rating
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                      <Star className="h-4 w-4 fill-current text-amber-400" />
                      {doctor.rating.toFixed(1)} ({doctor.reviewCount})
                    </p>
                  </div>
                </div>

                <p className="mt-6 text-muted-foreground leading-relaxed">{doctor.bio}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {doctor.subSpecialties.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Languages className="h-4 w-4" />
                Languages
              </p>
              <p className="mt-2 text-sm text-slate-700">{doctor.languages.join(", ")}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <BriefcaseMedical className="h-4 w-4" />
                Practice Focus
              </p>
              <p className="mt-2 text-sm text-slate-700 line-clamp-2">
                {doctor.conditions.slice(0, 4).join(", ")}
              </p>
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="inline-flex items-center gap-2 font-heading text-2xl font-semibold text-[#0A1628]">
              <GraduationCap className="h-6 w-6 text-[#0EA5E9]" />
              Education & training
            </h2>
            <ul className="mt-5 space-y-3">
              {doctor.education.map((e) => (
                <li
                  key={e.degree + e.year}
                  className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
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

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="inline-flex items-center gap-2 font-heading text-2xl font-semibold text-[#0A1628]">
              <Building2 className="h-6 w-6 text-[#0EA5E9]" />
              Hospital affiliations
            </h2>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {doctor.hospitalAffils.map((h) => (
                <li key={h} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
                  {h}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
              Patient reviews
            </h2>
            <div className="mt-6 space-y-4">
              {doctor.reviews.map((r, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-[#fcfdff] p-5"
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

          <section className="mt-10">
            <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
              Related specialties
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Explore adjacent hubs for overlapping symptoms-your clinician may
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

            <section className="mt-10">
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
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm text-emerald-900">
              <p className="font-semibold">Secure and fast teleconsult booking</p>
              <p className="mt-1 text-emerald-800">
                Pick a preferred slot and connect with this specialist from anywhere.
              </p>
            </div>
            <BookingWidget doctor={doctor} />
          </aside>
        </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
