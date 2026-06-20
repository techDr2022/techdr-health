import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SpecialtyDetailView } from "@/components/specialties/SpecialtyDetailView";
import { getSpecialtyBySlug, listSpecialtySlugs } from "@/data/specialties";
import { SITE_NAME } from "@/lib/site-config";
import { getSiteUrl } from "@/lib/site-config";

export const revalidate = 3600;

type Props = { params: Promise<{ name: string }> };

export function generateStaticParams() {
  return listSpecialtySlugs().map((name) => ({ name }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const s = getSpecialtyBySlug(name);
  if (!s) return { title: "Specialty" };
  const title = `Book Online ${s.name} Consultation | ${SITE_NAME}`;
  const description = `${s.shortIntro} Consult verified ${s.name.toLowerCase()} doctors via video teleconsultation in India-conditions treated, FAQs, and transparent fees.`;
  const base = getSiteUrl();
  return {
    title,
    description: description.slice(0, 155),
    alternates: { canonical: `${base}/specialties/${name}` },
    openGraph: { title, description: description.slice(0, 155), url: `${base}/specialties/${name}` },
  };
}

export default async function SpecialtyPage({ params }: Props) {
  const { name } = await params;
  if (!getSpecialtyBySlug(name)) notFound();
  return <SpecialtyDetailView slug={name} />;
}
