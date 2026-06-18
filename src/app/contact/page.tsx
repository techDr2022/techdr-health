import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ContactForm, ContactHeroImage } from "@/components/contact/ContactForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateSEO } from "@/lib/seo";
import { getBreadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = generateSEO({
  title: "Contact Us - Worldwide Teleconsultation Support",
  description:
    "Contact TechDrHealth for patient support, doctor partnerships, hospital integrations, and medical tourism assistance. Serving patients in 15+ countries worldwide.",
  path: "/contact",
  keywords: [
    "contact telehealth",
    "medical tourism support",
    "teleconsultation help",
    "global healthcare contact",
  ],
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={[
          getBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
        ]}
      />
      <Navbar />
      <main className="bg-gradient-to-b from-white via-emerald-50/30 to-white pt-20">
        <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <h1 className="font-heading text-4xl font-semibold text-[#0A1628] sm:text-5xl">
              Contact our care team
            </h1>
            <p className="mt-4 text-muted-foreground">
              Partnerships, hospital integrations, medical tourism, or patient
              support — reach our global care team and we will respond quickly.
            </p>
            <div className="mt-6 space-y-2 text-sm text-slate-600">
              <p>Email: techdrtelehealth@gmail.com</p>
              <p>Phone: +91-90322-92171</p>
              <p>Hyderabad, Telangana, India — serving patients worldwide</p>
            </div>
          </div>
          <ContactHeroImage />
        </section>

        <section className="mx-auto max-w-xl px-4 pb-16 sm:px-6 lg:px-8">
          <ContactForm />
        </section>
      </main>
      <Footer />
    </>
  );
}
