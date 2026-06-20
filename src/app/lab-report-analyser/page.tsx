import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LabReportAnalyser } from "@/components/ai/LabReportAnalyser";
import { generateSEO } from "@/lib/seo";
import { auth } from "@/auth";

export const metadata: Metadata = generateSEO({
  title: "AI Lab Report Analyser",
  description:
    "Upload your lab report PDF for AI-powered analysis. Get flagged values, specialist recommendations, and book a consultation on TechDrHealth.",
  path: "/lab-report-analyser",
  keywords: ["lab report analysis", "blood test results online", "AI health report"],
});

export default async function LabReportAnalyserPage() {
  const session = await auth();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30 pt-20">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <h1 className="font-heading text-3xl font-semibold text-[#0A1628]">
            AI Lab Report Analyser
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload a PDF lab report to extract key values, flag abnormalities, and find the right
            specialist. For informational purposes only — not medical advice.
          </p>
          <p className="mt-3 text-sm">
            <Link href="/dashboard/patient/lab-tests" className="font-semibold text-emerald-700 hover:underline">
              Need new lab tests? Book a panel with our partner lab →
            </Link>
          </p>
          <div className="mt-8">
            <LabReportAnalyser patientId={session?.user?.id} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
