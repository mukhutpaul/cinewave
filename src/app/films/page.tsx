
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Films",
  description:
    "Explore les films sur Histyra : affiches, synopsis, années de sortie et découvertes cinéma.",
};

type FilmsPageProps = {
  searchParams: Promise<{
    q?: string;
    type?: string;
    year?: string;
  }>;
};

type ContentFilter = "MOVIE" | "SERIES";

function FilmsLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-10 md:px-8">
      <div className="h-56 animate-pulse rounded-3xl bg-slate-900" />

      <div className="mt-10 h-16 animate-pulse rounded-2xl bg-slate-900" />

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }, (_, index) => (
          <div
            key={index}
            className="aspect-[2/3] animate-pulse rounded-xl bg-slate-900"
          />
        ))}
      </div>
    </main>
  );
}

export default function FilmsPage(props: FilmsPageProps) {
  return (
    <Suspense fallback={<FilmsLoading />}>
      <FilmsContent searchParams={props.searchParams} />
    </Suspense>
  );
}

async function FilmsContent({ searchParams }: FilmsPageProps) {
  await connection();

  const params = await searchParams;

  const q = params.q?.trim().slice(0, 100) ?? "";

  const type: ContentFilter | undefined =
    params.type === "MOVIE" || params.type === "SERIES"
      ? params.type
      : undefined;

  const parsedYear = Number(params.year);

  const year =
    params.year &&
    /^\d{4}$/.test(params.year) &&
    parsedYear >= 1888 &&
    parsedYear <= 2200
      ? parsedYear
      : undefined;

  const now = new Date();

  // Construction progressive du filtre pour conserver
  // un typage Prisma cohérent.
  const filters = [
    {
      OR: [
        { publishedAt: null },
        { publishedAt: { lte: now } },
      ],
    },
    ...(q
      ? [
          {
            OR: [
              {
                title: {
                  contains: q,
                  mode: "insensitive" as const,
                },
              },
              {
                synopsis: {
                  contains: q,
                  mode: "insensitive" as const,
                },
              },
            ],
          },
        ]
      : []),
    ...(type ? [{ type }] : []),
    ...(year ? [{ releaseYear: year }] : []),
  ];

  const movies = await prisma.movie.findMany({
    where: {
      status: "PUBLISHED",
      AND: filters,
    },
    orderBy: [
      { featured: "desc" },
      { publishedAt: "desc" },
      { createdAt: "desc" },
    ],
    take: 48,
    select: {
      id: true,
      title: true,
      slug: true,
      synopsis: true,
      posterUrl: true,
      releaseYear: true,
      duration: true,
      type: true,
      featured: true,
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-5 py-10 md:px-8">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-indigo-950 to-rose-950 p-7 sm:p-12">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-rose-400">
          Le catalogue Histyra
        </p>

        <h1 className="mt-3 text-4xl font-black sm:text-5xl">
          Explore le cinéma.
        </h1>

        <p className="mt-4 max-w-2xl leading-7 text-slate-300">
          Des grands classiques aux découvertes récentes, trouve ton
          prochain film ou ta prochaine série.
        </p>
      </section>

      <section className="py-10">
        <form
          action="/films"
          method="GET"
          className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900 p-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <input
            type="search"
            name="q"
            defaultValue={q}
            maxLength={100}
            placeholder="Rechercher un titre..."
            aria-label="Rechercher un film ou une série"
            className="input input-bordered w-full border-white/15 bg-slate-950"
          />

          <select
            name="type"
            defaultValue={type ?? ""}
            aria-label="Type de contenu"
            className="select select-bordered w-full border-white/15 bg-slate-950"
          >
            <option value="">Films et séries</option>
            <option value="MOVIE">Films uniquement</option>
            <option value="SERIES">Séries uniquement</option>
          </select>

          <input
            type="number"
            name="year"
            defaultValue={year ?? ""}
            min={1888}
            max={2200}
            placeholder="Année de sortie"
            aria-label="Année de sortie"
            className="input input-bordered w-full border-white/15 bg-slate-950"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              className="btn btn-error flex-1 text-white"
            >
              Rechercher
            </button>

            <Link href="/films" className="btn btn-ghost">
              Effacer
            </Link>
          </div>
        </form>
      </section>

      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">Notre catalogue</h2>

            <p className="mt-1 text-sm text-slate-400">
              {movies.length} résultat{movies.length !== 1 ? "s" : ""}
              {movies.length === 48
                ? " · Affichage limité à 48 contenus"
                : ""}
            </p>
          </div>
        </div>

        {movies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center">
            <p className="text-5xl">🍿</p>

            <h3 className="mt-4 text-xl font-bold">
              Aucun contenu trouvé
            </h3>

            <p className="mt-2 text-slate-400">
              Essaie un autre titre, une autre année ou un autre filtre.
            </p>

            <Link href="/films" className="btn btn-outline mt-5">
              Voir tout le catalogue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {movies.map((movie) => (
              <article key={movie.id} className="group min-w-0">
                <Link href={`/films/${movie.slug}`} className="block">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/10 bg-slate-900 transition group-hover:border-rose-500/60">
                    {movie.posterUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={movie.posterUrl}
                        alt={`Affiche de ${movie.title}`}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="poster-gradient flex h-full flex-col items-center justify-center p-4 text-center">
                        <span className="text-4xl">🎬</span>

                        <span className="mt-3 font-bold">
                          {movie.title}
                        </span>
                      </div>
                    )}

                    {movie.featured && (
                      <span className="badge badge-error absolute left-2 top-2 text-white">
                        À la une
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 font-bold transition group-hover:text-rose-400">
                    {movie.title}
                  </h3>
                </Link>

                <p className="mt-1 text-xs text-slate-400">
                  {movie.releaseYear ?? "Année inconnue"}
                  {" · "}
                  {movie.type === "SERIES" ? "Série" : "Film"}
                </p>

                {movie.category && (
                  <p className="mt-1 text-xs text-slate-500">
                    {movie.category.name}
                  </p>
                )}

                {movie.duration && (
                  <p className="mt-1 text-xs text-slate-500">
                    {movie.duration} min
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <div
        className="my-12 flex min-h-[90px] items-center justify-center border-y border-white/5"
        aria-label="Espace publicitaire"
      >
        <span className="text-xs text-slate-600">
          Espace publicitaire
        </span>
      </div>
    </div>
  );
}
