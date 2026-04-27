import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug, getRelatedPosts } from "@/lib/posts";
import { Callout, CostTable, DoctorCard } from "../../components/mdx-components";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://techdrhealth.com";
  const post = getPostBySlug(params.slug);
  if (!post) return {};

  return {
    title: post.metaTitle,
    description: post.metaDescription,
    alternates: { canonical: `${siteUrl}/surgery-guidance/blog/${post.slug}` },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      url: `${siteUrl}/surgery-guidance/blog/${post.slug}`,
      type: "article",
      images: [{ url: `${siteUrl}${post.coverImage}` }],
      publishedTime: post.date,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle,
      description: post.metaDescription,
      images: [`${siteUrl}${post.coverImage}`],
    },
  };
}

export default function SurgeryPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const related = getRelatedPosts(post.slug, post.category, 3);
  const headings = post.content
    .split("\n")
    .filter((line) => line.startsWith("##") || line.startsWith("###"))
    .map((line) => line.replace(/^###?\s+/, ""));
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://techdrhealth.com";

  return (
    <main>
      <div className="sticky top-16 z-20 h-1 w-full bg-[#d7dce3]">
        <div className="h-1 w-1/3 bg-[#0d7a6e]" />
      </div>
      <nav className="px-6 py-4 text-sm md:px-[5%]" aria-label="Breadcrumb">
        <Link href="/">Home</Link> &gt; <Link href="/surgery-guidance">Surgery Guidance</Link> &gt; <Link href="/surgery-guidance/blog">Blog</Link> &gt; {post.title}
      </nav>

      <article className="mx-auto grid max-w-7xl gap-10 px-6 py-8 lg:grid-cols-[1fr_280px] md:px-[5%]">
        <div>
          <header>
            <h1 className="font-display text-4xl text-[#0b1f3a]">{post.title}</h1>
            <p className="mt-2 text-sm text-[#556577]">{post.author} • <time dateTime={post.date}>{post.date}</time> • {post.readTime}</p>
          </header>

          <section className="my-6 rounded-xl border border-gray-200 bg-[#faf7f2] p-4">
            <h2 className="font-semibold">Get Free Surgery Guidance</h2>
            <p className="text-sm text-[#556577]">Talk to our care coordinators to compare treatment options.</p>
          </section>

          <div className="prose max-w-none prose-headings:font-display">
            <MDXRemote source={post.content} components={{ Callout, CostTable, DoctorCard }} />
          </div>

          <section className="my-8 rounded-xl border border-gray-200 bg-[#faf7f2] p-4">
            <h2 className="font-semibold">Get Free Surgery Guidance</h2>
            <p className="text-sm text-[#556577]">Need help selecting hospitals or surgeons? Contact us today.</p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-[#0b1f3a]">Related posts</h2>
            <ul className="mt-4 space-y-2">
              {related.map((item) => (
                <li key={item.slug}><Link href={`/surgery-guidance/blog/${item.slug}`} className="text-[#0d7a6e]">{item.title}</Link></li>
              ))}
            </ul>
          </section>

          <footer className="mt-8 rounded-xl border border-gray-200 p-4">
            <h2 className="font-semibold">About the author</h2>
            <p className="text-sm text-[#556577]">{post.author} — {post.authorTitle}</p>
            <div className="mt-3 flex gap-3 text-sm">
              <a href={`https://wa.me/?text=${encodeURIComponent(`${siteUrl}/surgery-guidance/blog/${post.slug}`)}`} aria-label="Share on WhatsApp">WhatsApp</a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${siteUrl}/surgery-guidance/blog/${post.slug}`)}`} aria-label="Share on Facebook">Facebook</a>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${siteUrl}/surgery-guidance/blog/${post.slug}`)}`} aria-label="Share on X">X</a>
            </div>
          </footer>
        </div>

        <aside className="sticky top-24 hidden h-fit rounded-xl border border-gray-200 bg-white p-4 lg:block">
          <h2 className="font-semibold text-[#0b1f3a]">Table of contents</h2>
          <ul className="mt-3 space-y-2 text-sm text-[#556577]">
            {headings.map((heading) => (
              <li key={heading}>{heading}</li>
            ))}
          </ul>
        </aside>
      </article>

      <Script id={`article-ld-${post.slug}`} strategy="lazyOnload" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: post.title, datePublished: post.date, author: { "@type": "Person", name: post.author }, image: `${siteUrl}${post.coverImage}`, description: post.metaDescription }) }} />
    </main>
  );
}
