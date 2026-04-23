import type { Metadata } from "next";
import { ConsultForm } from "./ConsultForm";
import { getLiveDoctorCatalog } from "@/lib/doctor-catalog";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateSEO } from "@/lib/seo";

export const metadata: Metadata = generateSEO({
  title: "Book Video Consultation Online",
  description:
    "Book secure online doctor consultation in minutes with verified specialists, transparent fees, and quick video appointment slots across India.",
  path: "/consult",
  keywords: [
    "book online doctor consultation",
    "video consultation booking India",
    "teleconsultation appointment",
  ],
});

export default async function ConsultPage() {
  const doctors = await getLiveDoctorCatalog();
  const doctorOptions = doctors.map((doctor) => ({
    slug: doctor.slug,
    name: doctor.name,
  }));

  return (
    <>
      <Navbar />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "MedicalWebPage",
          name: "Book Video Consultation Online",
          description:
            "Book secure online doctor consultation in minutes with verified specialists, transparent fees, and quick video appointment slots across India.",
          url: "https://techdrhealth.com/consult",
          inLanguage: "en-IN",
        }}
      />
      <div className="relative overflow-hidden bg-slate-50 pt-24">
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-900" />
        <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.32),transparent_45%)]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl py-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Consultation Booking</p>
            <h1 className="mt-3 font-heading text-4xl font-semibold text-white sm:text-5xl">Book your visit in minutes</h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-200 sm:text-base">
              Choose your doctor, pick a slot, and confirm your details through a secure intake flow.
            </p>
          </div>
          <ConsultForm doctors={doctorOptions} />
        </div>
      </div>
      <Footer />
    </>
  );
}
