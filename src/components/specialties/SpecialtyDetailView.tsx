import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DoctorCard } from "@/components/doctors/DoctorCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { SpecialtyHero } from "@/components/specialties/SpecialtyHero";
import { getSpecialtyBySlug, SPECIALTIES } from "@/data/specialties";
import { crossSpecialtyDoctors } from "@/lib/queries";
import { getLiveDoctorCatalog } from "@/lib/doctor-catalog";
import { getFAQSchema, getSpecialtyPageSchema } from "@/lib/schema";
import { notFound } from "next/navigation";

export async function SpecialtyDetailView({ slug }: { slug: string }) {
  const specialty = getSpecialtyBySlug(slug);
  if (!specialty) notFound();

  const allDoctors = await getLiveDoctorCatalog();
  const doctors = allDoctors.filter((doctor) => doctor.specialtySlug === slug);
  const relatedDoctors = crossSpecialtyDoctors(specialty.relatedSlugs, 6, allDoctors);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          getSpecialtyPageSchema(specialty.name, doctors.length),
          getFAQSchema(
            specialty.faq.map((item) => ({
              question: item.question,
              answer: item.answer,
            })),
          ),
        ]}
      />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Doctors", href: "/doctors" },
          { label: specialty.name },
        ]}
      />

      <div className="mt-8 space-y-12">
        <SpecialtyHero specialty={specialty} doctorCount={doctors.length} />

        <article className="max-w-none">
          <div className="whitespace-pre-wrap text-base leading-relaxed text-muted-foreground">
            {specialty.description.split("\n\n").map((para, i) => (
              <p key={i} className="mb-4">
                {para.trim()}
              </p>
            ))}
          </div>
        </article>

        <section>
          <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
            Conditions we treat
          </h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {specialty.conditions.map((c) => (
              <li
                key={c}
                className="rounded-lg border border-border bg-white px-4 py-2 text-sm shadow-sm"
              >
                <Link href={`/symptoms/${c.toLowerCase().replace(/\s+/g, "-")}`}>
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-[#F8FAFC] p-6 sm:p-8">
          <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
            When to see a {specialty.name.toLowerCase()} specialist
          </h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Persistent symptoms that limit work or sleep, abnormal test results
            needing specialist interpretation, medication side effects, or new
            diagnoses that benefit from expert confirmation are common reasons
            patients book online {specialty.name.toLowerCase()} consultations.
            Emergency symptoms-severe pain, sudden weakness, breathing distress,
            or bleeding-belong in emergency services, not teleconsult.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
            {specialty.name} doctors online
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {doctors.map((d) => (
              <DoctorCard key={d.slug} doctor={d} />
            ))}
          </div>
          {doctors.length === 0 ? (
            <p className="text-muted-foreground">
              No doctors listed in demo data-contact support to match a
              clinician.
            </p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
                {specialty.name} patient reviews
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Read verified in-app feedback and doctor ratings for this specialty.
              </p>
            </div>
            <Link
              href={`/doctors/${slug}/reviews`}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
            >
              View all reviews
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/doctors/${slug}/reviews/5-star`}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:border-primary/40"
            >
              5 Star
            </Link>
            <Link
              href={`/doctors/${slug}/reviews/4-plus`}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:border-primary/40"
            >
              4+ Stars
            </Link>
            <Link
              href={`/doctors/${slug}/reviews/3-plus`}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:border-primary/40"
            >
              3+ Stars
            </Link>
          </div>
        </section>

        <section>
          <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
            Specialty FAQs
          </h2>
          <div className="mt-6 space-y-6">
            {specialty.faq.map((f) => (
              <div
                key={f.question}
                className="rounded-xl border border-border bg-white p-5 shadow-sm"
              >
                <h3 className="font-semibold text-[#0A1628]">{f.question}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {f.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
            Related specialties
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {specialty.relatedSlugs.map((rs) => {
              const label =
                SPECIALTIES.find((s) => s.slug === rs)?.name ??
                rs.replace(/-/g, " ");
              return (
                <Link
                  key={rs}
                  href={`/doctors/${rs}`}
                  className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary hover:bg-primary/15"
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
            You may also consult
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Cross-specialty collaboration for overlapping symptoms-book with
            these doctors when clinically appropriate.
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {relatedDoctors.map((d) => (
              <DoctorCard key={d.slug} doctor={d} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
