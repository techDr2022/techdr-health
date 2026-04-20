import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DOCTORS } from "@/data/doctors";
import { getCityPageSEO } from "@/lib/seo";

const CITIES = [
  "Hyderabad",
  "Mumbai",
  "Bangalore",
  "Delhi",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Chandigarh",
  "Kochi",
  "Coimbatore",
  "Nagpur",
  "Vizag",
];

type Props = { params: { city: string } };

function cityFromSlug(slug: string): string | null {
  const city = CITIES.find((c) => c.toLowerCase() === slug.toLowerCase());
  return city ?? null;
}

function cityDoctorCount(city: string): number {
  return Math.max(12, Math.min(65, city.length * 4 + 10));
}

export function generateStaticParams() {
  return CITIES.map((city) => ({ city: city.toLowerCase() }));
}

export function generateMetadata({ params }: Props): Metadata {
  const city = cityFromSlug(params.city);
  if (!city) return { title: "City doctors" };
  return getCityPageSEO(city, cityDoctorCount(city));
}

export default function CityDoctorsPage({ params }: Props) {
  const city = cityFromSlug(params.city);
  if (!city) notFound();

  const featured = DOCTORS.slice(0, 6);
  const doctorCount = cityDoctorCount(city);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Doctors", href: "/doctors" },
          { label: city },
        ]}
      />

      <h1 className="mt-6 font-heading text-4xl font-semibold text-[#0A1628] sm:text-5xl">
        Online Doctor Consultation {city} - {doctorCount}+ Verified Doctors
      </h1>
      <p className="mt-4 max-w-3xl text-muted-foreground">
        Consult doctor online in {city} through secure video calls. Get expert
        medical advice across major specialities without travel and receive
        digital prescriptions after consultation.
      </p>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
          Popular Doctors Available for {city}
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
    </main>
  );
}
