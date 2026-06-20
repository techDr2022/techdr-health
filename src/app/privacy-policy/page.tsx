import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { generateSEO } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = generateSEO({
  title: "Privacy Policy - Global Telehealth Data Protection",
  description:
    "Read the TechDrHealth privacy policy for how we collect, use, and protect your personal and health-related information across our worldwide teleconsultation platform.",
  path: "/privacy-policy",
  keywords: ["telehealth privacy", "health data protection", "GDPR telemedicine"],
});

export default function PrivacyPolicyPage() {
  const updatedOn = "30 April 2026";

  return (
    <>
      <Navbar />
      <main className="bg-gradient-to-b from-white via-emerald-50/30 to-white pt-20">
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            Legal
          </p>
          <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight text-[#15362a] sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-slate-500">Last updated: {updatedOn}</p>
          <p className="mt-6 text-base leading-relaxed text-slate-700">
            {SITE_NAME} is committed to protecting your privacy. This Privacy Policy explains what information we
            collect, how we use it, and how we keep it secure when you use our website and teleconsultation services.
          </p>

          <div className="mt-10 space-y-8 text-slate-700">
            <section>
              <h2 className="font-display text-xl font-semibold text-slate-900">1. Information We Collect</h2>
              <p className="mt-3 text-sm leading-relaxed">
                We may collect personal details such as name, mobile number, email address, age, gender, and location.
                For consultations, we may also collect health information you submit, including symptoms, reports,
                prescriptions, and consultation history.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-slate-900">2. How We Use Your Information</h2>
              <p className="mt-3 text-sm leading-relaxed">
                We use your information to provide teleconsultation services, schedule appointments, verify accounts,
                share consultation updates, process payments, and improve our platform quality and safety.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-slate-900">3. Data Sharing</h2>
              <p className="mt-3 text-sm leading-relaxed">
                We share information only when necessary to deliver services, including with doctors, payment partners,
                communication providers, and technology vendors. We do not sell your personal information.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-slate-900">4. Data Security</h2>
              <p className="mt-3 text-sm leading-relaxed">
                We use reasonable technical and organizational safeguards to protect your data from unauthorized access,
                misuse, or disclosure. While no method is completely risk-free, we continuously improve our security
                controls.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-slate-900">5. Data Retention</h2>
              <p className="mt-3 text-sm leading-relaxed">
                We retain your information only as long as needed for service delivery, legal compliance, dispute
                resolution, and operational requirements.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-slate-900">6. Your Choices and Rights (DPDPA)</h2>
              <p className="mt-3 text-sm leading-relaxed">
                Under the Digital Personal Data Protection Act, 2023, you may access, correct, or request deletion of
                your personal data. Registered patients can manage consent and submit deletion requests from{" "}
                <Link className="text-emerald-700 hover:underline" href="/dashboard/patient/settings">
                  Privacy &amp; Data settings
                </Link>
                . For grievances, see our{" "}
                <Link className="text-emerald-700 hover:underline" href="/grievance">
                  Grievance Redressal
                </Link>{" "}
                page. Telemedicine consent is captured at booking time.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-slate-900">7. Cookies and Analytics</h2>
              <p className="mt-3 text-sm leading-relaxed">
                We may use cookies and analytics tools to understand platform usage, improve performance, and enhance
                user experience. You can control cookies through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-slate-900">8. Changes to This Policy</h2>
              <p className="mt-3 text-sm leading-relaxed">
                We may update this Privacy Policy from time to time. Updated versions will be posted on this page with
                a revised effective date.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-slate-900">9. Contact Us</h2>
              <p className="mt-3 text-sm leading-relaxed">
                For privacy-related questions, please email us at{" "}
                <a className="text-emerald-700 hover:underline" href="mailto:techdrtelehealth@gmail.com">
                  techdrtelehealth@gmail.com
                </a>{" "}
                or visit our <Link className="text-emerald-700 hover:underline" href="/contact">Contact page</Link>.
              </p>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
