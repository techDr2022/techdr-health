import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";

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
    default: "TechDrHealth — Online Doctor Consultation | 100+ Specialists",
    template: "%s | TechDrHealth",
  },
  description:
    "Consult verified doctors online via video in minutes. 100+ specialists across 20+ specialities. Book teleconsultation now on techdrhealth.com.",
  metadataBase: new URL("https://techdrhealth.com"),
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
      <body className="antialiased">
        <Providers>
          {children}
          <Toaster richColors position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
