import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { getSafeImageSrc } from "@/lib/image";
import { getLiveDoctorCatalog } from "@/lib/doctor-catalog";
import { generateSEO } from "@/lib/seo";

export const metadata: Metadata = generateSEO({
  title: "About Us - Global Teleconsultation Platform",
  description:
    "TechDrHealth connects patients worldwide with 1000+ verified specialists for secure video teleconsultation. Privacy-first workflows, transparent fees, and 15+ country coverage.",
  path: "/about",
  keywords: [
    "about telehealth",
    "global telemedicine company",
    "online doctor platform",
  ],
});

export default async function AboutPage() {
  const doctors = await getLiveDoctorCatalog();
  const featured = doctors.slice(0, 3);

  return (
    <>
      <Navbar />
      <main className="bg-gradient-to-b from-white via-emerald-50/40 to-white pt-20">
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <div>
          <p className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            Patient-first telehealth · Worldwide
          </p>
          <h1 className="mt-4 font-heading text-4xl font-semibold text-[#0A1628] sm:text-5xl">
            Making specialist care accessible globally
          </h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            TechDrHealth is a worldwide teleconsultation platform headquartered in
            Hyderabad, India. We connect patients in 15+ countries with verified
            specialists via secure HD video — no travel, no long waitlists.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/consult">Book Consultation</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/teleconsultation">Global Coverage</Link>
            </Button>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-emerald-100 shadow-lg">
          <Image
            src="/images/placeholders/care-hero.svg"
            alt="Doctor video consultation"
            fill
            className="object-cover"
            sizes="(max-width:1024px) 100vw, 50vw"
            priority
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            ["1000+ Doctors", "Verified specialists across 20+ medical specialties worldwide."],
            ["15+ Countries", "Patients served across India, US, UK, UAE, and more."],
            ["Secure & Private", "HIPAA-style privacy with encrypted video consultations."],
          ].map(([title, desc]) => (
            <Card key={title} className="border-emerald-100">
              <CardContent className="p-6">
                <p className="font-heading text-xl font-semibold text-[#0A1628]">{title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
            Featured specialists
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {featured.map((doc) => (
              <Link
                key={doc.slug}
                href={`/doctors/profile/${doc.slug}`}
                className="rounded-xl border border-emerald-100 bg-white p-4 hover:shadow-md"
              >
                <div className="relative h-32 w-full overflow-hidden rounded-lg">
                  <Image
                    src={getSafeImageSrc(doc.photoUrl, "/placeholder-doctor.png")}
                    alt={doc.name}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                </div>
                <p className="mt-3 font-semibold text-[#0A1628]">{doc.name}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {doc.specialtySlug.replace(/-/g, " ")}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
      </main>
      <Footer />
    </>
  );
}
