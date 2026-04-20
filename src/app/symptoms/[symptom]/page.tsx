import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { doctorsBySpecialty } from "@/data/doctors";
import { getSpecialtyBySlug } from "@/data/specialties";
import { getSymptomPageSEO } from "@/lib/seo";

const SYMPTOM_MAP: Record<string, { label: string; specialtySlug: string }> = {
  fever: { label: "Fever", specialtySlug: "general-medicine" },
  headache: { label: "Headache", specialtySlug: "neurology" },
  "back-pain": { label: "Back Pain", specialtySlug: "orthopedics" },
  "skin-rash": { label: "Skin Rash", specialtySlug: "dermatology" },
  "chest-pain": { label: "Chest Pain", specialtySlug: "cardiology" },
  cough: { label: "Cough", specialtySlug: "pulmonology" },
  anxiety: { label: "Anxiety", specialtySlug: "psychiatry" },
  diabetes: { label: "Diabetes", specialtySlug: "diabetology" },
  "hair-loss": { label: "Hair Loss", specialtySlug: "dermatology" },
  acne: { label: "Acne", specialtySlug: "dermatology" },
  "stomach-pain": { label: "Stomach Pain", specialtySlug: "gastroenterology" },
  "joint-pain": { label: "Joint Pain", specialtySlug: "rheumatology" },
  fatigue: { label: "Fatigue", specialtySlug: "general-medicine" },
  insomnia: { label: "Insomnia", specialtySlug: "psychiatry" },
  allergies: { label: "Allergies", specialtySlug: "allergy-immunology" },
};

type Props = { params: { symptom: string } };

export function generateStaticParams() {
  return Object.keys(SYMPTOM_MAP).map((symptom) => ({ symptom }));
}

export function generateMetadata({ params }: Props): Metadata {
  const info = SYMPTOM_MAP[params.symptom];
  if (!info) return { title: "Symptoms" };
  const specialty = getSpecialtyBySlug(info.specialtySlug);
  if (!specialty) return { title: "Symptoms" };
  return getSymptomPageSEO(info.label, specialty.name);
}

export default function SymptomPage({ params }: Props) {
  const info = SYMPTOM_MAP[params.symptom];
  if (!info) notFound();

  const specialty = getSpecialtyBySlug(info.specialtySlug);
  if (!specialty) notFound();

  const doctors = doctorsBySpecialty(info.specialtySlug).slice(0, 6);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
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
    </main>
  );
}
