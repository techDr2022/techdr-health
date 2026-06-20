import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Script from "next/script";
import { auth } from "@/auth";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { InstantConsultClient } from "@/components/instant-consult/InstantConsultClient";

export const metadata: Metadata = {
  title: "Instant Consult | TechDrHealth",
  description: "Connect with the next available verified doctor for an immediate video consultation.",
};

export default async function InstantConsultPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/instant-consult");
  }
  if (session.user.role !== "PATIENT") {
    redirect("/dashboard");
  }

  return (
    <>
      <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" strategy="afterInteractive" />
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-sky-50/60 to-white pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-600">Instant consult</p>
            <h1 className="mt-2 font-heading text-3xl font-semibold text-slate-900 sm:text-4xl">
              See a doctor in minutes
            </h1>
            <p className="mt-3 text-sm text-slate-600">
              Skip slot booking. Join the queue and get matched with an online specialist for video consultation.
            </p>
          </div>
          <InstantConsultClient />
        </div>
      </main>
      <Footer />
    </>
  );
}
