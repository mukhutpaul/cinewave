import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const now = new Date();

  const series = await prisma.movie.findFirst({
    where: {
      slug,
      type: "SERIES",
      status: "PUBLISHED",
      OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
    },
    select: {
      title: true,
      synopsis: true,
      posterUrl: true,
      seoTitle: true,
      seoDescription: true,
    },
  });

  if (!series) {
    return {
      title: "Série introuvable | Histyra",
      robots: { index: false, follow: false },
    };
  }

  const title = series.seoTitle || series.title;
  const description = (
    series.seoDescription ||
    series.synopsis ||
    `Découvrez la série ${series.title} sur Histyra.`
  ).slice(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: series.posterUrl ? [{ url: series.posterUrl }] : [],
    },
  };
}

function SeriesLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-10 md:px-8">
      <div className="mb-8 h-5 w-48 animate-pulse rounded bg-slate-800" />

      <section className="grid gap-8 rounded-3xl border border-white/10 bg-slate-900 p-6 sm:p-10 md:grid-cols-[280px_1fr] md:p-12">
        <div className="mx-auto aspect-[2/3] w-full max-w-[280px] animate-pulse rounded-2xl bg-slate-800" />

        <div className="flex flex-col justify-center gap-5">
          <div className="h-5 w-24 animate-pulse rounded bg-slate-800" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-slate-800" />
          <div className="h-4 w-32 animate-pulse rounded bg-slate-800" />
          <div className="mt-5 h-5 w-28 animate-pulse rounded bg-slate-800" />
          <div className="h-24 w-full animate-pulse rounded bg-slate-800" />
        </div>
      </section>

      <div className="mt-12 h-8 w-64 animate-pulse rounded bg-slate-800" />
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="h-40 animate-pulse rounded-2xl bg-slate-900" />
        <div className="h-40 animate-pulse rounded-2xl bg-slate-900" />
      </div>
    </main>
  );
}

export default function SeriesDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<SeriesLoading />}>
      <SeriesDetailContent params={params} />
    </Suspense>
  );
}

async function SeriesDetailContent({ params }: Props) {
  await connection();

  const { slug } = await params;
  const now = new Date();

  const series = await prisma.movie.findFirst({
    where: {
      slug,
      type: "SERIES",
      status: "PUBLISHED",
      OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      synopsis: true,
      posterUrl: true,
      backdropUrl: true,
      releaseYear: true,
      duration: true,
      category: {
        select: { name: true },
      },
      reviews: {
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
        take: 10,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          authorName: true,
          rating: true,
        },
      },
    },
  });

  if (!series) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-10 md:px-8">
      <nav
        aria-label="Fil d’Ariane"
        className="mb-8 text-sm text-slate-400"
      >
        <Link href="/" className="hover:text-rose-400">
          Accueil
        </Link>
        {" / "}
        <Link href="/series" className="hover:text-rose-400">
          Séries
        </Link>
        {" / "}
        <span className="text-white">{series.title}</span>
      </nav>

      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900">
        {series.backdropUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={series.backdropUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-20"
          />
        )}

        <div className="relative grid gap-8 p-6 sm:p-10 md:grid-cols-[280px_1fr] md:p-12">
          <div>
            {series.posterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={series.posterUrl}
                alt={`Affiche de ${series.title}`}
                className="mx-auto w-full max-w-[280px] rounded-2xl object-cover shadow-2xl"
              />
            ) : (
              <div className="poster-gradient flex aspect-[2/3] items-center justify-center rounded-2xl">
                <span className="text-6xl">📺</span>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap gap-2">
              <span className="badge badge-error">Série</span>

              {series.category && (
                <span className="badge badge-outline">
                  {series.category.name}
                </span>
              )}
            </div>

            <h1 className="mt-5 text-4xl font-black sm:text-5xl">
              {series.title}
            </h1>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
              {series.releaseYear && <span>{series.releaseYear}</span>}

              {series.duration != null && (
                <span>{series.duration} min par épisode</span>
              )}
            </div>

            <h2 className="mt-8 text-xl font-bold">Synopsis</h2>

            <p className="mt-3 whitespace-pre-line leading-8 text-slate-300">
              {series.synopsis || "Aucun synopsis disponible pour le moment."}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <h2 className="text-3xl font-bold">Critiques de la série</h2>

        {series.reviews.length === 0 ? (
          <p className="mt-5 rounded-2xl border border-white/10 p-6 text-slate-400">
            Aucune critique publiée pour cette série pour le moment.
          </p>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {series.reviews.map((review) => (
              <article
                key={review.id}
                className="card border border-white/10 bg-slate-900"
              >
                <div className="card-body">
                  <h3 className="card-title">{review.title}</h3>

                  {review.rating !== null && (
                    <p className="text-amber-400">
                      Note : {review.rating}/10
                    </p>
                  )}

                  <p className="leading-7 text-slate-300">
                    {review.excerpt || "Aucun extrait disponible."}
                  </p>

                  <p className="text-xs text-slate-400">
                    Par {review.authorName}
                  </p>

                  <div className="card-actions justify-end">
                    <Link
                      href={`/critiques/${review.slug}`}
                      className="btn btn-outline btn-sm border-rose-500 text-rose-400"
                    >
                      Lire la critique
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <aside
        className="my-8 flex min-h-[90px] items-center justify-center border-y border-white/5"
        aria-label="Espace publicitaire"
      >
        <span className="text-xs text-slate-600">
          Espace publicitaire
        </span>
      </aside>

      <div className="pb-10">
        <Link href="/series" className="btn btn-ghost">
          ← Retour aux séries
        </Link>
      </div>
    </main>
  );
}