import type { Metadata } from "next";
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
import { getHomepageSEO } from "@/lib/seo";
import {
  getFAQSchema,
  getMedicalOrgSchema,
  getWebsiteSchema,
} from "@/lib/schema";

export const metadata: Metadata = getHomepageSEO();

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={[
          getMedicalOrgSchema(),
          getWebsiteSchema(),
          getFAQSchema(HOME_FAQ),
        ]}
      />
      <Navbar />
      <main className="bg-gradient-to-b from-white via-emerald-50/30 to-white pt-16">
        <Hero />
        <HowItWorks />
        <SpecialtyGrid />
        <FeaturedDoctors />
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
