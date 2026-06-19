import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { HealthChatWidget } from "@/components/ai/HealthChatWidget";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site-config";
import {
  getHowToConsultSchema,
  getMedicalOrgSchema,
  getTelehealthApplicationSchema,
  getWebsiteSchema,
} from "@/lib/schema";

const interDisplay = Inter({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const interBody = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} - Worldwide Online Doctor Consultation | 1000+ Specialists`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      en: SITE_URL,
      "en-IN": SITE_URL,
      "x-default": SITE_URL,
    },
  },
  openGraph: {
    title: `${SITE_NAME} - Worldwide Online Doctor Consultation`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "en",
    alternateLocale: ["en_IN", "en_US", "en_GB", "en_AE"],
    images: [
      {
        url: `${SITE_URL}/techdrhealth-logo.png`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Global Teleconsultation Platform`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Worldwide Teleconsultation`,
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/techdrhealth-logo.png`],
    site: "@techdrtelehealth",
    creator: "@techdrtelehealth",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: {
    "geo.region": "WORLD",
    "geo.placename": "Worldwide",
    language: "en",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${interDisplay.variable} ${interBody.variable}`}>
      <head>
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLMs.txt" />
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-09WZSV2Q9L"
        />
        <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-09WZSV2Q9L');
        `}</Script>
      </head>
      <body className="antialiased">
        <Providers>
          <JsonLd
            data={[
              getMedicalOrgSchema(),
              getWebsiteSchema(),
              getTelehealthApplicationSchema(),
              getHowToConsultSchema(),
            ]}
          />
          {children}
          <HealthChatWidget />
          <Toaster richColors position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
