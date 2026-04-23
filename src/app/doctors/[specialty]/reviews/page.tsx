import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SpecialtyReviewsView } from "@/components/specialties/SpecialtyReviewsView";
import { getSpecialtyBySlug, listSpecialtySlugs } from "@/data/specialties";
import { getLiveDoctorCatalog } from "@/lib/doctor-catalog";
import { getSpecialtyReviewsSEO } from "@/lib/seo";

type Props = {
  params: { specialty: string };
};

export function generateStaticParams() {
  return listSpecialtySlugs().map((specialty) => ({ specialty }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const specialty = getSpecialtyBySlug(params.specialty);
  if (!specialty) return { title: "Reviews" };

  const allDoctors = await getLiveDoctorCatalog();
  const reviews = allDoctors
    .filter((doctor) => doctor.specialtySlug === params.specialty)
    .flatMap((doctor) => doctor.reviews);
  const avgRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : undefined;

  return getSpecialtyReviewsSEO(specialty.name, reviews.length, avgRating);
}

export default function SpecialtyReviewsPage({ params }: Props) {
  if (!getSpecialtyBySlug(params.specialty)) notFound();

  return (
    <>
      <Navbar />
      <main className="pt-20">
        <SpecialtyReviewsView slug={params.specialty} filter="all" />
      </main>
      <Footer />
    </>
  );
}
