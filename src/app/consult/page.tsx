import type { Metadata } from "next";
import { ConsultForm } from "./ConsultForm";
import { SITE_NAME } from "@/lib/site-config";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: `Book Consultation | ${SITE_NAME}`,
  description:
    "Book video or audio teleconsultation with credential-verified specialists—transparent INR pricing and rapid scheduling.",
};

export default function ConsultPage() {
  return (
    <>
      <Navbar />
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
          <ConsultForm />
        </div>
      </div>
      <Footer />
    </>
  );
}
