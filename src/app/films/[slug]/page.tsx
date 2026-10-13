
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import VideoSourcePlayer from "@/components/films/VideoSourcePlayer";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const instant = false;

function getSiteUrl(): URL | undefined {
  const url = process.env.NEXT_PUBLIC_SITE_URL;

  if (!url) return undefined;

  try {
    return new URL(url);
  } catch {
    return undefined;
  }
}

function formatDuration(duration: number | null): string | null {
  if (!duration || duration <= 0) return null;

  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours} h ${minutes} min` : `${hours} h`;
  }

  return `${minutes} min`;
}

function getPublishedMovieWhere(slug: string, now: Date) {
  return {
    slug,
    status: "PUBLISHED" as const,
    OR: [
      { publishedAt: null },
      { publishedAt: { lte: now } },
    ],
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  await connection();

  const { slug } = await params;
  const now = new Date();

  const movie = await prisma.movie.findFirst({
    where: getPublishedMovieWhere(slug, now),
    select: {
      title: true,
      synopsis: true,
      posterUrl: true,
      backdropUrl: true,
      seoTitle: true,
      seoDescription: true,
      releaseYear: true,
    },
  });

  if (!movie) {
    return {
      title: "Film introuvable | Histyra",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = movie.seoTitle?.trim() || movie.title;

  const description =
    movie.seoDescription?.trim() ||
    movie.synopsis?.slice(0, 160) ||
    `Découvrez ${movie.title} sur Histyra.`;

  const siteUrl = getSiteUrl();

  const canonicalUrl = siteUrl
    ? new URL(`/films/${slug}`, siteUrl).toString()
    : undefined;

  const image = movie.backdropUrl || movie.posterUrl || undefined;

  return {
    title: `${title} | Histyra`,
    description,
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,

    openGraph: {
      type: "video.movie",
      title,
      description,
      url: canonicalUrl,
      siteName: "Histyra",
      images: image ? [{ url: image, alt: movie.title }] : [],
    },

    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function FilmDetailPage({ params }: PageProps) {
  await connection();

  const { slug } = await params;

  // 1. Vérifier l'authentification avant de charger le détail du film.
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    const loginParams = new URLSearchParams({
      callbackURL: `/films/${slug}`,
      reason: "auth_required",
    });

    redirect(`/connexion?${loginParams.toString()}`);
  }

  // 2. Récupérer le film publié.
  const now = new Date();

  const movie = await prisma.movie.findFirst({
    where: getPublishedMovieWhere(slug, now),

    select: {
      id: true,
      title: true,
      slug: true,
      synopsis: true,
      posterUrl: true,
      backdropUrl: true,
      releaseYear: true,
      duration: true,
      type: true,
      categoryId: true,

      category: {
        select: {
          name: true,
        },
      },

      videoSources: {
        orderBy: [
          { isPrimary: "desc" },
          { sortOrder: "asc" },
          { createdAt: "asc" },
        ],

        select: {
          id: true,
          label: true,
          url: true,
          provider: true,
          isPrimary: true,
          sortOrder: true,
        },
      },

      reviews: {
        where: {
          status: "PUBLISHED",
          OR: [
            { publishedAt: null },
            { publishedAt: { lte: now } },
          ],
        },

        orderBy: {
          createdAt: "desc",
        },

        take: 10,

        select: {
          id: true,
          title: true,
          content: true,
          rating: true,
          createdAt: true,
        },
      },
    },
  });

  if (!movie) {
    notFound();
  }

  // 3. Films de la même catégorie.
  const similarMovies = movie.categoryId
    ? await prisma.movie.findMany({
        where: {
          categoryId: movie.categoryId,
          id: { not: movie.id },
          status: "PUBLISHED",
          OR: [
            { publishedAt: null },
            { publishedAt: { lte: now } },
          ],
        },

        orderBy: [
          { featured: "desc" },
          { publishedAt: "desc" },
          { createdAt: "desc" },
        ],

        take: 4,

        select: {
          id: true,
          title: true,
          slug: true,
          posterUrl: true,
          releaseYear: true,
          type: true,
          duration: true,

          category: {
            select: {
              name: true,
            },
          },
        },
      })
    : [];

  const durationLabel = formatDuration(movie.duration);
  const siteUrl = getSiteUrl();

  const canonicalUrl = siteUrl
    ? new URL(`/films/${movie.slug}`, siteUrl).toString()
    : undefined;

  // 4. Données structurées SEO.
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movie.title,
    description: movie.synopsis,

    dateCreated: movie.releaseYear
      ? String(movie.releaseYear)
      : undefined,

    image: movie.posterUrl || movie.backdropUrl || undefined,
    genre: movie.category?.name || undefined,
    url: canonicalUrl,
  };

  const hasAdConfig = Boolean(
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT &&
      process.env.NEXT_PUBLIC_ADSENSE_SLOT_FILM
  );

  return (
    <main className="min-h-screen bg-[#080b14] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      {/* Présentation du film */}
      <section className="relative isolate overflow-hidden">
        {movie.backdropUrl && (
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-20 bg-cover bg-center"
            style={{
              backgroundImage: `url("${movie.backdropUrl.replace(
                /["\\]/g,
                ""
              )}")`,
            }}
          />
        )}

        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-[#080b14] via-[#080b14]/90 to-[#080b14]/50"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-t from-[#080b14] via-transparent to-black/30"
        />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <nav
            aria-label="Fil d'Ariane"
            className="mb-8 flex flex-wrap items-center gap-2 text-sm text-gray-300"
          >
            <Link href="/" className="transition hover:text-white">
              Accueil
            </Link>

            <span aria-hidden="true">/</span>

            <Link href="/films" className="transition hover:text-white">
              Films
            </Link>

            <span aria-hidden="true">/</span>

            <span
              aria-current="page"
              className="max-w-[220px] truncate text-white"
            >
              {movie.title}
            </span>
          </nav>

          <div className="grid items-center gap-8 md:grid-cols-[280px_1fr] lg:grid-cols-[340px_1fr] lg:gap-12">
            <div className="mx-auto w-full max-w-[280px] md:max-w-none">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl">
                {movie.posterUrl ? (
                  <img
                    src={movie.posterUrl}
                    alt={`Affiche du film ${movie.title}`}
                    className="aspect-[2/3] w-full object-cover"
                    fetchPriority="high"
                  />
                ) : (
                  <div className="flex aspect-[2/3] items-center justify-center bg-white/5 p-6 text-center text-gray-400">
                    Affiche indisponible
                  </div>
                )}
              </div>
            </div>

            <div className="py-4">
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                  {movie.type === "SERIES" ? "Série" : "Film"}
                </span>

                {movie.category?.name && (
                  <span className="rounded-full border border-white/20 bg-black/20 px-3 py-1 text-xs text-gray-200">
                    {movie.category.name}
                  </span>
                )}
              </div>

              <h1 className="max-w-4xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-6xl">
                {movie.title}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-300">
                {movie.releaseYear && <span>{movie.releaseYear}</span>}

                {durationLabel && <span>{durationLabel}</span>}

                <span>
                  {movie.reviews.length} critique
                  {movie.reviews.length > 1 ? "s" : ""}
                </span>
              </div>

              <h2 className="mt-7 text-lg font-semibold">Synopsis</h2>

              <p className="mt-2 max-w-3xl whitespace-pre-line text-sm leading-7 text-gray-300 sm:text-base">
                {movie.synopsis}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#lecture"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
                >
                  <span aria-hidden="true">▶</span>
                  Regarder maintenant
                </Link>

                <Link
                  href="/films"
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                >
                  Retour aux films
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lecteur vidéo */}
      <section
        id="lecture"
        className="mx-auto max-w-7xl scroll-mt-24 px-4 py-10 sm:px-6 lg:px-8"
      >
        <div className="mb-5">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Regarder {movie.title}
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            Sélectionnez une source vidéo si plusieurs sources sont disponibles.
          </p>
        </div>

        {movie.videoSources.length > 0 ? (
          <VideoSourcePlayer sources={movie.videoSources} />
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-lg font-semibold">Vidéo indisponible</p>

            <p className="mt-2 text-sm text-gray-400">
              Aucune source vidéo n'est disponible pour le moment.
              Veuillez revenir plus tard.
            </p>
          </div>
        )}
      </section>

      {/* Espace publicitaire */}
      <section
        aria-label="Publicité"
        className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8"
      >
        <div className="mx-auto flex min-h-[100px] max-w-4xl items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
          {hasAdConfig ? (
            <p className="text-xs text-gray-500">
              Intégrez ici votre composant publicitaire AdSense.
            </p>
          ) : (
            <p className="text-xs text-gray-500">Espace publicitaire</p>
          )}
        </div>
      </section>

      {/* Critiques */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">
              Critiques des spectateurs
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Découvrez les avis publiés sur ce titre.
            </p>
          </div>

          <Link
            href="/critiques"
            className="text-sm font-semibold text-red-400 transition hover:text-red-300"
          >
            Toutes les critiques →
          </Link>
        </div>

        {movie.reviews.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {movie.reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="font-semibold">
                    {review.title || "Avis d'un spectateur"}
                  </h3>

                  <span className="rounded-lg bg-yellow-500/10 px-3 py-1 text-sm font-semibold text-yellow-300">
                    ★ {review.rating}/10
                  </span>
                </div>

                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-300">
                  {review.content}
                </p>

                <p className="mt-4 text-xs text-gray-500">
                  {new Intl.DateTimeFormat("fr-FR", {
                    dateStyle: "medium",
                  }).format(review.createdAt)}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <p className="font-medium">
              Aucune critique publiée pour le moment.
            </p>

            <p className="mt-2 text-sm text-gray-400">
              Revenez plus tard pour découvrir les avis des spectateurs.
            </p>
          </div>
        )}
      </section>

      {/* Films similaires */}
      {similarMovies.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Films similaires
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              D'autres titres que vous pourriez apprécier.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {similarMovies.map((similar) => (
              <Link
                key={similar.id}
                href={`/films/${similar.slug}`}
                className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition hover:-translate-y-1 hover:border-white/20"
              >
                <div className="aspect-[2/3] overflow-hidden bg-white/5">
                  {similar.posterUrl ? (
                    <img
                      src={similar.posterUrl}
                      alt={`Affiche de ${similar.title}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-4 text-center text-sm text-gray-500">
                      Affiche indisponible
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <h3 className="line-clamp-2 font-semibold transition group-hover:text-red-400">
                    {similar.title}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                    {similar.releaseYear && <span>{similar.releaseYear}</span>}

                    {similar.duration && (
                      <span>{formatDuration(similar.duration)}</span>
                    )}

                    {similar.category?.name && (
                      <span>{similar.category.name}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <Link
          href="/films"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-300 transition hover:text-white"
        >
          ← Retour au catalogue
        </Link>
      </div>
    </main>
  );
}
