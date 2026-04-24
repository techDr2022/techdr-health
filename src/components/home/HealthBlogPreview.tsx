import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getMergedPublishedPosts } from "@/lib/blog-posts";
import { getSafeImageSrc } from "@/lib/image";

export async function HealthBlogPreview() {
  const posts = (await getMergedPublishedPosts()).slice(0, 3);
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-3xl font-semibold text-[#0A1628] sm:text-4xl">
            Health blog
          </h2>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Evidence-informed articles on teleconsultation safety, specialty
            guides, and chronic care-built for Indian families.
          </p>
        </div>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#0EA5E9] hover:underline"
        >
          View all articles <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {posts.map((p) => (
          <article
            key={p.slug}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition hover:border-[#0EA5E9]/35"
          >
            <Link href={`/blog/${p.slug}`} className="relative aspect-[16/10] bg-muted">
              <Image
                src={getSafeImageSrc(p.coverImage, "/images/placeholders/care-hero.svg")}
                alt=""
                fill
                className="object-cover transition duration-500 group-hover:scale-[1.02]"
                sizes="(max-width:768px) 100vw, 33vw"
              />
            </Link>
            <div className="flex flex-1 flex-col p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#0EA5E9]">
                {p.category}
              </p>
              <h3 className="mt-2 font-heading text-lg font-semibold text-[#0A1628]">
                <Link href={`/blog/${p.slug}`} className="hover:underline">
                  {p.title}
                </Link>
              </h3>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                {p.excerpt}
              </p>
              <p className="mt-4 text-xs text-muted-foreground">
                {p.readingMinutes} min read · {p.publishedAt}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
