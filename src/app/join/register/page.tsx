import type { Metadata } from "next";
import { RegisterFlow } from "@/components/join/RegisterFlow";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Doctor Registration",
  description:
    "Register as an individual doctor, clinic, or hospital. Upload documents, complete payment, and get verified in 48 hours.",
};

export default function JoinRegisterPage({
  searchParams,
}: {
  searchParams?: { plan?: string };
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50/50 to-white pt-20">
        <RegisterFlow initialPlanId={searchParams?.plan} />
      </main>
      <Footer />
    </>
  );
}
