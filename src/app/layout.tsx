
import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";

import "./globals.css";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/Toaster";

const ADSENSE_CLIENT = "ca-pub-1679933365806572";

export const metadata: Metadata = {
  title: {
    default: "Histyra — Le magazine cinéma",
    template: "%s | Histyra",
  },
  description:
    "Découvre des critiques indépendantes, des analyses, des actualités et des recommandations de films et séries sur Histyra.",
  applicationName: "Histyra",
  openGraph: {
    title: "Histyra — Le magazine cinéma",
    description:
      "Critiques, analyses et découvertes pour les passionnés du grand écran.",
    type: "website",
    locale: "fr_FR",
    siteName: "Histyra",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-theme="dark">
      <body className="min-h-screen bg-[#080b14] text-white antialiased">
        <Script
          id="google-adsense"
          async
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
        />

        <Suspense fallback={<div className="min-h-16" aria-hidden="true" />}>
          <Navbar />
        </Suspense>

        <main className="min-h-[70vh]">{children}</main>

        <Footer />

        <Toaster />
      </body>
    </html>
  );
}
