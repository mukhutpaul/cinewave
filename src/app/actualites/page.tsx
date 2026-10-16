
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Actualités cinéma et séries — Histyra",
  description:
    "Retrouve les actualités du cinéma, les nouvelles sorties, les annonces et les dossiers sur les films et les séries.",
  openGraph: {
    title: "Actualités cinéma et séries — Histyra",
    description:
      "Les nouvelles du grand écran, les dossiers et les découvertes de la rédaction Histyra.",
    type: "website",
    locale: "fr_FR",
    siteName: "Histyra",
  },
};

function ActualitesLoading() {
  return (
    <main className="min-h-screen bg-[#080b14] px-5 py-16 text-white sm:px-8">
      <div className="mx-auto max-w-7xl animate-pulse space-y-8">
        <div className="h-3 w-40 rounded bg-white/10" />
        <div className="h-12 max-w-xl rounded bg-white/10" />
        <div className="h-5 max-w-2xl rounded bg-white/10" />
        <div className="grid gap-6 pt-8 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-2xl border border-white/10"
            >
              <div className="aspect-video bg-white/10" />
              <div className="space-y-3 p-5">
                <div className="h-4 w-1/3 rounded bg-white/10" />
                <div className="h-6 rounded bg-white/10" />
                <div className="h-4 rounded bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function ActualitesPage() {
  return (
    <Suspense fallback={<ActualitesLoading />}>
      <ActualitesContent />
    </Suspense>
  );
}

async function ActualitesContent() {
  await connection();

  const now = new Date();

  const articles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { lte: now },
    },
    orderBy: [
      { publishedAt: "desc" },
      { createdAt: "desc" },
    ],
    take: 12,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImageUrl: true,
      authorName: true,
      publishedAt: true,
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  const featuredArticle = articles[0];
  const otherArticles = articles.slice(1);

  return (
    <main className="min-h-screen bg-[#080b14] text-white">
      <section className="relative isolate overflow-hidden border-b border-white/10 bg-gradient-to-br from-[#111b32] via-[#17152b] to-[#080b14]">
        <div
          aria-hidden="true"
          className="absolute -right-16 top-0 -z-10 h-80 w-80 rounded-full bg-sky-500/15 blur-3xl"
        />

        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <Link
            href="/"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            ← Accueil
          </Link>

          <p className="mt-8 text-sm font-bold uppercase tracking-[0.25em] text-sky-400">
            Le magazine Histyra
          </p>

          <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
            Toute l'actualité
            <span className="block text-sky-400">
              du grand écran.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Annonces, nouveautés, dossiers et coulisses : reste au courant
            de ce qui fait vibrer le monde du cinéma et des séries.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
              À la une
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Les dernières actualités
            </h2>
          </div>

          <span className="text-sm text-slate-400">
            {articles.length} article
            {articles.length > 1 ? "s" : ""}
            {articles.length === 12 ? " récents" : ""}
          </span>
        </div>

        {articles.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center">
            <div className="text-5xl" aria-hidden="true">
              📰
            </div>

            <h2 className="mt-5 text-2xl font-bold">
              Les premières nouvelles arrivent bientôt
            </h2>

            <p className="mx-auto mt-3 max-w-lg leading-7 text-slate-400">
              La rédaction prépare ses premiers articles. Reviens bientôt
              pour suivre les nouveautés et les coulisses du cinéma.
            </p>

            <Link href="/critiques" className="btn btn-info mt-7">
              Lire les critiques
            </Link>
          </div>
        ) : (
          <>
            {featuredArticle && (
              <article className="group overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70">
                <div className="grid lg:grid-cols-2">
                  <Link
                    href={`/actualites/${featuredArticle.slug}`}
                    aria-label={`Lire ${featuredArticle.title}`}
                    className="relative block min-h-64 overflow-hidden bg-gradient-to-br from-sky-950 via-slate-900 to-violet-950 lg:min-h-[380px]"
                  >
                    {featuredArticle.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={featuredArticle.coverImageUrl}
                        alt={featuredArticle.title}
                        fetchPriority="high"
                        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full min-h-64 items-center justify-center text-7xl">
                        🎥
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    <span className="badge absolute left-5 top-5 border-sky-400/30 bg-slate-950/80 text-sky-300">
                      À la une
                    </span>
                  </Link>

                  <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-10">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      {featuredArticle.category && (
                        <span className="badge badge-outline border-sky-400/40 text-sky-300">
                          {featuredArticle.category.name}
                        </span>
                      )}

                      {featuredArticle.publishedAt && (
                        <time
                          dateTime={featuredArticle.publishedAt.toISOString()}
                        >
                          {featuredArticle.publishedAt.toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              timeZone: "UTC",
                            },
                          )}
                        </time>
                      )}
                    </div>

                    <h2 className="mt-5 text-2xl font-black leading-tight transition group-hover:text-sky-300 sm:text-3xl">
                      <Link href={`/actualites/${featuredArticle.slug}`}>
                        {featuredArticle.title}
                      </Link>
                    </h2>

                    {featuredArticle.excerpt && (
                      <p className="mt-4 leading-7 text-slate-400">
                        {featuredArticle.excerpt}
                      </p>
                    )}

                    <p className="mt-5 text-sm text-slate-500">
                      Par {featuredArticle.authorName}
                    </p>

                    <Link
                      href={`/actualites/${featuredArticle.slug}`}
                      className="btn btn-info mt-6 w-fit"
                    >
                      Lire l'article →
                    </Link>
                  </div>
                </div>
              </article>
            )}

            {otherArticles.length > 0 && (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {otherArticles.map((article) => (
                  <article
                    key={article.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 transition duration-200 hover:-translate-y-1 hover:border-sky-400/40"
                  >
                    <Link
                      href={`/actualites/${article.slug}`}
                      aria-label={`Lire ${article.title}`}
                      className="relative block aspect-[16/9] overflow-hidden bg-gradient-to-br from-sky-950 to-violet-950"
                    >
                      {article.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={article.coverImageUrl}
                          alt={article.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-5xl">
                          📰
                        </div>
                      )}
                    </Link>

                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        {article.category && (
                          <span className="font-semibold text-sky-400">
                            {article.category.name}
                          </span>
                        )}

                        {article.publishedAt && (
                          <time dateTime={article.publishedAt.toISOString()}>
                            {article.publishedAt.toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              timeZone: "UTC",
                            })}
                          </time>
                        )}
                      </div>

                      <h3 className="mt-3 text-xl font-bold leading-snug transition group-hover:text-sky-300">
                        <Link href={`/actualites/${article.slug}`}>
                          {article.title}
                        </Link>
                      </h3>

                      {article.excerpt && (
                        <p className="mt-3 line-clamp-4 flex-1 text-sm leading-7 text-slate-400">
                          {article.excerpt}
                        </p>
                      )}

                      <div className="mt-5 border-t border-white/10 pt-4">
                        <p className="text-xs text-slate-500">
                          Par {article.authorName}
                        </p>

                        <Link
                          href={`/actualites/${article.slug}`}
                          className="btn btn-outline mt-4 w-full border-sky-400/40 text-sky-300 hover:border-sky-500 hover:bg-sky-500 hover:text-white"
                        >
                          Lire la suite →
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#111b32] to-slate-900 p-7 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
            Le regard de la rédaction
          </p>

          <h2 className="mt-3 text-2xl font-black">
            L'actualité ne raconte pas toute l'histoire.
          </h2>

          <p className="mt-3 max-w-xl leading-7 text-slate-400">
            Découvre aussi nos critiques et nos analyses pour approfondir
            tes prochaines séances de cinéma.
          </p>

          <Link href="/critiques" className="btn btn-info mt-6">
            Explorer les critiques →
          </Link>
        </div>
      </section>
    </main>
  );
}
