import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSpecialtyBySlug } from "@/data/specialties";
import { getLiveDoctorCatalog } from "@/lib/doctor-catalog";
import { getBreadcrumbSchema, getSpecialtyReviewsSchema } from "@/lib/schema";

type ReviewFilter = "all" | "5-star" | "4-plus" | "3-plus";

type Props = {
  slug: string;
  filter?: ReviewFilter;
};

function getMinRating(filter: ReviewFilter) {
  if (filter === "5-star") return 5;
  if (filter === "4-plus") return 4;
  if (filter === "3-plus") return 3;
  return 1;
}

function filterLabel(filter: ReviewFilter) {
  if (filter === "5-star") return "5 star";
  if (filter === "4-plus") return "4+ stars";
  if (filter === "3-plus") return "3+ stars";
  return "All reviews";
}

export async function SpecialtyReviewsView({ slug, filter = "all" }: Props) {
  const specialty = getSpecialtyBySlug(slug);
  if (!specialty) notFound();

  const allDoctors = await getLiveDoctorCatalog();
  const doctors = allDoctors.filter((doctor) => doctor.specialtySlug === slug);
  const allReviews = doctors
    .flatMap((doctor) =>
      doctor.reviews.map((review) => ({
        ...review,
        doctorName: doctor.name,
        doctorSlug: doctor.slug,
      }))
    )
    .filter((review) => Boolean(review.comment?.trim()))
    .sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return bTime - aTime;
    });

  const minRating = getMinRating(filter);
  const reviews = allReviews.filter((review) => review.rating >= minRating);
  const avgRating =
    allReviews.length > 0
      ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length
      : 0;

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Doctors", href: "/doctors" },
    { label: specialty.name, href: `/doctors/${slug}` },
    { label: `${specialty.name} reviews` },
  ];
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Doctors", path: "/doctors" },
    { name: specialty.name, path: `/doctors/${slug}` },
    { name: `${specialty.name} reviews`, path: `/doctors/${slug}/reviews` },
  ]);
  const reviewsSchema = getSpecialtyReviewsSchema({
    specialty: specialty.name,
    specialtySlug: slug,
    reviews,
  });

  const filterLinks: { label: string; key: ReviewFilter; href: string }[] = [
    { label: "All", key: "all", href: `/doctors/${slug}/reviews` },
    { label: "5 Star", key: "5-star", href: `/doctors/${slug}/reviews/5-star` },
    { label: "4+ Stars", key: "4-plus", href: `/doctors/${slug}/reviews/4-plus` },
    { label: "3+ Stars", key: "3-plus", href: `/doctors/${slug}/reviews/3-plus` },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd data={[breadcrumbSchema, reviewsSchema]} />
      <Breadcrumb items={breadcrumbs} />

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="font-heading text-3xl font-semibold text-[#0A1628]">
          {specialty.name} patient reviews
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Crawlable review hub for {specialty.name} consultations. Real patient feedback from within the app.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total reviews</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{allReviews.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Average rating</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {allReviews.length ? avgRating.toFixed(1) : "N/A"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Current filter</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{filterLabel(filter)}</p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex flex-wrap gap-2">
          {filterLinks.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={
                item.key === filter
                  ? "rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-white"
                  : "rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 hover:border-primary/40"
              }
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 space-y-4">
        {reviews.length ? (
          reviews.map((review, index) => (
            <article key={`${review.doctorSlug}-${review.createdAt}-${index}`} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">{review.patientName}</p>
                <p className="text-xs font-semibold text-amber-600">{review.rating.toFixed(1)} / 5</p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">{review.comment}</p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <Link
                  href={`/doctors/profile/${review.doctorSlug}`}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Reviewed doctor: {review.doctorName}
                </Link>
                <p className="text-xs text-slate-500">
                  {new Date(review.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-muted-foreground">
            No reviews available for this filter yet.
          </div>
        )}
      </section>
    </div>
  );
}
