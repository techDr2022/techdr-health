import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Terms & Conditions | ${SITE_NAME}`,
  description: `Read the ${SITE_NAME} terms and conditions for using our website, teleconsultation platform, and related services.`,
};

export default function TermsAndConditionsPage() {
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
            Terms &amp; Conditions
          </h1>
          <p className="mt-3 text-sm text-slate-500">Last updated: {updatedOn}</p>
          <p className="mt-6 text-base leading-relaxed text-slate-700">
            These Terms and Conditions govern your use of {SITE_NAME}. By using our platform, you agree to these
            terms. If you do not agree, please do not use the website or services.
          </p>

          <div className="mt-10 space-y-8 text-slate-700">
            <section>
              <h2 className="font-display text-xl font-semibold text-slate-900">1. Platform Scope</h2>
              <p className="mt-3 text-sm leading-relaxed">
                {SITE_NAME} enables patients to discover doctors, book consultations, and communicate using supported
                digital channels. The platform is not a replacement for emergency medical care.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-slate-900">2. Eligibility and Accounts</h2>
              <p className="mt-3 text-sm leading-relaxed">
                You agree to provide accurate information while creating or using an account. You are responsible for
                account confidentiality and all activity conducted through your account.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-slate-900">3. Medical Disclaimer</h2>
              <p className="mt-3 text-sm leading-relaxed">
                Consultation outcomes depend on the information provided by the patient and medical judgment of the
                practitioner. For emergencies, immediately contact local emergency services or visit the nearest
                hospital.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-slate-900">4. Payments and Cancellations</h2>
              <p className="mt-3 text-sm leading-relaxed">
                Consultation and service fees are displayed on the platform where applicable. Refunds and cancellations
                are subject to service-specific policies communicated at booking time.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-slate-900">5. User Conduct</h2>
              <p className="mt-3 text-sm leading-relaxed">
                You agree not to misuse the platform, impersonate others, upload harmful content, attempt unauthorized
                access, or violate applicable laws while using the service.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-slate-900">6. Intellectual Property</h2>
              <p className="mt-3 text-sm leading-relaxed">
                All platform content, branding, design, and software are owned by {SITE_NAME} or licensed partners and
                protected by applicable intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-slate-900">7. Limitation of Liability</h2>
              <p className="mt-3 text-sm leading-relaxed">
                To the maximum extent permitted by law, {SITE_NAME} is not liable for indirect, incidental, or
                consequential damages resulting from platform use, service interruptions, or third-party dependencies.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-slate-900">8. Changes to Terms</h2>
              <p className="mt-3 text-sm leading-relaxed">
                We may update these Terms and Conditions periodically. Continued use after updates indicates acceptance
                of the revised terms.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-slate-900">9. Contact</h2>
              <p className="mt-3 text-sm leading-relaxed">
                If you have questions about these terms, email{" "}
                <a className="text-emerald-700 hover:underline" href="mailto:techdrtelehealth@gmail.com">
                  techdrtelehealth@gmail.com
                </a>{" "}
                or use our <Link className="text-emerald-700 hover:underline" href="/contact">Contact page</Link>.
              </p>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
