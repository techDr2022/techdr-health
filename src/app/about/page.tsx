import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { DOCTORS } from "@/data/doctors";
import { SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `About Us | ${SITE_NAME}`,
  description:
    `${SITE_NAME} connects patients with 1000+ verified specialists for teleconsultation India-wide, with privacy-first workflows and transparent fees.`,
};

export default function AboutPage() {
  const featured = DOCTORS.slice(0, 3);

  return (
    <>
      <Navbar />
      <main className="bg-gradient-to-b from-white via-emerald-50/40 to-white pt-20">
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <div>
          <p className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            Patient-first telehealth
          </p>
          <h1 className="mt-5 font-heading text-4xl font-semibold tracking-tight text-[#15362a] sm:text-5xl">
            About {SITE_NAME}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-slate-600">
            {SITE_NAME} helps patients consult verified doctors quickly, with
            secure video rooms, transparent pricing, and structured follow-up.
            We design every touchpoint to reduce anxiety and improve trust.
          </p>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            From cardiology to pediatrics, each profile includes credentials,
            languages, and experience so families can choose confidently.
            Teleconsultation does not replace emergency care; we clearly guide
            escalation whenever needed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/consult">Book consultation</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/doctors">Meet our doctors</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="relative col-span-2 h-64 overflow-hidden rounded-2xl border border-emerald-100 shadow-sm">
            <Image
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1400&q=80"
              alt="Doctor consulting a patient online"
              fill
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 50vw"
            />
          </div>
          {featured.slice(0, 2).map((doctor) => (
            <div
              key={doctor.slug}
              className="relative h-40 overflow-hidden rounded-2xl border border-emerald-100 shadow-sm"
            >
              <Image
                src={doctor.photoUrl}
                alt={doctor.name}
                fill
                className="object-cover"
                sizes="(max-width:1024px) 50vw, 25vw"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["1000+ Doctors", "Verified specialists across 20+ medical specialties."],
            ["4.9 / 5 Rating", "Patient-reported quality across consultations."],
            ["Secure by default", "Encrypted sessions with privacy-first workflows."],
          ].map(([title, copy]) => (
            <Card key={title} className="border-emerald-100">
              <CardContent className="p-6">
                <p className="text-lg font-semibold text-[#15362a]">{title}</p>
                <p className="mt-2 text-sm text-slate-600">{copy}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      </main>
      <Footer />
    </>
  );
}
