import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

export type SurgeryPostMeta = {
  title: string;
  slug: string;
  date: string;
  author: string;
  authorTitle: string;
  category: string;
  tags: string[];
  excerpt: string;
  coverImage: string;
  readTime: string;
  featured: boolean;
  metaTitle: string;
  metaDescription: string;
};

export type SurgeryPost = SurgeryPostMeta & { content: string };

const postsDir = path.join(process.cwd(), "src/app/surgery-guidance/_content/posts");

function readPost(fileName: string): SurgeryPost {
  const raw = fs.readFileSync(path.join(postsDir, fileName), "utf-8");
  const parsed = matter(raw);
  const data = parsed.data as SurgeryPostMeta;

  return {
    ...data,
    readTime: data.readTime || `${Math.ceil(readingTime(parsed.content).minutes)} min read`,
    content: parsed.content,
  };
}

export function getAllPosts(): SurgeryPostMeta[] {
  return fs
    .readdirSync(postsDir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => readPost(file))
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .map(({ content: _content, ...meta }) => meta);
}

export function getPostBySlug(slug: string): SurgeryPost | null {
  const file = fs.readdirSync(postsDir).find((entry) => entry.endsWith(".mdx") && entry.includes(slug));
  if (!file) return null;
  return readPost(file);
}

export function getPostsByCategory(category: string): SurgeryPostMeta[] {
  return getAllPosts().filter((post) => post.category === category);
}

export function getFeaturedPosts(): SurgeryPostMeta[] {
  return getAllPosts().filter((post) => post.featured);
}

export function getRelatedPosts(slug: string, category: string, limit: number): SurgeryPostMeta[] {
  return getAllPosts().filter((post) => post.slug !== slug && post.category === category).slice(0, limit);
}
