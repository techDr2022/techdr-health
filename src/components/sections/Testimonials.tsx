"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Priya Nair",
    location: "Bengaluru",
    rating: 5,
    quote:
      "The doctor joined in less than 8 minutes. The consultation was clear, reassuring, and I got my prescription instantly.",
  },
  {
    name: "Aman Gupta",
    location: "Delhi",
    rating: 5,
    quote: "Booking was smooth and the specialist was excellent. This is now my go-to platform for online consultations.",
  },
  {
    name: "Sneha Iyer",
    location: "Chennai",
    rating: 5,
    quote:
      "Loved the experience from search to call. The UI is simple, and follow-up support made everything stress-free.",
  },
];

const reviewSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: TESTIMONIALS.map((review, index) => ({
    "@type": "Review",
    position: index + 1,
    reviewBody: review.quote,
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
    },
    author: {
      "@type": "Person",
      name: review.name,
    },
  })),
};

export function Testimonials() {
  return (
    <section className="bg-slate-50 py-24">
      <script id="review-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }} />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 max-w-2xl"
        >
          <span className="mb-3 inline-flex items-center gap-2 font-body text-[11px] font-[700] uppercase tracking-[.1em] text-blue-600">
            <span className="block h-0.5 w-4 rounded bg-blue-500" />
            Testimonials
          </span>
          <h2 className="font-display text-[clamp(28px,4vw,42px)] font-[800] leading-tight tracking-tight text-slate-900">
            Patients Love the TechDrHealth Experience
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((item, i) => (
            <motion.article
              key={item.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="rounded-2xl border-[1.5px] border-slate-200 bg-white p-6 transition-all duration-300 hover:border-blue-300"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-display text-[15px] font-[700] text-blue-700">
                    {item.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-body text-[14px] font-[700] text-slate-900">{item.name}</p>
                    <p className="font-body text-[12px] text-slate-400">{item.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 text-amber-500">
                  {Array.from({ length: item.rating }).map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-current stroke-none" />
                  ))}
                </div>
              </div>

              <blockquote className="font-body text-[14px] italic leading-relaxed text-slate-600">&quot;{item.quote}&quot;</blockquote>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
