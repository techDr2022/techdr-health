import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SpecialtyDetailView } from "@/components/specialties/SpecialtyDetailView";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { getSpecialtyBySlug, listSpecialtySlugs } from "@/data/specialties";
import { getLiveDoctorCatalog } from "@/lib/doctor-catalog";
import { getSpecialtyPageSEO } from "@/lib/seo";

type Props = { params: { specialty: string } };

export function generateStaticParams() {
  return listSpecialtySlugs().map((specialty) => ({ specialty }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = getSpecialtyBySlug(params.specialty);
  if (!s) return { title: "Specialty doctors" };
  const allDoctors = await getLiveDoctorCatalog();
  const doctorCount = allDoctors.filter(
    (doctor) => doctor.specialtySlug === params.specialty
  ).length;
  return getSpecialtyPageSEO(s.name, doctorCount);
}

export default function SpecialtyDoctorsAliasPage({ params }: Props) {
  if (!getSpecialtyBySlug(params.specialty)) notFound();
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <SpecialtyDetailView slug={params.specialty} />
      </main>
      <Footer />
    </>
  );
}
