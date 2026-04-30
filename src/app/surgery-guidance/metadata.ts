import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-config";

const siteUrl = getSiteUrl();

export const surgeryGuidanceMetadata: Metadata = {
  title: "Free Surgery Guidance in Hyderabad | NABH Hospitals & Expert Surgeons",
  description:
    "Get free surgery guidance in Hyderabad. We connect patients with NABH accredited hospitals, negotiate the best price, and give you 2-3 treatment options. No charges to patients.",
  keywords: [
    "surgery guidance hyderabad",
    "nabh accredited hospitals hyderabad",
    "free patient guidance",
    "affordable surgery hyderabad",
    "second opinion surgery",
    "medical tourism hyderabad",
    "best surgeons hyderabad",
  ],
  alternates: { canonical: `${siteUrl}/surgery-guidance` },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Free Surgery Guidance in Hyderabad | NABH Hospitals & Expert Surgeons",
    description:
      "Get free surgery guidance in Hyderabad with NABH hospitals, expert surgeons, and transparent treatment options.",
    url: `${siteUrl}/surgery-guidance`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/images/surgery-guidance/og-main.jpg`,
        width: 1200,
        height: 630,
        alt: "Surgery Guidance Hyderabad",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Surgery Guidance in Hyderabad | NABH Hospitals & Expert Surgeons",
    description:
      "Get free surgery guidance in Hyderabad with NABH hospitals, expert surgeons, and transparent treatment options.",
    images: [`${siteUrl}/images/surgery-guidance/og-main.jpg`],
  },
};
