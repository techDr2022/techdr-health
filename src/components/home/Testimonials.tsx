import { JsonLd } from "@/components/seo/JsonLd";
import { RatingStars } from "@/components/ui/RatingStars";
import { TESTIMONIALS } from "@/data/testimonials";
import { SITE_NAME, getSiteUrl } from "@/lib/site-config";

export function Testimonials() {
  const base = getSiteUrl();
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
      ratingValue: "4.9",
      reviewCount: "12000",
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
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          Real outcomes from teleconsultations-shared to illustrate typical
          experiences, not as guaranteed results.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <blockquote
              key={t.name + t.quote.slice(0, 12)}
              className="rounded-2xl border border-border bg-white p-6 shadow-sm"
            >
              <RatingStars value={t.rating} />
              <p className="mt-4 text-sm leading-relaxed text-foreground">
                “{t.quote}”
              </p>
              <footer className="mt-4 text-xs font-semibold text-[#0A1628]">
                {t.name}
                <span className="block font-normal text-muted-foreground">
                  {t.role}
                </span>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
