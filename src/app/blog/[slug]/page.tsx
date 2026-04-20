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
import { getMergedPostBySlug, getMergedPublishedPosts } from "@/lib/blog-posts";
import { getBlogPostSEO } from "@/lib/seo";
import { getArticleSchema } from "@/lib/schema";
import { getSiteUrl } from "@/lib/site-config";

type Props = { params: { slug: string } };

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
  });
}

export default async function BlogArticlePage({ params }: Props) {
  const post = await getMergedPostBySlug(params.slug);
  if (!post) notFound();

  const base = getSiteUrl();

  const articleLd = getArticleSchema({
    title: post.title,
    excerpt: post.excerpt,
    slug: post.slug,
    publishedAt: post.publishedAt,
    authorName: post.author.name,
    imageUrl: post.coverImage,
  });

  const related = (await getMergedPublishedPosts())
    .filter((candidate) => candidate.slug !== post.slug)
    .slice(0, 3);

  return (
    <article className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd data={articleLd} />
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
          src={post.coverImage}
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
    </article>
  );
}
