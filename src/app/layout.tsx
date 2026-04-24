import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { JsonLd } from "@/components/seo/JsonLd";
import { getMedicalOrgSchema, getWebsiteSchema } from "@/lib/schema";

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
    default: "TechDrHealth - Online Doctor Consultation | 1000+ Specialists",
    template: "%s | TechDrHealth",
  },
  description:
    "Consult verified doctors online via video in minutes. 1000+ specialists across 20+ specialities. Book teleconsultation now on techdrhealth.com.",
  metadataBase: new URL("https://techdrhealth.com"),
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    siteName: "TechDrHealth",
    type: "website",
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
          <JsonLd data={[getMedicalOrgSchema(), getWebsiteSchema()]} />
          {children}
          <Toaster richColors position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
