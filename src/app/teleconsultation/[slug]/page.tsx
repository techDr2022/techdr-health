import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getGlobalRegion,
  GLOBAL_REGIONS,
  listGlobalRegionSlugs,
} from "@/data/global-regions";
import { getRegionPageSEO } from "@/lib/seo";
import {
  getBreadcrumbSchema,
  getFAQSchema,
  getRegionPageSchema,
  getSpeakableFAQSchema,
} from "@/lib/schema";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return listGlobalRegionSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const region = getGlobalRegion(slug);
  if (!region) return { title: "Global Teleconsultation" };
  return getRegionPageSEO(region);
}

export default async function RegionTeleconsultationPage({ params }: Props) {
  const { slug } = await params;
  const region = getGlobalRegion(slug);
  if (!region) notFound();

  const otherRegions = GLOBAL_REGIONS.filter((r) => r.slug !== region.slug).slice(
    0,
    6,
  );

  return (
    <>
      <JsonLd
        data={[
          getRegionPageSchema(region),
          getBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Global Teleconsultation", path: "/teleconsultation" },
            { name: region.name, path: `/teleconsultation/${region.slug}` },
          ]),
          getFAQSchema(region.faqs),
          getSpeakableFAQSchema(region.faqs),
        ]}
      />
      <Navbar />
      <main className="bg-gradient-to-b from-white via-emerald-50/30 to-white pt-20">
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <nav className="text-sm text-muted-foreground">
            <Link href="/teleconsultation" className="hover:text-emerald-700">
              Global Teleconsultation
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[#0A1628]">{region.name}</span>
          </nav>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            <span>{region.flag}</span> {region.name}
          </p>
          <h1 className="mt-4 max-w-3xl font-heading text-4xl font-semibold text-[#0A1628] sm:text-5xl">
            Online Doctor Consultation {region.name}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {region.intro}
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-600">
            <span className="rounded-full border border-emerald-200 bg-white px-3 py-1">
              Timezone: {region.timezone}
            </span>
            <span className="rounded-full border border-emerald-200 bg-white px-3 py-1">
              Currency: {region.currency}
            </span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/book"
              className="inline-flex h-11 items-center rounded-full bg-emerald-600 px-6 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Book Consultation
            </Link>
            <Link
              href="/doctors"
              className="inline-flex h-11 items-center rounded-full border border-emerald-200 px-6 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
            >
              Browse Doctors
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
            Why patients in {region.name} choose TechDrHealth
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {region.highlights.map((highlight) => (
              <li
                key={highlight}
                className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-white p-4 text-sm"
              >
                <span className="mt-0.5 text-emerald-600">✓</span>
                {highlight}
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-12 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
            FAQ — Teleconsultation in {region.name}
          </h2>
          <div className="mt-6 space-y-4">
            {region.faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-xl border border-emerald-100 bg-white p-5"
              >
                <h3 className="faq-question font-semibold text-[#0A1628]">
                  {faq.question}
                </h3>
                <p className="faq-answer mt-2 text-sm text-muted-foreground">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <h2 className="font-heading text-xl font-semibold text-[#0A1628]">
            Teleconsultation in other regions
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {otherRegions.map((r) => (
              <Link
                key={r.slug}
                href={`/teleconsultation/${r.slug}`}
                className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm hover:bg-emerald-50"
              >
                {r.flag} {r.name}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
