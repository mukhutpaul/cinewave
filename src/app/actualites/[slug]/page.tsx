
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const metadata: Metadata = {
  title: "Actualités | Histyra",
  description:
    "Découvrez les actualités du cinéma, les nouveautés et les dossiers sur Histyra.",
  openGraph: {
    title: "Actualités | Histyra",
    description:
      "Lisez les dernières actualités du cinéma et des séries sur Histyra.",
    type: "website",
    siteName: "Histyra",
    locale: "fr_FR",
  },
};

async function getArticle(slug: string) {
  return prisma.article.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
      publishedAt: {
        lte: new Date(),
      },
    },
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });
}

function ArticleLoading() {
  return (
    <main className="min-h-screen bg-[#080b14] text-white">
      <div className="mx-auto max-w-5xl animate-pulse px-5 py-12 sm:px-8">
        <div className="mb-10 h-4 w-48 rounded bg-white/10" />
        <div className="h-10 max-w-3xl rounded-lg bg-white/10 sm:h-14" />
        <div className="mt-5 h-5 max-w-2xl rounded bg-white/10" />
        <div className="mt-8 aspect-video rounded-3xl bg-white/10" />
        <div className="mt-10 space-y-4">
          <div className="h-4 rounded bg-white/10" />
          <div className="h-4 rounded bg-white/10" />
          <div className="h-4 w-4/5 rounded bg-white/10" />
        </div>
      </div>
    </main>
  );
}

async function ArticleContent({ slug }: { slug: string }) {
  await connection();

  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const date = article.publishedAt
    ? new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(article.publishedAt)
    : null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080b14] text-white">
      {/* Décoration d’arrière-plan */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 h-[480px] w-[800px] -translate-x-1/2 rounded-full bg-sky-500/[0.09] blur-[120px]" />
        <div className="absolute right-0 top-40 h-64 w-64 rounded-full bg-violet-500/[0.08] blur-[100px]" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12 lg:py-16">
        {/* Fil d’Ariane */}
        <nav
          aria-label="Fil d’Ariane"
          className="mb-10 flex flex-wrap items-center gap-2 text-sm text-slate-400"
        >
          <Link href="/" className="transition hover:text-sky-300">
            Accueil
          </Link>

          <span aria-hidden="true" className="text-slate-600">
            /
          </span>

          <Link href="/actualites" className="transition hover:text-sky-300">
            Actualités
          </Link>

          {article.category && (
            <>
              <span aria-hidden="true" className="text-slate-600">
                /
              </span>
              <span className="text-slate-300">
                {article.category.name}
              </span>
            </>
          )}
        </nav>

        {/* Titre et informations */}
        <header>
          {article.category && (
            <span className="inline-flex items-center rounded-full border border-sky-400/25 bg-sky-400/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-sky-300">
              {article.category.name}
            </span>
          )}

          <h1 className="mt-5 max-w-4xl text-3xl font-black leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg sm:leading-9">
              {article.excerpt}
            </p>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-white/10 pb-7 text-sm text-slate-400">
            {article.authorName && (
              <div className="inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-sky-400/20 bg-sky-400/10 font-bold text-sky-300"
                >
                  {article.authorName.trim().charAt(0).toUpperCase()}
                </span>

                <span>
                  Par{" "}
                  <span className="font-medium text-slate-200">
                    {article.authorName}
                  </span>
                </span>
              </div>
            )}

            {date && (
              <time
                dateTime={article.publishedAt?.toISOString()}
                className="inline-flex items-center gap-2"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.7}
                  className="h-4 w-4 text-sky-400"
                >
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M16 3v4M8 3v4M3 10h18" />
                </svg>
                {date}
              </time>
            )}
          </div>
        </header>

        {/* Affiche de l’article */}
        {article.coverImageUrl && (
          <figure className="mt-9 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/30 sm:mt-12 sm:rounded-3xl">
            <div className="relative aspect-video overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.coverImageUrl}
                alt={`Illustration : ${article.title}`}
                fetchPriority="high"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>

            <figcaption className="border-t border-white/10 px-4 py-3 text-xs leading-5 text-slate-500 sm:px-5">
              {article.title} — Histyra
            </figcaption>
          </figure>
        )}

        {/* Texte de l’article */}
        <article className="mt-10 sm:mt-14">
          <div className="mb-8 flex items-center gap-3">
            <span className="h-8 w-1 rounded-full bg-sky-400" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
              Lecture
            </p>
          </div>

          <div className="break-words text-base leading-8 text-slate-300 sm:text-lg sm:leading-9 [&_a]:text-sky-300 [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:my-8 [&_blockquote]:border-l-4 [&_blockquote]:border-sky-400 [&_blockquote]:pl-5 [&_blockquote]:italic [&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-white [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-6 [&_strong]:font-bold [&_strong]:text-white">
            {article.content.split(/\r?\n/).map((paragraph, index) =>
              paragraph.trim() ? (
                <p key={index} className="whitespace-pre-wrap">
                  {paragraph}
                </p>
              ) : null
            )}
          </div>
        </article>

        {/* Retour aux actualités */}
        <footer className="mt-14 border-t border-white/10 pt-8 sm:mt-20">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-[#0d1220] p-6 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-400">
                Histyra · Magazine
              </p>

              <h2 className="mt-2 text-xl font-bold sm:text-2xl">
                Continuez votre lecture
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Retrouvez les dernières actualités du cinéma et des séries.
              </p>
            </div>

            <Link
              href="/actualites"
              className="mt-5 inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-sky-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-[#080b14] sm:mt-0"
            >
              <span aria-hidden="true">←</span>
              Toutes les actualités
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}

async function ArticlePageContent({ params }: PageProps) {
  const { slug } = await params;

  return <ArticleContent slug={slug} />;
}

export default function ArticlePage({ params }: PageProps) {
  return (
    <Suspense fallback={<ArticleLoading />}>
      <ArticlePageContent params={params} />
    </Suspense>
  );
}
