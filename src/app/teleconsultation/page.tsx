import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { JsonLd } from "@/components/seo/JsonLd";
import { GLOBAL_REGIONS } from "@/data/global-regions";
import { getGlobalTeleconsultationSEO } from "@/lib/seo";
import { getBreadcrumbSchema, getFAQSchema } from "@/lib/schema";

export const metadata: Metadata = getGlobalTeleconsultationSEO();

const globalFaqs = [
  {
    question: "Can I consult a doctor online from any country?",
    answer:
      "Yes. TechDrHealth serves patients worldwide via secure HD video. Book from the US, UK, UAE, Canada, Australia, Singapore, India, and 10+ more countries.",
  },
  {
    question: "What is worldwide teleconsultation?",
    answer:
      "Worldwide teleconsultation lets you consult verified specialist doctors via secure video from anywhere. No travel needed—get diagnosis, treatment plans, and digital prescriptions online.",
  },
  {
    question: "Are online consultations safe and private?",
    answer:
      "Yes. All consultations use encrypted HD video with HIPAA-style privacy practices. Your medical records are stored securely and only shared with your consent.",
  },
  {
    question: "What languages are supported?",
    answer:
      "Doctors offer consultations in English, Hindi, Arabic, Tamil, Telugu, and other regional languages. Filter by language when booking.",
  },
];

export default function TeleconsultationIndexPage() {
  return (
    <>
      <JsonLd
        data={[
          getBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Global Teleconsultation", path: "/teleconsultation" },
          ]),
          getFAQSchema(globalFaqs),
        ]}
      />
      <Navbar />
      <main className="bg-gradient-to-b from-white via-emerald-50/30 to-white pt-20">
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            Worldwide Telehealth
          </p>
          <h1 className="mt-4 max-w-3xl font-heading text-4xl font-semibold text-[#0A1628] sm:text-5xl">
            Global Teleconsultation — Online Doctors Worldwide
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Consult verified specialists via secure HD video from anywhere in the world.
            1000+ doctors across 20+ specialties serving patients in 15+ countries.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/consult"
              className="inline-flex h-11 items-center rounded-full bg-emerald-600 px-6 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Book Consultation
            </Link>
            <Link
              href="/doctors"
              className="inline-flex h-11 items-center rounded-full border border-emerald-200 px-6 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
            >
              Find Doctors
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
            Teleconsultation by Country & Region
          </h2>
          <p className="mt-2 text-muted-foreground">
            Select your region for localized information, FAQs, and booking options.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GLOBAL_REGIONS.map((region) => (
              <Link
                key={region.slug}
                href={`/teleconsultation/${region.slug}`}
                className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="text-2xl">{region.flag}</span>
                <h3 className="mt-2 font-heading text-lg font-semibold text-[#0A1628]">
                  {region.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {region.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
            Frequently Asked Questions
          </h2>
          <div className="mt-6 space-y-4">
            {globalFaqs.map((faq) => (
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
      </main>
      <Footer />
    </>
  );
}
