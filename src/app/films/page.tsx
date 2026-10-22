
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Histoires et découvertes | HISTYRA",
  description:
    "Explore les histoires, les récits et les univers à découvrir sur HISTYRA. De nouvelles lectures et publications arrivent régulièrement.",
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

  const stories = await prisma.movie.findMany({
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
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-10 md:px-8">
      {/* Introduction */}
      <section className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-indigo-950 to-rose-950 p-7 sm:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 -z-10 h-72 w-72 rounded-full bg-rose-500/20 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 left-1/3 -z-10 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl"
        />

        <p className="text-sm font-bold uppercase tracking-[0.2em] text-rose-400">
          L'univers HISTYRA
        </p>

        <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
          Des histoires à découvrir,
          <span className="block text-rose-400">
            des univers à explorer.
          </span>
        </h1>

        <p className="mt-5 max-w-2xl leading-7 text-slate-300 sm:text-lg">
          Bienvenue dans notre espace de découverte. Explore des récits,
          plonge dans de nouveaux univers et prépare-toi à découvrir
          les histoires qui seront progressivement publiées sur HISTYRA.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#catalogue"
            className="btn btn-error text-white"
          >
            Explorer les histoires
          </a>

          <Link
            href="/actualites"
            className="btn border-white/20 bg-white/5 text-white hover:bg-white/10"
          >
            Lire les articles
          </Link>
        </div>
      </section>

      {/* Recherche */}
      <section className="py-10" id="catalogue">
        <div className="mb-5">
          <p className="text-sm font-bold uppercase tracking-widest text-rose-400">
            Trouve ta prochaine lecture
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Explorer les publications
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Recherche un titre ou affine les résultats pour trouver
            un univers qui te correspond.
          </p>
        </div>

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
            placeholder="Rechercher une histoire..."
            aria-label="Rechercher une histoire"
            className="input input-bordered w-full border-white/15 bg-slate-950"
          />

          <select
            name="type"
            defaultValue={type ?? ""}
            aria-label="Type de contenu"
            className="select select-bordered w-full border-white/15 bg-slate-950"
          >
            <option value="">Tous les univers</option>
            <option value="MOVIE">Histoires au format film</option>
            <option value="SERIES">Histoires en série</option>
          </select>

          <input
            type="number"
            name="year"
            defaultValue={year ?? ""}
            min={1888}
            max={2200}
            placeholder="Année"
            aria-label="Année de publication"
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

      {/* Catalogue */}
      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-rose-400">
              À découvrir
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Nos univers et nos récits
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              {stories.length} résultat{stories.length !== 1 ? "s" : ""}
              {stories.length === 48
                ? " · Affichage limité à 48 contenus"
                : ""}
            </p>
          </div>
        </div>

        {stories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center">
            <p className="text-5xl">📚</p>

            <h3 className="mt-4 text-xl font-bold">
              De nouvelles histoires se préparent
            </h3>

            <p className="mx-auto mt-2 max-w-lg leading-7 text-slate-400">
              Aucune publication ne correspond à ta recherche pour
              le moment. De nouveaux contenus viendront enrichir
              l'univers HISTYRA.
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href="/films" className="btn btn-outline">
                Voir toutes les histoires
              </Link>

              <Link href="/actualites" className="btn btn-error text-white">
                Découvrir les articles
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {stories.map((story) => (
              <article key={story.id} className="group min-w-0">
                <Link href={`/films/${story.slug}`} className="block">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/10 bg-slate-900 transition group-hover:border-rose-500/60">
                    {story.posterUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={story.posterUrl}
                        alt={`Illustration de ${story.title}`}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="poster-gradient flex h-full flex-col items-center justify-center p-4 text-center">
                        <span className="text-4xl">📖</span>

                        <span className="mt-3 font-bold">
                          {story.title}
                        </span>
                      </div>
                    )}

                    {story.featured && (
                      <span className="badge badge-error absolute left-2 top-2 text-white">
                        À découvrir
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 font-bold transition group-hover:text-rose-400">
                    {story.title}
                  </h3>
                </Link>

                <p className="mt-1 text-xs text-slate-400">
                  {story.releaseYear ?? "Nouvelle découverte"}
                  {" · "}
                  {story.type === "SERIES" ? "Série" : "Récit en film"}
                </p>

                {story.category && (
                  <p className="mt-1 text-xs text-slate-500">
                    {story.category.name}
                  </p>
                )}

                {story.duration != null && (
                  <p className="mt-1 text-xs text-slate-500">
                    {story.duration} min
                  </p>
                )}

                {story.synopsis && (
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">
                    {story.synopsis}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Espace publicitaire */}
      <div
        className="my-12 flex min-h-[90px] items-center justify-center border-y border-white/5"
        aria-label="Espace publicitaire"
      >
        <span className="text-xs text-slate-600">
          Espace publicitaire
        </span>
      </div>

      {/* Prochaines publications */}
      <section className="relative isolate mb-10 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950 to-rose-950 p-7 sm:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-10 -z-10 h-64 w-64 rounded-full bg-rose-500/15 blur-3xl"
        />

        <p className="text-sm font-bold uppercase tracking-widest text-rose-300">
          Bientôt sur HISTYRA
        </p>

        <h2 className="mt-3 max-w-2xl text-3xl font-black sm:text-4xl">
          Chaque publication ouvre la porte à un nouvel univers.
        </h2>

        <p className="mt-4 max-w-2xl leading-7 text-slate-300">
          De nouvelles histoires et de nouveaux contenus seront
          progressivement proposés. En attendant, découvre nos articles
          et reviens explorer les prochaines publications.
        </p>

        <Link
          href="/actualites"
          className="btn btn-error mt-7 text-white"
        >
          Explorer les articles →
        </Link>
      </section>
    </main>
  );
}
