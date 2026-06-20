import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { generateSEO } from "@/lib/seo";
import { SECOND_OPINION_SURCHARGE_PERCENT } from "@/lib/second-opinion";

export const metadata: Metadata = generateSEO({
  title: "Get a Second Medical Opinion Online in India",
  description:
    "Book a verified specialist for an online second opinion on TechDrHealth. Share prior prescriptions and health records securely with your new doctor.",
  path: "/second-opinion",
  keywords: [
    "get second medical opinion online India",
    "online second opinion doctor",
    "second opinion teleconsultation",
    "specialist second opinion India",
  ],
});

const faq = [
  {
    question: "How does an online second opinion work on TechDrHealth?",
    answer:
      "After a completed consultation, choose a different specialist, book a second-opinion visit, share your prior records, and join a secure video consult.",
  },
  {
    question: "Can I share my previous prescription and lab reports?",
    answer:
      "Yes. You can share health vault files and prior clinical notes with the new doctor before the consultation starts.",
  },
  {
    question: "Is there an extra fee for second opinion bookings?",
    answer: `Second opinion consultations include a ${SECOND_OPINION_SURCHARGE_PERCENT}% platform surcharge to support extended record review.`,
  },
];

export default function SecondOpinionPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalService",
    name: "Online Second Medical Opinion",
    provider: { "@type": "Organization", name: "TechDrHealth" },
    areaServed: "IN",
    description:
      "Secure teleconsultation second opinions with verified Indian specialists, including prior record sharing.",
    url: "https://techdrhealth.com/second-opinion",
  };

  return (
    <>
      <Navbar />
      <JsonLd data={faqSchema} />
      <JsonLd data={serviceSchema} />
      <main className="min-h-screen bg-gradient-to-b from-violet-50/40 via-white to-slate-50 pt-20">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-violet-700">Second opinion</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold text-slate-900 sm:text-4xl">
            Get a second medical opinion online in India
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Already consulted a doctor on TechDrHealth? Book another verified specialist to review your
            diagnosis, treatment plan, or surgery recommendation — with your prior records shared securely.
          </p>

          <ol className="mt-8 space-y-4 rounded-2xl border border-violet-100 bg-white p-6 text-sm text-slate-700">
            <li>
              <span className="font-semibold text-slate-900">1. Complete your first consult</span> — finish
              your initial video visit and receive a prescription if applicable.
            </li>
            <li>
              <span className="font-semibold text-slate-900">2. Choose a new specialist</span> — pick a
              different doctor in the same or another specialty.
            </li>
            <li>
              <span className="font-semibold text-slate-900">3. Share prior records</span> — consent to
              share health vault files and SOAP summaries with the reviewing doctor.
            </li>
            <li>
              <span className="font-semibold text-slate-900">4. Join the review consult</span> — your new
              doctor sees original records in the consultation room.
            </li>
          </ol>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-violet-700 hover:bg-violet-600">
              <Link href="/dashboard/patient">Go to my consultations</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/book">Find a specialist</Link>
            </Button>
          </div>

          <section className="mt-12">
            <h2 className="text-xl font-semibold text-slate-900">Frequently asked questions</h2>
            <dl className="mt-4 space-y-4">
              {faq.map((item) => (
                <div key={item.question} className="rounded-xl border border-slate-200 bg-white p-4">
                  <dt className="font-semibold text-slate-900">{item.question}</dt>
                  <dd className="mt-2 text-sm text-slate-600">{item.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
