
import type { Metadata } from "next";
import { Suspense } from "react";
import HomeContent from "./home-content";

export const metadata: Metadata = {
  title: "Accueil",
  description:
    "Découvre des films, des séries, des critiques indépendantes et des actualités cinéma sur Histyra.",
  openGraph: {
    title: "Histyra — Le magazine cinéma",
    description:
      "Films, séries, critiques indépendantes et actualités pour les passionnés du grand écran.",
    type: "website",
    locale: "fr_FR",
    siteName: "Histyra",
  },
};

function HomeLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-12">
      <div className="min-h-[480px] animate-pulse rounded-3xl bg-slate-900" />
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="aspect-[2/3] animate-pulse rounded-xl bg-slate-900"
          />
        ))}
      </div>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeContent />
    </Suspense>
  );
}
