import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SpecialtyReviewsView } from "@/components/specialties/SpecialtyReviewsView";
import { getSpecialtyBySlug, listSpecialtySlugs } from "@/data/specialties";
import { getLiveDoctorCatalog } from "@/lib/doctor-catalog";
import { getSpecialtyReviewsSEO } from "@/lib/seo";

const FILTERS = ["5-star", "4-plus", "3-plus"] as const;
type ReviewFilter = (typeof FILTERS)[number];

type Props = {
  params: { specialty: string; filter: string };
};

function minRating(filter: ReviewFilter) {
  if (filter === "5-star") return 5;
  if (filter === "4-plus") return 4;
  return 3;
}

export function generateStaticParams() {
  return listSpecialtySlugs().flatMap((specialty) =>
    FILTERS.map((filter) => ({ specialty, filter }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const specialty = getSpecialtyBySlug(params.specialty);
  if (!specialty) return { title: "Reviews" };
  if (!FILTERS.includes(params.filter as ReviewFilter)) return { title: "Reviews" };

  const threshold = minRating(params.filter as ReviewFilter);
  const allDoctors = await getLiveDoctorCatalog();
  const reviews = allDoctors
    .filter((doctor) => doctor.specialtySlug === params.specialty)
    .flatMap((doctor) => doctor.reviews)
    .filter((review) => review.rating >= threshold);
  const avgRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : undefined;

  return getSpecialtyReviewsSEO(
    `${specialty.name} ${params.filter.replace("-", " ")}`,
    reviews.length,
    avgRating
  );
}

export default function SpecialtyReviewsFilterPage({ params }: Props) {
  if (!getSpecialtyBySlug(params.specialty)) notFound();
  if (!FILTERS.includes(params.filter as ReviewFilter)) notFound();

  return (
    <>
      <Navbar />
      <main className="pt-20">
        <SpecialtyReviewsView slug={params.specialty} filter={params.filter as "5-star" | "4-plus" | "3-plus"} />
      </main>
      <Footer />
    </>
  );
}
