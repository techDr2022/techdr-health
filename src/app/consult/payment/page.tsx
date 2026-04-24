import type { Metadata } from "next";
import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SITE_NAME } from "@/lib/site-config";
import { ConsultPaymentClient } from "./ConsultPaymentClient";

export const metadata: Metadata = {
  title: `Consultation Payment | ${SITE_NAME}`,
  description: "Complete your consultation booking payment using Cashfree.",
};

export default function ConsultPaymentPage() {
  return (
    <>
      <Navbar />
      <main className="bg-slate-50 pt-24">
        <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
          <Suspense fallback={<div className="py-16 text-center text-muted-foreground">Loading payment…</div>}>
            <ConsultPaymentClient />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
