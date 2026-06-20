import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SpecialtyReviewsView } from "@/components/specialties/SpecialtyReviewsView";
import { getSpecialtyBySlug, listSpecialtySlugs } from "@/data/specialties";
import { getLiveDoctorCatalog } from "@/lib/doctor-catalog";
import { getSpecialtyReviewsSEO } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return listSpecialtySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const specialty = getSpecialtyBySlug(slug);
  if (!specialty) return { title: "Reviews" };

  const allDoctors = await getLiveDoctorCatalog();
  const reviews = allDoctors
    .filter((doctor) => doctor.specialtySlug === slug)
    .flatMap((doctor) => doctor.reviews);
  const avgRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : undefined;

  return getSpecialtyReviewsSEO(specialty.name, reviews.length, avgRating);
}

export default async function SpecialtyReviewsPage({ params }: Props) {
  const { slug } = await params;

    if (!getSpecialtyBySlug(slug)) notFound();

  return (
    <>
      <Navbar />
      <main className="pt-20">
        <SpecialtyReviewsView slug={slug} filter="all" />
      </main>
      <Footer />
    </>
  );
}
