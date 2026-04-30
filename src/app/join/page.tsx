import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PricingCards } from "@/components/join/PricingCards";
import { PlatformFeeTransparency } from "@/components/join/PlatformFeeTransparency";
import { EarningsCalculator } from "@/components/join/EarningsCalculator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/JsonLd";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { JOIN_FAQ } from "@/data/join-faq";
import { JOIN_TESTIMONIALS } from "@/data/join-testimonials";
import { getLiveDoctorCatalog } from "@/lib/doctor-catalog";
import { getSafeImageSrc } from "@/lib/image";
import { SITE_NAME, getSiteUrl } from "@/lib/site-config";

const WHY_JOIN = [
  {
    icon: "🏥",
    title: "More Patients",
    description: "Reach patients across India, not just your city.",
  },
  {
    icon: "💰",
    title: "Secure Earnings",
    description: "Get paid directly after every completed consultation.",
  },
  {
    icon: "📱",
    title: "Easy to Use",
    description: "No technical setup. Start consulting within 48 hours.",
  },
] as const;

const HOW_IT_WORKS = [
  "Choose Your Plan",
  "Claim Free Slot (first 500) or Complete Payment",
  "Complete Registration + Document Upload",
  "Get Verified (within 48 hours)",
] as const;

export const metadata: Metadata = {
  title: "Join as Doctor | Subscription Plans",
  description:
    "Join India's teleconsultation platform as a doctor, clinic, or hospital. Transparent pricing, 25% platform fee, and secure Cashfree payouts.",
  keywords: [
    "join teleconsultation platform",
    "register as online doctor",
    "list your clinic online",
  ],
  alternates: { canonical: `${getSiteUrl()}/join` },
};

export default async function JoinPage() {
  const siteUrl = getSiteUrl();
  const doctors = await getLiveDoctorCatalog();
  const heroPhotos = [
    {
      src: "/online-medical-consultation-with-doctor-via-video-call-laptop.webp",
      alt: "Online medical consultation with doctor via video call on laptop",
      key: "hero-photo-1",
    },
    {
      src: "/woman-using-laptop-having-video-call-with-her-doctor-while-sitting-home.webp",
      alt: "Woman having a video call with her doctor while sitting at home",
      key: "hero-photo-2",
    },
    {
      src: "/elderly-people-making-video-call.webp",
      alt: "Elderly people making a healthcare video call",
      key: "hero-photo-3",
    },
  ] as const;
  const doctorBySpecialty = new Map(
    doctors.map((doctor) => [doctor.specialtySlug.toLowerCase(), doctor.photoUrl])
  );

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: JOIN_FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <>
      <Navbar />
      <JsonLd data={faqSchema} id="join-faq-schema" />

      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-16 pt-28 text-slate-50 sm:py-24 sm:pt-32">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <Badge className="bg-teal-500 text-white">Doctor Growth Program</Badge>
            <p className="mt-3 inline-flex rounded-full border border-emerald-300/40 bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-100">
              First 500 listings get free annual subscription
            </p>
            <h1 className="mt-5 max-w-4xl font-heading text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Grow Your Practice Online - Join India&apos;s Fastest-Growing
              Teleconsultation Platform
            </h1>
            <p className="mt-5 max-w-3xl text-lg text-slate-300">
              1000+ doctors are already earning more by consulting patients online.
              Join them on {SITE_NAME}.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-teal-500 hover:bg-teal-600">
                <Link href="#pricing">See Plans & Pricing</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-slate-950">
                <Link href="/join/register">Register Now</Link>
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {["50,000+ Patients", "1000+ Verified Doctors", "4.9★ Rating", "INR Secure Payouts"].map((metric) => (
                <div key={metric} className="rounded-lg bg-white/10 p-3 text-center ring-1 ring-white/10">
                  {metric}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative col-span-2 h-64 overflow-hidden rounded-2xl border border-white/20 shadow-lg">
              <Image
                src={heroPhotos[0].src}
                alt={heroPhotos[0].alt}
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 50vw"
              />
            </div>
            <div className="relative h-36 overflow-hidden rounded-2xl border border-white/20 shadow-lg">
              <Image
                src={heroPhotos[1].src}
                alt={heroPhotos[1].alt}
                fill
                className="object-cover"
                sizes="(max-width:1024px) 50vw, 25vw"
              />
            </div>
            <div className="relative h-36 overflow-hidden rounded-2xl border border-white/20 shadow-lg">
              <Image
                src={heroPhotos[2].src}
                alt={heroPhotos[2].alt}
                fill
                className="object-cover"
                sizes="(max-width:1024px) 50vw, 25vw"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Why Join Us
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {WHY_JOIN.map((item) => (
              <Card key={item.title}>
                <CardContent className="space-y-2 p-6">
                  <p className="text-2xl">{item.icon}</p>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            How It Works
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {HOW_IT_WORKS.map((step, idx) => (
              <div key={step} className="rounded-xl border bg-white p-5">
                <p className="text-sm font-medium text-teal-700">Step {idx + 1}</p>
                <p className="mt-2 text-sm">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Plans Built for Every Practice Size
            </h2>
            <p className="mt-3 text-muted-foreground">
              Annual plans for solo doctors, clinics, and hospitals with secure
              onboarding. First 500 listings are free for one year.
            </p>
          </div>
          <PricingCards />
        </div>
      </section>

      <PlatformFeeTransparency />
      <EarningsCalculator />

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          {JOIN_TESTIMONIALS.map((item) => (
            <Card key={item.name}>
              <CardContent className="space-y-3 p-6">
                <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-emerald-100">
                  <Image
                    src={getSafeImageSrc(
                      doctorBySpecialty.get(item.specialty.toLowerCase()),
                      "/images/placeholders/doctor-avatar.svg"
                    )}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.specialty}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="mt-8 rounded-xl border px-4">
            {JOIN_FAQ.map((item, idx) => (
              <AccordionItem key={item.q} value={`faq-${idx}`}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="bg-slate-900 py-16 text-slate-50 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-semibold sm:text-4xl">
            Ready to Start?
          </h2>
          <p className="mt-3 text-slate-300">
            Register now and complete your verification in 24-48 hours.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-teal-500 hover:bg-teal-600">
              <Link href="/join/register">Register Now - Free Setup</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-slate-950">
              <Link href={siteUrl}>Return to Home</Link>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
