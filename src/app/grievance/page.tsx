import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { generateSEO } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = generateSEO({
  title: "Grievance Redressal - Data Protection & Complaints",
  description:
    "Contact TechDrHealth for grievance redressal regarding data protection, telemedicine services, privacy concerns, and DPDPA-related requests.",
  path: "/grievance",
  keywords: ["DPDPA grievance", "telehealth complaint", "data protection grievance India"],
});

export default function GrievancePage() {
  const updatedOn = "20 June 2026";

  return (
    <>
      <Navbar />
      <main className="bg-gradient-to-b from-white via-emerald-50/30 to-white pt-20">
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            Legal
          </p>
          <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight text-[#15362a] sm:text-5xl">
            Grievance Redressal
          </h1>
          <p className="mt-3 text-sm text-slate-500">Last updated: {updatedOn}</p>
          <p className="mt-6 text-base leading-relaxed text-slate-700">
            {SITE_NAME} is committed to addressing your concerns regarding personal data, privacy, and telemedicine
            services in accordance with the Digital Personal Data Protection Act, 2023 and applicable regulations.
          </p>

          <div className="mt-10 space-y-8 text-slate-700">
            <section>
              <h2 className="font-display text-xl font-semibold text-slate-900">Grievance Officer</h2>
              <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm leading-relaxed">
                <p>
                  <strong>Name:</strong> Data Protection Officer
                </p>
                <p className="mt-1">
                  <strong>Email:</strong>{" "}
                  <a href="mailto:techdrtelehealth@gmail.com" className="font-semibold text-emerald-700 hover:underline">
                    techdrtelehealth@gmail.com
                  </a>
                </p>
                <p className="mt-1">
                  <strong>Phone:</strong> 90322 92171
                </p>
                <p className="mt-1">
                  <strong>Address:</strong> 1st floor, Sri Lalitha Devi Nilayam, 16-11-16, N/118, West Prasanth Nagar,
                  Malakpet Extension, New Malakpet, Hyderabad, Telangana 500036
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-slate-900">How to File a Grievance</h2>
              <p className="mt-3 text-sm leading-relaxed">
                Send an email to the Grievance Officer with your full name, registered email/phone, a description of
                your concern, and any supporting details. We will acknowledge receipt within 7 days and aim to resolve
                grievances within 30 days.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-slate-900">Data Deletion Requests</h2>
              <p className="mt-3 text-sm leading-relaxed">
                Registered patients can submit a data deletion request from{" "}
                <Link href="/dashboard/patient/settings" className="font-semibold text-emerald-700 hover:underline">
                  Privacy &amp; Data settings
                </Link>
                . We will process valid requests within 30 days, subject to legal retention requirements for medical
                and financial records.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-slate-900">Related Policies</h2>
              <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-relaxed">
                <li>
                  <Link href="/privacy-policy" className="font-semibold text-emerald-700 hover:underline">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/telemedicine-consent" className="font-semibold text-emerald-700 hover:underline">
                    Telemedicine Consent
                  </Link>
                </li>
                <li>
                  <Link href="/terms-and-conditions" className="font-semibold text-emerald-700 hover:underline">
                    Terms &amp; Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="font-semibold text-emerald-700 hover:underline">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
