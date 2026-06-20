import type { Metadata } from "next";
import { SymptomChecker } from "@/components/ai/SymptomChecker";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { BottomCta } from "@/components/home/BottomCta";
import { FeaturedDoctors } from "@/components/home/FeaturedDoctors";
import { HealthBlogPreview } from "@/components/home/HealthBlogPreview";
import { Hero } from "@/components/home/Hero";
import { HomeFaq } from "@/components/home/HomeFaq";
import { HowItWorks } from "@/components/home/HowItWorks";
import { SpecialtyGrid } from "@/components/home/SpecialtyGrid";
import { Testimonials } from "@/components/home/Testimonials";
import { WhyChoose } from "@/components/home/WhyChoose";
import { JsonLd } from "@/components/seo/JsonLd";
import { HOME_FAQ } from "@/data/faq-home";
import { getCachedLiveDoctorCatalog } from "@/lib/doctor-catalog";
import { getHomepageSEO } from "@/lib/seo";
import {
  getFAQSchema,
  getSpeakableFAQSchema,
} from "@/lib/schema";

export const metadata: Metadata = getHomepageSEO();

export const revalidate = 300;

export default async function HomePage() {
  const doctors = await getCachedLiveDoctorCatalog();

  return (
    <>
      <JsonLd
        data={[
          getFAQSchema(HOME_FAQ),
          getSpeakableFAQSchema(HOME_FAQ),
        ]}
      />
      <Navbar />
      <main className="bg-gradient-to-b from-white via-emerald-50/30 to-white pt-16">
        <Hero />
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <SymptomChecker />
        </section>
        <HowItWorks />
        <SpecialtyGrid />
        <FeaturedDoctors doctors={doctors} />
        <WhyChoose />
        <Testimonials />
        <HealthBlogPreview />
        <HomeFaq />
        <BottomCta />
      </main>
      <Footer />
    </>
  );
}
