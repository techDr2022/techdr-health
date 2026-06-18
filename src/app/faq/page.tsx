import type { Metadata } from "next";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { JsonLd } from "@/components/seo/JsonLd";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { HOME_FAQ } from "@/data/faq-home";
import { generateSEO } from "@/lib/seo";
import { getSpeakableFAQSchema } from "@/lib/schema";
import Link from "next/link";

const extra = [
  {
    q: "Can I consult a doctor online from outside India?",
    a: "Yes. TechDrHealth serves patients in 15+ countries including the US, UK, UAE, Canada, Australia, Singapore, and more. Book a video consultation from anywhere with internet access.",
  },
  {
    q: "How does TechDrHealth compare to hospital OPD?",
    a: "We complement—not replace—in-person care. Ideal for follow-ups, second opinions, and timely access worldwide; physical exams and emergencies still belong in clinics or ERs.",
  },
  {
    q: "Do you store my medical records?",
    a: "Visit summaries are retained per healthcare record policies and your consent matrix. Download or request deletion where regulations allow.",
  },
];

export const metadata: Metadata = generateSEO({
  title: "FAQ - Worldwide Teleconsultation Questions Answered",
  description:
    "Answers about global teleconsultation coverage, prescriptions, privacy, languages, international patients, and clinical limits on TechDrHealth.",
  path: "/faq",
  keywords: [
    "teleconsultation FAQ",
    "online doctor questions",
    "global telehealth FAQ",
  ],
});

export default function FaqPage() {
  const all = [...HOME_FAQ.map((f) => ({ q: f.question, a: f.answer })), ...extra];

  const faqItems = all.map((f) => ({ question: f.q, answer: f.a }));

  return (
    <>
      <Navbar />
      <main className="bg-gradient-to-b from-white via-emerald-50/30 to-white pt-20">
        <JsonLd
          data={[
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqItems.map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: { "@type": "Answer", text: f.answer },
              })),
            },
            getSpeakableFAQSchema(faqItems),
          ]}
        />
        <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <h1 className="font-heading text-4xl font-semibold text-[#0A1628] sm:text-5xl">
              Frequently asked questions
            </h1>
            <p className="mt-4 text-muted-foreground">
              Still stuck?{" "}
              <Link href="/contact" className="font-medium text-emerald-700 hover:underline">
                Contact care navigation
              </Link>
              .
            </p>
          </div>
          <div className="relative h-52 overflow-hidden rounded-2xl border border-emerald-100 shadow-sm sm:h-60">
            <Image
              src="/images/placeholders/care-hero.svg"
              alt="Doctor explaining patient queries"
              fill
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 50vw"
            />
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
          <Accordion type="single" collapsible className="rounded-2xl border border-emerald-100 bg-white px-5 shadow-sm">
            {all.map((item, i) => (
              <AccordionItem key={item.q} value={`faq-${i}`}>
                <AccordionTrigger className="faq-question text-left font-medium text-[#0A1628]">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="faq-answer text-muted-foreground leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>
      <Footer />
    </>
  );
}
