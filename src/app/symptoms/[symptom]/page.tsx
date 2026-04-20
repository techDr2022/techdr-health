import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { doctorsBySpecialty } from "@/data/doctors";
import { SYMPTOM_TARGETS } from "@/data/seo-targets";
import { getSpecialtyBySlug } from "@/data/specialties";
import { getSymptomPageSEO } from "@/lib/seo";
import { getFAQSchema } from "@/lib/schema";

type Props = { params: { symptom: string } };

export function generateStaticParams() {
  return Object.keys(SYMPTOM_TARGETS).map((symptom) => ({ symptom }));
}

export function generateMetadata({ params }: Props): Metadata {
  const info = SYMPTOM_TARGETS[params.symptom];
  if (!info) return { title: "Symptoms" };
  const specialty = getSpecialtyBySlug(info.specialtySlug);
  if (!specialty) return { title: "Symptoms" };
  return getSymptomPageSEO(info.label, specialty.name);
}

export default function SymptomPage({ params }: Props) {
  const info = SYMPTOM_TARGETS[params.symptom];
  if (!info) notFound();

  const specialty = getSpecialtyBySlug(info.specialtySlug);
  if (!specialty) notFound();

  const doctors = doctorsBySpecialty(info.specialtySlug).slice(0, 6);
  const relatedSymptoms = Object.entries(SYMPTOM_TARGETS)
    .filter(([slug, value]) => slug !== params.symptom && value.specialtySlug === info.specialtySlug)
    .slice(0, 5);
  const symptomFAQs = [
    {
      question: `Which doctor should I consult online for ${info.label.toLowerCase()}?`,
      answer: `For ${info.label.toLowerCase()}, start with an online ${specialty.name} consultation on TechDrHealth. Your doctor can evaluate symptoms, suggest tests if needed, and provide treatment guidance.`,
    },
    {
      question: `How much does online consultation for ${info.label.toLowerCase()} cost in India?`,
      answer:
        "Online doctor consultation on TechDrHealth starts from ₹200 depending on speciality and doctor experience. You can view fees before booking.",
    },
    {
      question: `Can I get an online prescription for ${info.label.toLowerCase()}?`,
      answer:
        "Yes, if medically appropriate, doctors provide a digital prescription after video consultation as per telemedicine guidelines in India.",
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd data={getFAQSchema(symptomFAQs)} />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Symptoms", href: "/symptoms/fever" },
          { label: info.label },
        ]}
      />

      <h1 className="mt-6 font-heading text-4xl font-semibold text-[#0A1628] sm:text-5xl">
        Doctor for {info.label} Online - Consult {specialty.name} Specialist
      </h1>
      <p className="mt-4 max-w-3xl text-muted-foreground">
        Book online doctor consultation for {info.label.toLowerCase()} with
        verified {specialty.name.toLowerCase()} specialists. Get diagnosis,
        treatment guidance, and digital prescription from the comfort of home.
      </p>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
          Top Doctors for {info.label} Online
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {doctors.map((doctor) => (
            <li key={doctor.slug} className="rounded-xl border p-4">
              <h3 className="font-semibold">{doctor.name}</h3>
              <p className="text-sm text-muted-foreground">
                {doctor.credentials} • {doctor.experience}+ years
              </p>
              <Link
                className="mt-2 inline-block text-sm text-primary hover:underline"
                href={`/doctors/profile/${doctor.slug}`}
              >
                View profile
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
          Frequently Asked Questions
        </h2>
        <div className="mt-4 space-y-3">
          {symptomFAQs.map((faq) => (
            <article key={faq.question} className="rounded-xl border p-4">
              <h3 className="font-semibold">{faq.question}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
          Explore Related Care
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/doctors/${info.specialtySlug}`}
            className="rounded-full bg-primary/10 px-4 py-2 text-sm text-primary"
          >
            Online {specialty.name} Consultation
          </Link>
          <Link
            href="/doctors"
            className="rounded-full bg-primary/10 px-4 py-2 text-sm text-primary"
          >
            Consult Doctor Online
          </Link>
          <Link
            href="/faq"
            className="rounded-full bg-primary/10 px-4 py-2 text-sm text-primary"
          >
            Teleconsultation FAQs
          </Link>
          <Link
            href="/blog"
            className="rounded-full bg-primary/10 px-4 py-2 text-sm text-primary"
          >
            Health Guides
          </Link>
          <Link
            href="/contact"
            className="rounded-full bg-primary/10 px-4 py-2 text-sm text-primary"
          >
            Contact Support
          </Link>
        </div>
      </section>

      {relatedSymptoms.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
            Related Symptoms You Can Consult For
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {relatedSymptoms.map(([slug, symptom]) => (
              <Link
                key={slug}
                href={`/symptoms/${slug}`}
                className="rounded-full bg-primary/10 px-4 py-2 text-sm text-primary"
              >
                Doctor for {symptom.label} Online
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
