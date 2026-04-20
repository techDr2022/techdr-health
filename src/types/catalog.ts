export type EducationEntry = {
  degree: string;
  institution: string;
  year: number;
};

export type ReviewEntry = {
  rating: number;
  comment: string;
  patientName: string;
  createdAt: string;
};

export type AvailabilityEntry = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export type DoctorRecord = {
  slug: string;
  name: string;
  credentials: string;
  specialtySlug: string;
  subSpecialties: string[];
  experience: number;
  bio: string;
  photoUrl: string;
  languages: string[];
  consultFee: number;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  conditions: string[];
  education: EducationEntry[];
  hospitalAffils: string[];
  reviews: ReviewEntry[];
  availabilities: AvailabilityEntry[];
};

export type SpecialtyFaq = { question: string; answer: string };

export type SpecialtyRecord = {
  slug: string;
  name: string;
  shortIntro: string;
  description: string;
  iconKey: string;
  conditions: string[];
  faq: SpecialtyFaq[];
  relatedSlugs: string[];
};

export type BlogAuthorRef = {
  name: string;
  slug?: string;
  role: string;
};

export type BlogPostRecord = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  specialtySlug?: string;
  author: BlogAuthorRef;
  publishedAt: string;
  readingMinutes: number;
  coverImage: string;
  body: string;
};

export type TestimonialRecord = {
  name: string;
  role: string;
  rating: number;
  quote: string;
};
