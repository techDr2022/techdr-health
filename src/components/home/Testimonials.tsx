import { JsonLd } from "@/components/seo/JsonLd";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { TESTIMONIALS } from "@/data/testimonials";
import { SITE_NAME, getSiteUrl } from "@/lib/site-config";

export function Testimonials() {
  const base = getSiteUrl();
  const averageRating =
    TESTIMONIALS.reduce((sum, review) => sum + review.rating, 0) /
    TESTIMONIALS.length;
  const reviewsLd = TESTIMONIALS.map((t) => ({
    "@type": "Review",
    author: { "@type": "Person", name: t.name },
    reviewRating: {
      "@type": "Rating",
      ratingValue: String(t.rating),
      bestRating: "5",
    },
    reviewBody: t.quote,
  }));

  const ld = {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    name: SITE_NAME,
    url: base,
    review: reviewsLd,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: averageRating.toFixed(1),
      reviewCount: String(TESTIMONIALS.length),
      bestRating: "5",
    },
  };

  return (
    <section className="bg-[#F8FAFC] py-16 border-y border-border">
      <JsonLd data={ld} id="jsonld-testimonials-org" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-heading text-3xl font-semibold text-[#0A1628] sm:text-4xl">
          Patient stories
        </h2>
        <p className="mt-2 text-center text-sm font-medium text-[#0A1628]">
          30 verified reviews
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          Real outcomes from teleconsultations-shared to illustrate typical
          experiences, not as guaranteed results.
        </p>
        <TestimonialsCarousel testimonials={TESTIMONIALS} />
      </div>
    </section>
  );
}
