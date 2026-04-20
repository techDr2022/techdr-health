import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SpecialtyDetailView } from "@/components/specialties/SpecialtyDetailView";
import { doctorsBySpecialty } from "@/data/doctors";
import { getSpecialtyBySlug, listSpecialtySlugs } from "@/data/specialties";
import { getSpecialtyPageSEO } from "@/lib/seo";

type Props = { params: { specialty: string } };

export function generateStaticParams() {
  return listSpecialtySlugs().map((specialty) => ({ specialty }));
}

export function generateMetadata({ params }: Props): Metadata {
  const s = getSpecialtyBySlug(params.specialty);
  if (!s) return { title: "Specialty doctors" };
  const doctorCount = doctorsBySpecialty(params.specialty).length;
  return getSpecialtyPageSEO(s.name, doctorCount);
}

export default function SpecialtyDoctorsAliasPage({ params }: Props) {
  if (!getSpecialtyBySlug(params.specialty)) notFound();
  return <SpecialtyDetailView slug={params.specialty} />;
}
