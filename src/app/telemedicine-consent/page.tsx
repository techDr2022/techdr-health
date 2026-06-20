import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { generateSEO } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = generateSEO({
  title: "Telemedicine Consent - Informed Consent for Online Consultations",
  description:
    "Read the TechDrHealth telemedicine informed consent form covering video consultations, data processing, limitations, and patient rights under Indian telemedicine guidelines.",
  path: "/telemedicine-consent",
  keywords: ["telemedicine consent", "informed consent online doctor", "TPG 2020 consent"],
});

export default function TelemedicineConsentPage() {
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
            Telemedicine Informed Consent
          </h1>
          <p className="mt-3 text-sm text-slate-500">Last updated: {updatedOn}</p>
          <p className="mt-6 text-base leading-relaxed text-slate-700">
            By booking or participating in a consultation on {SITE_NAME}, you provide informed consent to receive
            telemedicine services in accordance with the Telemedicine Practice Guidelines, 2020 (MoHFW, India) and
            applicable data protection laws including the Digital Personal Data Protection Act, 2023.
          </p>

          <div className="mt-10 space-y-8 text-slate-700">
            <section>
              <h2 className="font-display text-xl font-semibold text-slate-900">1. Nature of Telemedicine</h2>
              <p className="mt-3 text-sm leading-relaxed">
                Telemedicine involves remote clinical assessment via video, audio, or chat. It has limitations compared
                to in-person examination. Your doctor may recommend an in-person visit if remote assessment is
                insufficient.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-slate-900">2. Emergency Exclusion</h2>
              <p className="mt-3 text-sm leading-relaxed">
                {SITE_NAME} is not for medical emergencies. If you experience chest pain, difficulty breathing,
                severe bleeding, loss of consciousness, or any life-threatening symptoms, call emergency services
                (112 in India) or visit the nearest hospital immediately.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-slate-900">3. Health Data Processing</h2>
              <p className="mt-3 text-sm leading-relaxed">
                You consent to the collection and processing of health information you provide during booking and
                consultation, including symptoms, medical history, prescriptions, and consultation records. This data
                is shared with your treating doctor and processed as described in our{" "}
                <Link href="/privacy-policy" className="font-semibold text-emerald-700 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-slate-900">4. Prescriptions &amp; Medicines</h2>
              <p className="mt-3 text-sm leading-relaxed">
                Prescriptions issued via telemedicine follow Indian regulations. Certain scheduled medicines may not
                be prescribed remotely. You are responsible for disclosing accurate medical history and current
                medications to your doctor.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-slate-900">5. Technology Requirements</h2>
              <p className="mt-3 text-sm leading-relaxed">
                You agree to use a device with a stable internet connection, functioning camera/microphone (for video
                consults), and a private setting suitable for discussing health information.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-slate-900">6. Withdrawal of Consent</h2>
              <p className="mt-3 text-sm leading-relaxed">
                You may withdraw consent for future consultations at any time by not booking further services. To
                request deletion of personal data, visit{" "}
                <Link href="/dashboard/patient/settings" className="font-semibold text-emerald-700 hover:underline">
                  Privacy &amp; Data settings
                </Link>{" "}
                or see our{" "}
                <Link href="/grievance" className="font-semibold text-emerald-700 hover:underline">
                  Grievance Redressal
                </Link>{" "}
                page.
              </p>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
