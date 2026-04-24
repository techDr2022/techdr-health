import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  MarkdownArticle,
  TableOfContents,
} from "@/components/blog/MarkdownArticle";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { SPECIALTIES } from "@/data/specialties";
import { getMergedPostBySlug, getMergedPublishedPosts } from "@/lib/blog-posts";
import { getSafeImageSrc } from "@/lib/image";
import { getBlogPostSEO } from "@/lib/seo";
import { getArticleSchema, getBreadcrumbSchema, getFAQSchema } from "@/lib/schema";
import { getSiteUrl } from "@/lib/site-config";

type Props = { params: { slug: string } };

function parseFaqFromBody(body: string) {
  const lines = body.split("\n").map((line) => line.trim());
  const faqs: { question: string; answer: string }[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(/^- \*\*FAQ \d+:\*\*\s*(.+)$/);
    if (!match) continue;

    const question = match[1].trim();
    let answer = "";
    for (let j = i + 1; j < lines.length; j += 1) {
      const next = lines[j];
      if (!next) continue;
      if (next.startsWith("- **FAQ ")) break;
      if (next.startsWith("Use ")) break;
      answer = next;
      i = j;
      break;
    }

    if (question && answer) faqs.push({ question, answer });
  }

  return faqs;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getMergedPostBySlug(params.slug);
  if (!post) return { title: "Article" };
  return getBlogPostSEO({
    title: post.title,
    excerpt: post.excerpt.slice(0, 160),
    slug: post.slug,
    publishedAt: post.publishedAt,
    author: post.author.name,
    category: post.category,
    specialtySlug: post.specialtySlug,
  });
}

export default async function BlogArticlePage({ params }: Props) {
  const post = await getMergedPostBySlug(params.slug);
  if (!post) notFound();

  const base = getSiteUrl();
  const faqData = parseFaqFromBody(post.body);

  const articleLd = getArticleSchema({
    title: post.title,
    excerpt: post.excerpt,
    slug: post.slug,
    publishedAt: post.publishedAt,
    authorName: post.author.name,
    imageUrl: post.coverImage,
  });
  const breadcrumbLd = getBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);
  const faqLd = faqData.length > 0 ? getFAQSchema(faqData) : null;

  const allPosts = await getMergedPublishedPosts();
  const related = allPosts
    .filter((candidate) => candidate.slug !== post.slug)
    .sort((a, b) => {
      if (a.specialtySlug === post.specialtySlug && b.specialtySlug !== post.specialtySlug) return -1;
      if (b.specialtySlug === post.specialtySlug && a.specialtySlug !== post.specialtySlug) return 1;
      if (a.category === post.category && b.category !== post.category) return -1;
      if (b.category === post.category && a.category !== post.category) return 1;
      return 0;
    })
    .slice(0, 3);
  const specialty = post.specialtySlug
    ? SPECIALTIES.find((item) => item.slug === post.specialtySlug)
    : null;

  return (
    <article className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd data={articleLd} />
      <JsonLd data={breadcrumbLd} />
      {faqLd ? <JsonLd data={faqLd} /> : null}
      <nav className="text-sm text-muted-foreground">
        <Link href="/blog" className="hover:text-foreground">
          Blog
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{post.title}</span>
      </nav>

      <header className="mx-auto mt-8 max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#0EA5E9]">
          {post.category}
        </p>
        <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight text-[#0A1628] sm:text-5xl">
          {post.title}
        </h1>
        <p className="mt-4 text-muted-foreground">
          By{" "}
          <Link
            href={
              post.author.slug
                ? `/doctors/profile/${post.author.slug}`
                : "/doctors"
            }
            className="font-medium text-[#0EA5E9] hover:underline"
          >
            {post.author.name}
          </Link>{" "}
          · {post.readingMinutes} min read · {post.publishedAt}
        </p>
      </header>

      <div className="relative mx-auto mt-10 aspect-[21/9] max-w-4xl overflow-hidden rounded-3xl bg-muted">
        <Image
          src={getSafeImageSrc(post.coverImage, "/images/placeholders/care-hero.svg")}
          alt={`${post.title} - online doctor consultation India guide`}
          fill
          priority
          className="object-cover"
          sizes="(max-width:896px) 100vw, 896px"
        />
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-10 lg:grid-cols-[240px_1fr] lg:gap-14">
        <aside className="hidden lg:block">
          <TableOfContents markdown={post.body} />
          <div className="mt-8 space-y-3">
            <Button asChild variant="outline" className="w-full">
              <Link
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`${base}/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Share on X
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${base}/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Share on LinkedIn
              </Link>
            </Button>
          </div>
        </aside>
        <div>
          <MarkdownArticle markdown={post.body} />
        </div>
      </div>

      <section className="mx-auto mt-16 max-w-5xl border-t border-border pt-12">
        <h2 className="font-heading text-2xl font-semibold text-[#0A1628]">
          Related articles
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {related.map((r) => (
            <li key={r.slug}>
              <Link href={`/blog/${r.slug}`} className="hover:underline font-medium">
                {r.title}
              </Link>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {r.excerpt}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {specialty ? (
        <section className="mx-auto mt-10 max-w-5xl rounded-2xl border border-border bg-[#F8FAFC] p-6">
          <h2 className="font-heading text-xl font-semibold text-[#0A1628]">
            Continue with specialty care
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Explore more guidance in {specialty.name} and connect with verified specialists.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={`/doctors/${specialty.slug}`} className="text-sm font-medium text-[#0EA5E9] hover:underline">
              Consult {specialty.name} doctors
            </Link>
            <Link href={`/blog?category=${specialty.slug}`} className="text-sm font-medium text-[#0EA5E9] hover:underline">
              Read more {specialty.name} articles
            </Link>
            <Link href="/doctors" className="text-sm font-medium text-[#0EA5E9] hover:underline">
              Browse all doctors
            </Link>
          </div>
        </section>
      ) : null}
    </article>
  );
}
