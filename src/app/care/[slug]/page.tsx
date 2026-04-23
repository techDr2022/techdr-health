import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSeoKeywordPage, SEO_KEYWORD_PAGES } from "@/data/seo-keywords";
import { generateSEO } from "@/lib/seo";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return SEO_KEYWORD_PAGES.map((item) => ({ slug: item.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const page = getSeoKeywordPage(params.slug);
  if (!page) return { title: "Teleconsultation Care" };

  return generateSEO({
    title: page.title,
    description: page.description,
    path: `/care/${page.slug}`,
    keywords: [page.keyword, "consult doctor online", "teleconsultation India"],
  });
}

export default function CareKeywordPage({ params }: Props) {
  const page = getSeoKeywordPage(params.slug);
  if (!page) notFound();

  const relatedPages = SEO_KEYWORD_PAGES.filter((item) => item.slug !== page.slug).slice(0, 6);
  const faqItems = [
    {
      question: `How does ${page.keyword} work on TechDrHealth?`,
      answer:
        "Choose a doctor by specialty, review consultation fee and slots, complete booking, and join your secure video consultation.",
    },
    {
      question: "Can I receive a digital prescription after online consultation?",
      answer:
        "Yes. If your doctor determines treatment is appropriate, you receive a digital prescription aligned with telemedicine practice standards.",
    },
    {
      question: "Is online consultation suitable for emergencies?",
      answer:
        "No. For severe symptoms like chest pain, breathing distress, stroke signs, or major trauma, use immediate emergency care services.",
    },
  ];
  const platformHighlights = [
    {
      title: "Verified specialists across major departments",
      description:
        "Choose from credential-verified doctors in general medicine and key specialties for first consults and follow-up care.",
    },
    {
      title: "Fast booking and predictable patient journey",
      description:
        "Patients can compare doctor profiles, view consultation fees, pick an available slot, and complete secure booking quickly.",
    },
    {
      title: "Secure virtual consultation workflow",
      description:
        "Video consultations, records, and prescriptions follow privacy-first design so care remains accessible and compliant.",
    },
  ];
  const careFlow = [
    {
      heading: "Share symptoms and consultation preference",
      body:
        "Start by selecting your doctor, preferred time, and a short concern summary so the care team can match the right specialist.",
    },
    {
      heading: "Complete online consultation and review guidance",
      body:
        "Join your scheduled video consultation, discuss symptoms in detail, and receive clear treatment or investigation recommendations.",
    },
    {
      heading: "Continue with follow-up and digital support",
      body:
        "If needed, plan a follow-up consultation and continue care through digital records and streamlined communication.",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="bg-gradient-to-b from-white via-emerald-50/30 to-white pt-20">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: page.title,
            description: page.description,
            url: `https://techdrhealth.com/care/${page.slug}`,
            inLanguage: "en-IN",
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }}
        />

        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="font-heading text-3xl font-semibold text-[#0A1628] sm:text-4xl">
            {page.title}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-700">{page.description}</p>
          <p className="mt-4 text-base leading-7 text-slate-700">
            TechDrHealth helps patients compare specialists, schedule fast video
            appointments, and continue care through follow-up visits without
            avoidable clinic travel. This page is optimized for users looking
            for {page.keyword} and related online healthcare options.
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            <Link
              href="/consult"
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Book Consultation
            </Link>
            <Link
              href="/doctors"
              className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-200"
            >
              Browse Doctors
            </Link>
            <Link
              href="/specialties"
              className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-200"
            >
              View Specialties
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 pb-12 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
            Why patients choose {page.keyword}
          </h2>
          <div className="mt-4 grid gap-3">
            {platformHighlights.map((item) => (
              <article key={item.title} className="rounded-xl border bg-white p-4">
                <h3 className="font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 pb-12 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
            How online consultation works
          </h2>
          <div className="mt-4 grid gap-3">
            {careFlow.map((step, index) => (
              <article key={step.heading} className="rounded-xl border bg-white p-4">
                <h3 className="font-semibold text-slate-900">
                  Step {index + 1}: {step.heading}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 pb-12 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
            Frequently Asked Questions
          </h2>
          <div className="mt-4 space-y-3">
            {faqItems.map((faq) => (
              <article key={faq.question} className="rounded-xl border bg-white p-4">
                <h3 className="font-semibold text-slate-900">{faq.question}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 pb-14 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">Related teleconsultation topics</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {relatedPages.map((item) => (
              <article key={item.slug} className="rounded-xl border bg-white p-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  <Link href={`/care/${item.slug}`} className="hover:text-emerald-700">
                    {item.title}
                  </Link>
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
