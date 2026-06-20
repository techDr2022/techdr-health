import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SpecialtyDetailView } from "@/components/specialties/SpecialtyDetailView";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { getSpecialtyBySlug, listSpecialtySlugs } from "@/data/specialties";
import { getCachedLiveDoctorCatalog } from "@/lib/doctor-catalog";
import { getSpecialtyPageSEO } from "@/lib/seo";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return listSpecialtySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = getSpecialtyBySlug(slug);
  if (!s) return { title: "Specialty doctors" };
  const allDoctors = await getCachedLiveDoctorCatalog();
  const doctorCount = allDoctors.filter((doctor) => doctor.specialtySlug === slug).length;
  return getSpecialtyPageSEO(s.name, doctorCount);
}

export default async function SpecialtyDoctorsAliasPage({ params }: Props) {
  const { slug } = await params;
  if (!getSpecialtyBySlug(slug)) notFound();
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <SpecialtyDetailView slug={slug} />
      </main>
      <Footer />
    </>
  );
}
