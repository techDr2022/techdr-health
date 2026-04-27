import Image from "next/image";
import Link from "next/link";
import type { SurgeryPostMeta } from "@/lib/posts";

interface BlogCardProps {
  post: SurgeryPostMeta;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white shadow-sm transition-transform hover:-translate-y-1">
      <Image src={post.coverImage} alt={post.title} width={600} height={340} className="h-48 w-full rounded-t-xl object-cover" loading="lazy" />
      <div className="p-5">
        <p className="text-xs font-semibold text-[#0d7a6e]">{post.category}</p>
        <h3 className="mt-2 text-xl font-semibold text-[#1a2a3a]">{post.title}</h3>
        <p className="mt-2 text-sm text-[#556577]">{post.excerpt}</p>
        <p className="mt-3 text-xs text-[#556577]">{post.author} • <time dateTime={post.date}>{post.date}</time> • {post.readTime}</p>
        <Link href={`/surgery-guidance/blog/${post.slug}`} className="mt-4 inline-block font-semibold text-[#0b1f3a]" aria-label={`Read more: ${post.title}`}>
          Read More →
        </Link>
      </div>
    </article>
  );
}
