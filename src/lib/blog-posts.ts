import { BlogPostStatus } from "@prisma/client";
import { BLOG_POSTS } from "@/data/blog";
import { prisma } from "@/lib/prisma";

const BLOG_PUBLIC_IMAGES = [
  "/Online-Medical-Consultation-Desktop.jpg",
  "/closeup-family-talking-with-doctor-via-video-call-laptop-coronavirus-pandemic.jpg",
  "/doctor-offering-medical-teleconsultation.jpg",
  "/elderly-people-making-video-call.jpg",
  "/female-patient-attending-virtual-consultation.jpg",
  "/online-medical-consultation-with-doctor-via-video-call-laptop.jpg",
  "/sick-patient-talking-doctor-telehealth-videocall-conference-using-computer-with-webcam-medical-consultation-online-videoconference-remote-telemedicine-virtual-meeting.jpg",
  "/smiling-caucasian-female-doctor-medical-uniform-headphones-talk-video-call-computer-with-client-happy-woman-gp-earphones-have-online-webcam-digital-consultation-with-hospital-patient.jpg",
  "/woman-having-appointment-with-doctor-videocall-using-laptop-telehealth-concept-online-consultation-with-professional-medical-clinic-general-practitioner-telemedicine-service.jpg",
  "/woman-using-laptop-having-video-call-with-her-doctor-while-sitting-home.jpg",
  "/young-asia-female-doctor-white-medical-uniform-with-stethoscope-using-computer-laptop-talking-video-conference-call.jpg",
];

export type AppBlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: {
    name: string;
    slug?: string;
    role: string;
  };
  publishedAt: string;
  readingMinutes: number;
  coverImage: string;
  specialtySlug?: string;
  body: string;
};

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getRandomBlogImage(seed: string) {
  const index = hashString(seed) % BLOG_PUBLIC_IMAGES.length;
  return BLOG_PUBLIC_IMAGES[index];
}

function normalizeStatic() {
  return BLOG_POSTS.map((post) => ({
    ...post,
    coverImage: getRandomBlogImage(post.slug),
    publishedAt: post.publishedAt,
  }));
}

async function normalizeDb() {
  try {
    const tableCheck = (await prisma.$queryRawUnsafe(
      `SELECT to_regclass('public."BlogPost"')::text AS table_name`
    )) as Array<{ table_name: string | null }>;
    const blogTableExists = Boolean(tableCheck?.[0]?.table_name);
    if (!blogTableExists) return [];

    const posts = await prisma.blogPost.findMany({
      where: { status: BlogPostStatus.PUBLISHED },
      include: {
        author: {
          select: {
            name: true,
            role: true,
          },
        },
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    });

    return posts.map(
      (post): AppBlogPost => ({
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        author: {
          name: post.author.name,
          role: post.author.role,
        },
        publishedAt: (post.publishedAt ?? post.createdAt).toISOString().slice(0, 10),
        readingMinutes: post.readingMinutes,
        coverImage: getRandomBlogImage(post.slug),
        specialtySlug: post.specialtySlug ?? undefined,
        body: post.body,
      })
    );
  } catch {
    return [];
  }
}

export async function getMergedPublishedPosts(): Promise<AppBlogPost[]> {
  const [dbPosts, staticPosts] = await Promise.all([
    normalizeDb(),
    Promise.resolve(normalizeStatic()),
  ]);
  const bySlug = new Map<string, AppBlogPost>();

  for (const post of staticPosts) bySlug.set(post.slug, post);
  for (const post of dbPosts) bySlug.set(post.slug, post);

  return Array.from(bySlug.values()).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export async function getMergedPostBySlug(slug: string): Promise<AppBlogPost | null> {
  const posts = await getMergedPublishedPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

