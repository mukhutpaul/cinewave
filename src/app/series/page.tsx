import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Séries",
  description:
    "Découvre les séries disponibles sur CineWave.",
};

export default async function SeriesPage() {
  await connection();

  const now = new Date();

  const series = await prisma.movie.findMany({
    where: {
      type: "SERIES",
      status: "PUBLISHED",
      OR: [
        { publishedAt: null },
        { publishedAt: { lte: now } },
      ],
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 48,
    select: {
      id: true,
      title: true,
      slug: true,
      posterUrl: true,
      releaseYear: true,
      synopsis: true,
    },
  });

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-5 py-12 md:px-8">
      <p className="text-sm font-bold uppercase tracking-widest text-rose-400">
        Le catalogue CineWave
      </p>

      <h1 className="mt-3 text-4xl font-black sm:text-5xl">
        Séries à découvrir
      </h1>

      <p className="mt-4 max-w-2xl leading-7 text-slate-400">
        Explore des univers captivants et trouve ta prochaine série.
      </p>

      {series.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-white/15 p-10 text-center">
          <p className="text-5xl">📺</p>
          <h2 className="mt-4 text-xl font-bold">
            Les séries arrivent bientôt
          </h2>
          <p className="mt-2 text-slate-400">
            Les séries publiées apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {series.map((item) => (
            <Link
              key={item.id}
              href={`/series/${item.slug}`}
              className="group min-w-0"
            >
              <div className="aspect-[2/3] overflow-hidden rounded-xl border border-white/10 bg-slate-900">
                {item.posterUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.posterUrl}
                    alt={`Affiche de ${item.title}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="poster-gradient flex h-full flex-col items-center justify-center p-4 text-center">
                    <span className="text-4xl">📺</span>
                    <span className="mt-3 font-bold">{item.title}</span>
                  </div>
                )}
              </div>

              <h2 className="mt-3 font-bold group-hover:text-rose-400">
                {item.title}
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                {item.releaseYear ?? "Année inconnue"}
              </p>
            </Link>
          ))}
        </div>
      )}

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