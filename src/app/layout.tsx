
import type { Metadata } from "next";
import { Suspense } from "react";

import "./globals.css";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/Toaster";

export const metadata: Metadata = {
  title: {
    default: "CineWave — Le magazine cinéma",
    template: "%s | CineWave",
  },

  description:
    "Découvre des critiques indépendantes, des analyses, des actualités et des recommandations de films et séries sur CineWave.",

  applicationName: "CineWave",

  openGraph: {
    title: "CineWave — Le magazine cinéma",
    description:
      "Critiques, analyses et découvertes pour les passionnés du grand écran.",
    type: "website",
    locale: "fr_FR",
    siteName: "CineWave",
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
        <Suspense
          fallback={
            <div
              className="min-h-16"
              aria-hidden="true"
            />
          }
        >
          <Navbar />
        </Suspense>

        <main className="min-h-[70vh]">
          {children}
        </main>

        <Footer />

        {/* Notifications globales CineWave */}
        <Toaster />
      </body>
    </html>
  );
}
