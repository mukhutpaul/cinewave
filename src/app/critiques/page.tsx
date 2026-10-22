
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Histoires et récits | HISTYRA",
  description:
    "Découvre les histoires, les récits, les analyses et les publications de HISTYRA. De nouveaux univers et articles à explorer.",
  alternates: {
    canonical: "/critiques",
  },
  openGraph: {
    title: "Histoires et récits | HISTYRA",
    description:
      "Des histoires à découvrir, des récits à partager et des univers à explorer.",
    type: "website",
    locale: "fr_FR",
    siteName: "HISTYRA",
    url: "/critiques",
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
      OR: [
        { publishedAt: null },
        { publishedAt: { lte: now } },
      ],
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
      {/* Introduction */}
      <section className="relative isolate overflow-hidden border-b border-white/10 bg-gradient-to-br from-[#101c35] via-[#17152b] to-[#080b14]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 -z-10 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-1/3 -z-10 h-72 w-72 rounded-full bg-violet-600/15 blur-3xl"
        />

        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <Link
            href="/"
            className="text-sm text-slate-400 transition hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            ← Retour à l'accueil
          </Link>

          <p className="mt-8 text-sm font-bold uppercase tracking-[0.25em] text-sky-400">
            Le magazine HISTYRA
          </p>

          <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl md:text-7xl">
            Chaque histoire
            <span className="block bg-gradient-to-r from-sky-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">
              mérite d'être racontée.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Entre articles, récits captivants, analyses et découvertes,
            HISTYRA t'invite à explorer des univers nouveaux et à
            découvrir des histoires qui éveillent la curiosité,
            nourrissent l'imagination et laissent une empreinte.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="badge badge-outline border-sky-400/40 px-4 py-3 text-sky-300">
              Histoires
            </span>

            <span className="badge badge-outline border-white/15 px-4 py-3 text-slate-300">
              Articles
            </span>

            <span className="badge badge-outline border-white/15 px-4 py-3 text-slate-300">
              Analyses et découvertes
            </span>
          </div>

          <div className="mt-12 border-t border-white/10 pt-6">
            <p className="max-w-xl text-sm leading-7 text-slate-400">
              De nouvelles publications viendront progressivement
              enrichir notre univers. Chaque visite est une occasion
              de découvrir un nouveau récit.
            </p>
          </div>
        </div>
      </section>

      {/* Publications */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
              À lire et à découvrir
            </p>

            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Nos dernières publications
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">
              Retrouve ici nos publications et nos regards sur les
              œuvres qui inspirent notre univers.
            </p>
          </div>

          <span className="text-sm text-slate-400">
            {reviews.length} publication
            {reviews.length !== 1 ? "s" : ""}
            {reviews.length === 12 ? " récentes" : ""}
          </span>
        </div>

        {reviews.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center">
            <div className="text-5xl" aria-hidden="true">
              📖
            </div>

            <h2 className="mt-5 text-2xl font-bold">
              Les premières histoires arrivent bientôt
            </h2>

            <p className="mx-auto mt-3 max-w-lg leading-7 text-slate-400">
              Notre espace éditorial se prépare à accueillir de
              nouvelles histoires, des récits originaux et des
              articles à découvrir. Reviens bientôt pour explorer
              les premières publications de HISTYRA.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/actualites"
                className="btn btn-error text-white"
              >
                Lire les articles
              </Link>

              <Link
                href="/a-propos"
                className="btn border-white/15 bg-white/[0.03] text-white hover:bg-white/10"
              >
                Découvrir HISTYRA
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 transition duration-200 hover:-translate-y-1 hover:border-sky-400/40"
              >
                {review.movie?.posterUrl ? (
                  <Link
                    href={`/critiques/${review.slug}`}
                    aria-label={`Découvrir ${review.title}`}
                    className="relative block aspect-[16/9] overflow-hidden bg-slate-950"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={review.movie.posterUrl}
                      alt={`Illustration de ${review.movie.title}`}
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
                  <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-gradient-to-br from-sky-950/70 via-slate-900 to-violet-950/50">
                    <div
                      aria-hidden="true"
                      className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl"
                    />

                    <span className="relative text-5xl" aria-hidden="true">
                      ✦
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
                      className="text-xs font-bold uppercase tracking-wider text-sky-400 transition hover:text-sky-300"
                    >
                      {review.movie.type === "SERIES"
                        ? "Univers en série"
                        : "Univers cinématographique"}
                      {review.movie.releaseYear
                        ? ` · ${review.movie.releaseYear}`
                        : ""}
                    </Link>
                  )}

                  <h3 className="mt-3 text-xl font-bold leading-snug transition group-hover:text-sky-300">
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
                      <p className="text-xs text-slate-500">
                        Publication de
                      </p>

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
                    className="btn btn-outline mt-5 border-sky-400/40 text-sky-300 hover:border-sky-400 hover:bg-sky-400 hover:text-slate-950"
                  >
                    Découvrir la publication →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Appel à la découverte */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <div className="relative isolate overflow-hidden rounded-3xl border border-sky-400/20 bg-gradient-to-br from-[#12213b] via-[#11162a] to-[#17132a] p-7 sm:p-10 lg:p-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 -z-10 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl"
          />

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
            Le prochain chapitre t'attend
          </p>

          <h2 className="mt-3 max-w-2xl text-2xl font-black sm:text-4xl">
            Une nouvelle histoire peut tout changer.
          </h2>

          <p className="mt-4 max-w-xl leading-7 text-slate-300">
            Explore nos articles, découvre de nouvelles idées et
            prépare-toi à plonger dans les récits qui seront publiés
            sur HISTYRA.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/actualites"
              className="btn bg-sky-400 text-slate-950 hover:bg-sky-300"
            >
              Explorer les articles →
            </Link>

            <Link
              href="/a-propos"
              className="btn border-white/15 bg-white/[0.03] text-white hover:bg-white/10"
            >
              Notre univers
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
