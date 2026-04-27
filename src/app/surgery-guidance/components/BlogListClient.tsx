"use client";

import { useMemo, useState } from "react";
import type { SurgeryPostMeta } from "@/lib/posts";
import { BlogCard } from "./BlogCard";

const categories = ["All", "Surgery Guides", "Patient Tips", "Medical Tourism", "Cost & Pricing", "Hospital Reviews"];

export function BlogListClient({ posts }: { posts: SurgeryPostMeta[] }) {
  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");
  const [count, setCount] = useState(6);
  const featured = posts.find((post) => post.featured);

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      const categoryOk = active === "All" || post.category === active;
      const queryOk = !query || `${post.title} ${post.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase());
      return categoryOk && queryOk;
    });
  }, [active, query, posts]);

  return (
    <section className="px-6 py-20 md:px-[5%]">
      <div className="mx-auto max-w-7xl">
        {featured ? (
          <article className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold text-[#0d7a6e]">Featured</p>
            <h2 className="mt-2 font-display text-3xl text-[#0b1f3a]">{featured.title}</h2>
            <p className="mt-2 text-[#556577]">{featured.excerpt}</p>
          </article>
        ) : null}

        <div className="mb-4 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActive(cat)} className={`rounded-full px-4 py-2 text-sm ${active === cat ? "bg-[#0b1f3a] text-white" : "bg-white text-[#1a2a3a]"}`} aria-label={`Filter by ${cat}`}>
              {cat}
            </button>
          ))}
        </div>

        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title or tags" aria-label="Search blog posts" className="mb-6 w-full rounded-xl border border-gray-300 p-3" />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.slice(0, count).map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>

        {filtered.length > count ? (
          <button onClick={() => setCount((value) => value + 6)} className="mt-8 rounded-full bg-[#c9983a] px-8 py-3 font-bold text-[#0b1f3a]" aria-label="Load more posts">
            Load More
          </button>
        ) : null}
      </div>
    </section>
  );
}
