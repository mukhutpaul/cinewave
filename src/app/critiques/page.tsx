
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Critiques cinéma — Histyra",
  description:
    "Découvre nos critiques de films et de séries, nos analyses et nos avis indépendants sur Histyra.",
  openGraph: {
    title: "Critiques cinéma — Histyra",
    description:
      "Des critiques indépendantes pour regarder le cinéma autrement.",
    type: "website",
    locale: "fr_FR",
    siteName: "Histyra",
  },
};

function CritiquesLoading() {
  return (
    <main className="min-h-screen bg-[#080b14] px-5 py-16 text-white sm:px-8">
      <div className="mx-auto max-w-7xl animate-pulse space-y-8">
        <div className="h-4 w-48 rounded bg-white/10" />
        <div className="h-12 max-w-xl rounded bg-white/10" />
        <div className="h-5 max-w-2xl rounded bg-white/10" />

        <div className="grid gap-6 pt-8 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
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

export default function CritiquesPage() {
  return (
    <Suspense fallback={<CritiquesLoading />}>
      <CritiquesContent />
    </Suspense>
  );
}

async function CritiquesContent() {
  await connection();

  const now = new Date();

  const reviews = await prisma.review.findMany({
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
      authorName: true,
      rating: true,
      publishedAt: true,
      movie: {
        select: {
          title: true,
          slug: true,
          posterUrl: true,
          type: true,
          releaseYear: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-[#080b14] text-white">
      <section className="relative isolate overflow-hidden border-b border-white/10 bg-gradient-to-br from-[#241126] via-[#17152b] to-[#080b14]">
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-20 -z-10 h-80 w-80 rounded-full bg-rose-600/20 blur-3xl"
        />

        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <Link
            href="/"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            ← Accueil
          </Link>

          <p className="mt-8 text-sm font-bold uppercase tracking-[0.25em] text-rose-400">
            Le regard de la rédaction
          </p>

          <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
            Les films méritent
            <span className="block text-rose-400">
              un vrai regard.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Critiques indépendantes, analyses approfondies et avis sans
            détour pour découvrir ce que chaque histoire a vraiment à offrir.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="badge badge-outline border-rose-400/40 px-4 py-3 text-rose-300">
              Analyses
            </span>
            <span className="badge badge-outline border-white/15 px-4 py-3 text-slate-300">
              Films et séries
            </span>
            <span className="badge badge-outline border-white/15 px-4 py-3 text-slate-300">
              Avis indépendants
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400">
              Nos dernières publications
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Toutes les critiques
            </h2>
          </div>

          <span className="text-sm text-slate-400">
            {reviews.length} publication
            {reviews.length > 1 ? "s" : ""}
            {reviews.length === 12 ? " récentes" : ""}
          </span>
        </div>

        {reviews.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center">
            <div className="text-5xl" aria-hidden="true">
              🎬
            </div>

            <h2 className="mt-5 text-2xl font-bold">
              Le rideau se lève bientôt
            </h2>

            <p className="mx-auto mt-3 max-w-lg leading-7 text-slate-400">
              Nos premières critiques seront bientôt disponibles. Reviens
              découvrir nos analyses et nos avis sur les films et les séries.
            </p>

            <Link href="/films" className="btn btn-error mt-7 text-white">
              Explorer les films
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 transition duration-200 hover:-translate-y-1 hover:border-rose-500/40"
              >
                {review.movie?.posterUrl ? (
                  <Link
                    href={`/critiques/${review.slug}`}
                    aria-label={`Lire la critique ${review.title}`}
                    className="relative block aspect-[16/9] overflow-hidden bg-slate-950"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={review.movie.posterUrl}
                      alt={`Affiche de ${review.movie.title}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />

                    {review.rating != null && (
                      <span className="badge absolute bottom-3 right-3 border-amber-400/30 bg-slate-950/90 text-amber-300">
                        ★ {review.rating}/10
                      </span>
                    )}
                  </Link>
                ) : (
                  <div className="relative flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-rose-950/70 via-slate-900 to-violet-950/50">
                    <span className="text-5xl" aria-hidden="true">
                      🎞️
                    </span>

                    {review.rating != null && (
                      <span className="badge absolute bottom-3 right-3 border-amber-400/30 bg-slate-950/90 text-amber-300">
                        ★ {review.rating}/10
                      </span>
                    )}
                  </div>
                )}

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  {review.movie && (
                    <Link
                      href={`/films/${review.movie.slug}`}
                      className="text-xs font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300"
                    >
                      {review.movie.type === "SERIES" ? "Série" : "Film"}
                      {review.movie.releaseYear
                        ? ` · ${review.movie.releaseYear}`
                        : ""}
                      {" — "}
                      {review.movie.title}
                    </Link>
                  )}

                  <h3 className="mt-3 text-xl font-bold leading-snug transition group-hover:text-rose-300">
                    <Link href={`/critiques/${review.slug}`}>
                      {review.title}
                    </Link>
                  </h3>

                  {review.excerpt && (
                    <p className="mt-3 line-clamp-4 flex-1 text-sm leading-7 text-slate-400">
                      {review.excerpt}
                    </p>
                  )}

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <div>
                      <p className="text-xs text-slate-500">Par</p>
                      <p className="mt-1 text-sm font-medium text-slate-300">
                        {review.authorName}
                      </p>
                    </div>

                    {review.publishedAt && (
                      <time
                        dateTime={review.publishedAt.toISOString()}
                        className="text-xs text-slate-500"
                      >
                        {review.publishedAt.toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          timeZone: "UTC",
                        })}
                      </time>
                    )}
                  </div>

                  <Link
                    href={`/critiques/${review.slug}`}
                    className="btn btn-outline mt-5 border-rose-500/50 text-rose-300 hover:border-rose-500 hover:bg-rose-500 hover:text-white"
                  >
                    Lire la critique →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#211326] to-slate-900 p-7 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400">
            Prolonge l'expérience
          </p>

          <h2 className="mt-3 text-2xl font-black">
            Une histoire à découvrir ?
          </h2>

          <p className="mt-3 max-w-xl leading-7 text-slate-400">
            Parcours notre catalogue pour trouver ton prochain film ou ta
            prochaine série.
          </p>

          <Link href="/films" className="btn btn-error mt-6 text-white">
            Découvrir le catalogue →
          </Link>
        </div>
      </section>
    </main>
  );
}
