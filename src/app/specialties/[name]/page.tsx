import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SpecialtyDetailView } from "@/components/specialties/SpecialtyDetailView";
import { getSpecialtyBySlug, listSpecialtySlugs } from "@/data/specialties";
import { SITE_NAME } from "@/lib/site-config";
import { getSiteUrl } from "@/lib/site-config";

type Props = { params: { name: string } };

export function generateStaticParams() {
  return listSpecialtySlugs().map((name) => ({ name }));
}

export function generateMetadata({ params }: Props): Metadata {
  const s = getSpecialtyBySlug(params.name);
  if (!s) return { title: "Specialty" };
  const title = `Book Online ${s.name} Consultation | ${SITE_NAME}`;
  const description = `${s.shortIntro} Consult verified ${s.name.toLowerCase()} doctors via video teleconsultation in India-conditions treated, FAQs, and transparent fees.`;
  const base = getSiteUrl();
  return {
    title,
    description: description.slice(0, 155),
    alternates: { canonical: `${base}/specialties/${params.name}` },
    openGraph: { title, description: description.slice(0, 155), url: `${base}/specialties/${params.name}` },
  };
}

export default function SpecialtyPage({ params }: Props) {
  if (!getSpecialtyBySlug(params.name)) notFound();
  return <SpecialtyDetailView slug={params.name} />;
}
