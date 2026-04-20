import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { SPECIALTIES } from "@/data/specialties";
import { getMergedPublishedPosts } from "@/lib/blog-posts";
import { SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Health Blog — Telemedicine Guides | ${SITE_NAME}`,
  description:
    "Long-form guides on teleconsultation safety, specialty care, diabetes, kidney health, and consulting doctors online in India.",
};

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const allPosts = await getMergedPublishedPosts();
  const cat = searchParams.category;
  const posts = cat
    ? allPosts.filter((p) => p.specialtySlug === cat || p.category === cat)
    : allPosts;

  return (
    <>
      <Navbar />
      <main className="bg-gradient-to-b from-white via-emerald-50/30 to-white pt-20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-semibold text-[#0A1628]">
            techDr Tele Health blog
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Evidence-backed guides, patient education, and specialist insights.
          </p>

          <div className="mt-10 flex flex-wrap gap-2">
            <Link
              href="/blog"
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                !cat ? "bg-emerald-600 text-white" : "bg-muted"
              }`}
            >
              All
            </Link>
            {SPECIALTIES.slice(0, 12).map((s) => (
              <Link
                key={s.slug}
                href={`/blog?category=${s.slug}`}
                className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                  cat === s.slug
                    ? "bg-emerald-600 text-white"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {s.name}
              </Link>
            ))}
          </div>

          <div className="mt-12 grid gap-10 md:grid-cols-2">
            {posts.map((p) => (
              <article key={p.slug} className="flex flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
                <Link href={`/blog/${p.slug}`} className="relative aspect-[16/10] bg-muted">
                  <Image src={p.coverImage} alt="" fill className="object-cover" />
                </Link>
                <div className="flex flex-1 flex-col p-6">
                  <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    {p.category}
                  </span>
                  <h2 className="mt-2 font-heading text-xl font-semibold">
                    <Link href={`/blog/${p.slug}`} className="hover:underline">
                      {p.title}
                    </Link>
                  </h2>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-3">
                    {p.excerpt}
                  </p>
                  <p className="mt-4 text-xs text-muted-foreground">
                    {p.readingMinutes} min · {p.author.name}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
