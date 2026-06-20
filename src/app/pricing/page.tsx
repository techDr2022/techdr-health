import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  HealthPassFeatureList,
  HealthPassSubscribeButton,
} from "@/components/patient/HealthPassSubscribe";
import { HEALTH_PASS_PLANS } from "@/lib/patient-health-pass";
import { generateSEO } from "@/lib/seo";

export const metadata: Metadata = generateSEO({
  title: "Health Pass Pricing — Patient Subscription Plans",
  description:
    "Subscribe to TechDr Health Pass for discounted video consultations, priority booking, and AI health tools. Basic ₹199/mo or Premium ₹499/mo.",
  path: "/pricing",
  keywords: ["health pass", "patient subscription telehealth", "online doctor subscription India"],
});

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="bg-gradient-to-b from-white via-emerald-50/40 to-white pt-20">
        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              TechDr Health Pass
            </p>
            <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight text-[#15362a] sm:text-5xl">
              Affordable care, every month
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
              Save on consultations with an active Health Pass. Discounts apply automatically when you book.
              No Health Pass? You can still pay per consultation.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <PlanCard plan="BASIC" />
            <PlanCard plan="PREMIUM" highlighted />
          </div>

          <div className="mt-10 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Feature</th>
                  <th className="px-4 py-3">Basic</th>
                  <th className="px-4 py-3">Premium</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <CompareRow label="Monthly price" basic="₹199" premium="₹499" />
                <CompareRow label="Consultation discount" basic="10%" premium="20%" />
                <CompareRow label="Video consults" basic="2 / month" premium="Unlimited" />
                <CompareRow label="Priority queue" basic="—" premium="✓" />
                <CompareRow label="Lab report AI" basic="✓" premium="✓" />
                <CompareRow label="Chat guidance" basic="✓" premium="✓" />
              </tbody>
            </table>
          </div>

          <p className="mt-8 text-center text-xs text-slate-500">
            Already subscribed?{" "}
            <Link href="/dashboard/patient" className="font-semibold text-emerald-700 hover:underline">
              View your dashboard
            </Link>
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}

function PlanCard({
  plan,
  highlighted,
}: {
  plan: "BASIC" | "PREMIUM";
  highlighted?: boolean;
}) {
  const config = HEALTH_PASS_PLANS[plan];
  return (
    <div
      className={`rounded-2xl border p-6 shadow-sm ${
        highlighted ? "border-emerald-300 bg-emerald-50/60 ring-1 ring-emerald-200" : "border-slate-200 bg-white"
      }`}
    >
      {highlighted ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">Best value</p>
      ) : null}
      <h2 className="text-xl font-semibold text-slate-900">{config.name}</h2>
      <p className="mt-1 text-sm text-slate-600">{config.tagline}</p>
      <p className="mt-4 text-3xl font-bold text-slate-900">
        ₹{config.priceINR}
        <span className="text-base font-normal text-slate-500">/month</span>
      </p>
      <HealthPassFeatureList plan={plan} />
      <div className="mt-6">
        <HealthPassSubscribeButton plan={plan} highlighted={highlighted} />
      </div>
    </div>
  );
}

function CompareRow({
  label,
  basic,
  premium,
}: {
  label: string;
  basic: string;
  premium: string;
}) {
  return (
    <tr className="border-b last:border-0">
      <td className="px-4 py-3 font-medium text-slate-900">{label}</td>
      <td className="px-4 py-3">{basic}</td>
      <td className="px-4 py-3">{premium}</td>
    </tr>
  );
}
