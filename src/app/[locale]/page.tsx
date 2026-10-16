
import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import HomeContent from "./home-content";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({
    locale,
    namespace: "Metadata",
  });

  const localeTag = {
    ru: "ru_RU",
    fr: "fr_FR",
    en: "en_US",
  }[locale] ?? "ru_RU";

  return {
    title: {
      default: t("title"),
      template: "%s | HISTYRA",
    },
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      locale: localeTag,
      siteName: "HISTYRA",
    },
  };
}

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
