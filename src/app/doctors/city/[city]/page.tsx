import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { DOCTORS } from "@/data/doctors";
import { CITY_TARGETS, CITY_UNIQUE_COPY } from "@/data/seo-targets";
import { getCityPageSEO } from "@/lib/seo";
import { getFAQSchema } from "@/lib/schema";

type Props = { params: { city: string } };

function cityFromSlug(slug: string): (typeof CITY_TARGETS)[number] | null {
  const city = CITY_TARGETS.find((c) => c.toLowerCase() === slug.toLowerCase());
  return city ?? null;
}

function cityDoctorCount(city: string): number {
  return Math.max(12, Math.min(65, city.length * 4 + 10));
}

export function generateStaticParams() {
  return CITY_TARGETS.map((city) => ({ city: city.toLowerCase() }));
}

export function generateMetadata({ params }: Props): Metadata {
  const city = cityFromSlug(params.city);
  if (!city) return { title: "City doctors" };
  const cityName = city[0].toUpperCase() + city.slice(1);
  return getCityPageSEO(cityName, cityDoctorCount(city));
}

export default function CityDoctorsPage({ params }: Props) {
  const city = cityFromSlug(params.city);
  if (!city) notFound();

  const featured = DOCTORS.slice(0, 6);
  const doctorCount = cityDoctorCount(city);
  const cityName = city[0].toUpperCase() + city.slice(1);
  const cityFAQs = [
    {
      question: `How do I book an online doctor consultation in ${cityName}?`,
      answer: `Choose your symptom or speciality, select an available doctor, and join your video consultation from home in ${cityName}.`,
    },
    {
      question: `Are online prescriptions valid in ${cityName}?`,
      answer:
        "Yes. Doctors provide digital prescriptions when medically appropriate, aligned with Indian telemedicine guidelines.",
    },
    {
      question: `What is the consultation fee for online doctors in ${cityName}?`,
      answer:
        "Consultation fees start from ₹200 and vary by speciality and doctor experience. Final fees are visible before payment.",
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd data={getFAQSchema(cityFAQs)} />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Doctors", href: "/doctors" },
          { label: cityName },
        ]}
      />

      <h1 className="mt-6 font-heading text-4xl font-semibold text-[#0A1628] sm:text-5xl">
        Online Doctor Consultation {cityName} - {doctorCount}+ Verified Doctors
      </h1>
      <p className="mt-4 max-w-3xl text-muted-foreground">
        Consult doctor online in {cityName} through secure video calls. Get expert
        medical advice across major specialities without travel and receive
        digital prescriptions after consultation.
      </p>
      {CITY_UNIQUE_COPY[city] ? (
        <p className="mt-3 max-w-4xl text-muted-foreground">
          {CITY_UNIQUE_COPY[city]}
        </p>
      ) : null}

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
          Popular Doctors Available for {cityName}
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {featured.map((doctor) => (
            <li key={doctor.slug} className="rounded-xl border p-4">
              <h3 className="font-semibold">{doctor.name}</h3>
              <p className="text-sm text-muted-foreground">
                {doctor.credentials} • ₹{doctor.consultFee}
              </p>
              <Link
                className="mt-2 inline-block text-sm text-primary hover:underline"
                href={`/doctors/profile/${doctor.slug}`}
              >
                Book online consultation
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
          Frequently Asked Questions for {cityName}
        </h2>
        <div className="mt-4 space-y-3">
          {cityFAQs.map((faq) => (
            <article key={faq.question} className="rounded-xl border p-4">
              <h3 className="font-semibold">{faq.question}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
          Explore By Speciality
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/doctors/cardiology"
            className="rounded-full bg-primary/10 px-4 py-2 text-sm text-primary"
          >
            Online Cardiologist Consultation
          </Link>
          <Link
            href="/doctors/dermatology"
            className="rounded-full bg-primary/10 px-4 py-2 text-sm text-primary"
          >
            Dermatologist Online Consultation
          </Link>
          <Link
            href="/doctors/pediatrics"
            className="rounded-full bg-primary/10 px-4 py-2 text-sm text-primary"
          >
            Online Pediatrician India
          </Link>
          <Link
            href="/doctors/gynecology"
            className="rounded-full bg-primary/10 px-4 py-2 text-sm text-primary"
          >
            Gynecologist Online Consultation
          </Link>
          <Link
            href="/doctors/psychiatry"
            className="rounded-full bg-primary/10 px-4 py-2 text-sm text-primary"
          >
            Online Psychiatrist India
          </Link>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
          Consult by Common Symptoms
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/symptoms/fever"
            className="rounded-full bg-primary/10 px-4 py-2 text-sm text-primary"
          >
            Doctor for Fever Online
          </Link>
          <Link
            href="/symptoms/skin-rash"
            className="rounded-full bg-primary/10 px-4 py-2 text-sm text-primary"
          >
            Online Doctor for Skin Problem
          </Link>
          <Link
            href="/symptoms/back-pain"
            className="rounded-full bg-primary/10 px-4 py-2 text-sm text-primary"
          >
            Doctor for Back Pain Online
          </Link>
          <Link
            href="/symptoms/anxiety"
            className="rounded-full bg-primary/10 px-4 py-2 text-sm text-primary"
          >
            Online Doctor for Anxiety
          </Link>
          <Link
            href="/symptoms/diabetes"
            className="rounded-full bg-primary/10 px-4 py-2 text-sm text-primary"
          >
            Doctor for Diabetes Online
          </Link>
        </div>
      </section>
    </main>
  );
}
