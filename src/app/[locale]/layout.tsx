
import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  hasLocale,
  NextIntlClientProvider,
} from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";

import { routing } from "@/i18n/routing";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/Toaster";

import "../globals.css";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: Omit<Props, "children">): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getTranslations({
    locale,
    namespace: "Metadata",
  });

  const localeTag = {
    ru: "ru_RU",
    fr: "fr_FR",
    en: "en_US",
  }[locale];

  return {
    title: {
      default: t("title"),
      template: "%s | HISTYRA",
    },
    description: t("description"),
    applicationName: "HISTYRA",
    alternates: {
      languages: {
        ru: "/ru",
        fr: "/fr",
        en: "/en",
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      locale: localeTag,
      siteName: "HISTYRA",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages({ locale });

  return (
    <html lang={locale} data-theme="dark">
      <body className="min-h-screen bg-[#080b14] text-white antialiased">
        <NextIntlClientProvider messages={messages}>
          <Suspense
            fallback={<div className="min-h-16" aria-hidden="true" />}
          >
            <Navbar />
          </Suspense>

          <main className="min-h-[70vh]">
            {children}
          </main>

          <Footer />
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
