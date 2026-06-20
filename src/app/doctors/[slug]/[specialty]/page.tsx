import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { DoctorCard } from "@/components/doctors/DoctorCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { CITY_TARGETS } from "@/data/seo-targets";
import { getSpecialtyBySlug, listSpecialtySlugs } from "@/data/specialties";
import {
  buildCitySpecialtyFaqs,
  buildCitySpecialtyIntro,
  buildCitySpecialtyPath,
  formatCityName,
  isValidCitySpecialtyRoute,
  listCitySpecialtyStaticParams,
  resolveCitySlug,
} from "@/lib/city-specialty-seo";
import {
  getCachedLiveDoctorCatalog,
  getLiveDoctorCountBySpecialty,
} from "@/lib/doctor-catalog";
import { getCitySpecialtyPageSEO } from "@/lib/seo";
import {
  getBreadcrumbSchema,
  getCitySpecialtyPageSchema,
  getFAQSchema,
} from "@/lib/schema";

export const revalidate = 86400;

type Props = { params: Promise<{ slug: string; specialty: string }> };

export async function generateStaticParams() {
  const counts = await getLiveDoctorCountBySpecialty();
  return listCitySpecialtyStaticParams(counts);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, specialty } = await params;
  if (!isValidCitySpecialtyRoute(slug, specialty)) {
    return { title: "Doctors" };
  }

  const specialtyMeta = getSpecialtyBySlug(specialty)!;
  const cityName = formatCityName(slug);
  const doctors = (await getCachedLiveDoctorCatalog()).filter(
    (doctor) => doctor.specialtySlug === specialty
  );

  return getCitySpecialtyPageSEO(cityName, specialtyMeta.name, doctors.length);
}

export default async function CitySpecialtyDoctorsPage({ params }: Props) {
  const { slug, specialty: specialtySlug } = await params;
  const citySlug = resolveCitySlug(slug);
  const specialty = getSpecialtyBySlug(specialtySlug);
  if (!citySlug || !specialty) notFound();

  const cityName = formatCityName(citySlug);
  const allDoctors = await getCachedLiveDoctorCatalog();
  const doctors = allDoctors.filter((doctor) => doctor.specialtySlug === specialtySlug);
  if (doctors.length === 0) notFound();

  const intro = buildCitySpecialtyIntro(cityName, specialty.name, citySlug);
  const faqs = buildCitySpecialtyFaqs(cityName, specialty.name, doctors.length);
  const pagePath = buildCitySpecialtyPath(citySlug, specialtySlug);

  return (
    <>
      <Navbar />
      <main className="pt-20">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <JsonLd
            data={[
              getCitySpecialtyPageSchema({
                cityName,
                citySlug,
                specialtyName: specialty.name,
                specialtySlug,
                doctorCount: doctors.length,
              }),
              getBreadcrumbSchema([
                { name: "Home", path: "/" },
                { name: "Doctors", path: "/doctors" },
                { name: cityName, path: `/doctors/city/${citySlug}` },
                { name: specialty.name, path: pagePath },
              ]),
              getFAQSchema(faqs),
            ]}
          />

          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Doctors", href: "/doctors" },
              { label: cityName, href: `/doctors/city/${citySlug}` },
              { label: specialty.name },
            ]}
          />

          <h1 className="mt-6 font-heading text-4xl font-semibold text-[#0A1628] sm:text-5xl">
            Online {specialty.name} Doctor Consultation in {cityName}
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground leading-relaxed">{intro}</p>

          <section className="mt-10">
            <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
              {specialty.name} doctors available for {cityName}
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {doctors.map((doctor) => (
                <DoctorCard key={doctor.slug} doctor={doctor} />
              ))}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
              Frequently asked questions
            </h2>
            <div className="mt-4 space-y-3">
              {faqs.map((faq) => (
                <article key={faq.question} className="rounded-xl border p-4">
                  <h3 className="font-semibold">{faq.question}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{faq.answer}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
              Other specialties in {cityName}
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {listSpecialtySlugs()
                .filter((item) => item !== specialtySlug)
                .slice(0, 12)
                .map((itemSlug) => {
                  const item = getSpecialtyBySlug(itemSlug);
                  if (!item) return null;
                  return (
                    <Link
                      key={itemSlug}
                      href={buildCitySpecialtyPath(citySlug, itemSlug)}
                      className="rounded-full bg-primary/10 px-4 py-2 text-sm text-primary hover:bg-primary/15"
                    >
                      {item.name} in {cityName}
                    </Link>
                  );
                })}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
              {specialty.name} in other cities
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {CITY_TARGETS.filter((otherCity) => otherCity !== citySlug)
                .slice(0, 8)
                .map((otherCity) => (
                  <Link
                    key={otherCity}
                    href={buildCitySpecialtyPath(otherCity, specialtySlug)}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:border-primary/40"
                  >
                    {specialty.name} in {formatCityName(otherCity)}
                  </Link>
                ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
