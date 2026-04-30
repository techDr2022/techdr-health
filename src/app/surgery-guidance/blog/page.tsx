import type { Metadata } from "next";
import { BlogListClient } from "../components/BlogListClient";
import { getAllPosts } from "@/lib/posts";
import { getSiteUrl } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  return {
    title: "Surgery & Health Blog | Free Patient Guidance Hyderabad",
    description: "Read expert guides on surgery costs, NABH hospitals, second opinions, and medical tourism in Hyderabad.",
    alternates: { canonical: `${siteUrl}/surgery-guidance/blog` },
  };
}

export default function SurgeryBlogPage() {
  const posts = getAllPosts();

  return (
    <main>
      <header className="px-6 py-16 md:px-[5%]">
        <h1 className="font-display text-4xl text-[#0b1f3a]">Surgery guidance blog</h1>
      </header>
      <BlogListClient posts={posts} />
    </main>
  );
}
