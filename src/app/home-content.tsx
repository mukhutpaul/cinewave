
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function HomeContent() {
  const now = new Date();

  const publicationFilter = {
    status: "PUBLISHED" as const,
    OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
  };

  const [featured, movies, reviews, articles] = await Promise.all([
    prisma.movie.findFirst({
      where: {
        ...publicationFilter,
        featured: true,
      },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    }),

    prisma.movie.findMany({
      where: publicationFilter,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 6,
      select: {
        id: true,
        title: true,
        slug: true,
        posterUrl: true,
        releaseYear: true,
        type: true,
      },
    }),

    prisma.review.findMany({
      where: {
        status: "PUBLISHED",
        OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        authorName: true,
        movie: {
          select: { title: true },
        },
      },
    }),

    prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImageUrl: true,
        authorName: true,
      },
    }),
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative isolate mx-auto mt-6 flex min-h-[480px] max-w-7xl items-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-indigo-950 to-rose-950 px-6 py-16 sm:mx-5 sm:px-12 md:min-h-[540px] md:px-16">
        <div
          aria-hidden="true"
          className="absolute -right-16 top-0 -z-10 h-80 w-80 rounded-full bg-rose-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-1/3 -z-10 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl"
        />

        <div className="max-w-3xl">
          <div className="badge badge-outline mb-6 border-rose-400/50 px-4 py-4 text-rose-300">
            Le magazine cinéma
          </div>

          <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Le cinéma mérite
            <span className="block text-rose-400">un autre regard.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
            Explore les films, découvre de nouvelles séries et plonge dans
            des critiques indépendantes et des histoires qui méritent d’être
            racontées.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/films" className="btn btn-error text-white">
              Explorer les films
            </Link>
            <Link
              href="/critiques"
              className="btn border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              Lire les critiques
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-8 text-sm text-slate-400">
            <div>
              <p className="text-2xl font-bold text-white">{movies.length}</p>
              <p>Films et séries</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{reviews.length}</p>
              <p>Critiques récentes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{articles.length}</p>
              <p>Articles récents</p>
            </div>
          </div>
        </div>
      </section>

      {/* Emplacement publicitaire */}
      <div
        className="mx-auto my-8 flex min-h-[90px] max-w-5xl items-center justify-center px-5"
        aria-label="Espace publicitaire"
      >
        <span className="text-xs text-slate-600">Espace publicitaire</span>
      </div>

      {/* Film à la une */}
      {featured && (
        <section className="mx-auto max-w-7xl px-5 py-12 md:px-8">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-rose-400">
              À découvrir
            </p>
            <h2 className="mt-2 text-3xl font-bold">À la une</h2>
          </div>

          <div className="grid overflow-hidden rounded-3xl border border-white/10 bg-slate-900 md:grid-cols-2">
            <div className="poster-gradient flex min-h-64 items-center justify-center p-8">
              {featured.posterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featured.posterUrl}
                  alt={`Affiche de ${featured.title}`}
                  loading="lazy"
                  className="max-h-[420px] rounded-xl object-contain shadow-2xl"
                />
              ) : (
                <div className="text-center">
                  <span className="text-6xl">🎬</span>
                  <p className="mt-4 text-xl font-bold">{featured.title}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center p-7 sm:p-10">
              <div className="badge badge-error mb-4 w-fit">
                Notre sélection
              </div>
              <h3 className="text-3xl font-black sm:text-4xl">
                {featured.title}
              </h3>
              <p className="mt-3 text-sm text-slate-400">
                {featured.releaseYear ?? "Année inconnue"}
                {" · "}
                {featured.type === "SERIES" ? "Série" : "Film"}
                {featured.duration ? ` · ${featured.duration} min` : ""}
              </p>
              <p className="mt-5 whitespace-pre-line leading-7 text-slate-300">
                {featured.synopsis}
              </p>
              <Link
                href={`/films/${featured.slug}`}
                className="btn btn-error mt-7 w-fit text-white"
              >
                Découvrir
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Films récents */}
      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-rose-400">
              À l’affiche
            </p>
            <h2 className="mt-2 text-3xl font-bold">Films récents</h2>
          </div>
          <Link href="/films" className="link link-hover text-rose-400">
            Tout voir →
          </Link>
        </div>

        {movies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center">
            <p className="text-4xl">🍿</p>
            <h3 className="mt-4 text-xl font-bold">
              Le grand écran se prépare
            </h3>
            <p className="mt-2 text-slate-400">
              Les premiers films seront bientôt disponibles.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {movies.map((movie) => (
              <Link
                key={movie.id}
                href={`/films/${movie.slug}`}
                className="group"
              >
                <div className="aspect-[2/3] overflow-hidden rounded-xl border border-white/10 bg-slate-900 transition group-hover:border-rose-500/60">
                  {movie.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={movie.posterUrl}
                      alt={`Affiche de ${movie.title}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="poster-gradient flex h-full flex-col items-center justify-center p-3 text-center">
                      <span className="text-4xl">🎞️</span>
                      <span className="mt-3 text-sm font-bold">
                        {movie.title}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="mt-3 font-bold transition group-hover:text-rose-400">
                  {movie.title}
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  {movie.releaseYear ?? "Année inconnue"}
                  {" · "}
                  {movie.type === "SERIES" ? "Série" : "Film"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Critiques */}
      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-rose-400">
              Le regard de la rédaction
            </p>
            <h2 className="mt-2 text-3xl font-bold">Critiques récentes</h2>
          </div>
          <Link href="/critiques" className="link link-hover text-rose-400">
            Toutes les critiques →
          </Link>
        </div>

        {reviews.length === 0 ? (
          <p className="rounded-2xl bg-white/[0.03] p-6 text-slate-400">
            Les premières critiques seront bientôt publiées.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="card border border-white/10 bg-slate-900 transition hover:border-rose-500/40"
              >
                <div className="card-body">
                  {review.movie && (
                    <p className="text-sm text-rose-400">
                      {review.movie.title}
                    </p>
                  )}
                  <h3 className="card-title">{review.title}</h3>
                  <p className="line-clamp-3 leading-7 text-slate-300">
                    {review.excerpt}
                  </p>
                  <p className="mt-3 text-xs text-slate-400">
                    Par {review.authorName}
                  </p>
                  <div className="card-actions mt-3">
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

      {/* Publicité entre les sections éditoriales */}
      <div
        className="mx-auto my-8 flex min-h-[90px] max-w-5xl items-center justify-center px-5"
        aria-label="Espace publicitaire"
      >
        <span className="text-xs text-slate-600">Espace publicitaire</span>
      </div>

      {/* Actualités */}
      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-rose-400">
              Magazine
            </p>
            <h2 className="mt-2 text-3xl font-bold">
              Actualités et dossiers
            </h2>
          </div>
          <Link href="/actualites" className="link link-hover text-rose-400">
            Tout lire →
          </Link>
        </div>

        {articles.length === 0 ? (
          <p className="rounded-2xl bg-white/[0.03] p-6 text-slate-400">
            Les premières actualités seront bientôt disponibles.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {articles.map((article) => (
              <article
                key={article.id}
                className="card overflow-hidden border border-white/10 bg-slate-900"
              >
                {article.coverImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={article.coverImageUrl}
                    alt={`Illustration de ${article.title}`}
                    loading="lazy"
                    className="h-48 w-full object-cover"
                  />
                )}

                <div className="card-body">
                  <h3 className="card-title">{article.title}</h3>
                  <p className="line-clamp-3 leading-7 text-slate-300">
                    {article.excerpt}
                  </p>
                  <p className="text-xs text-slate-400">
                    Par {article.authorName}
                  </p>
                  <div className="card-actions mt-3">
                    <Link
                      href={`/actualites/${article.slug}`}
                      className="btn btn-ghost btn-sm text-rose-400"
                    >
                      Lire l’article →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Appel à l'inscription */}
      <section className="mx-5 mb-12 rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950 to-rose-950 px-6 py-12 sm:px-12 md:mx-auto md:max-w-7xl">
        <p className="text-sm font-bold uppercase tracking-widest text-rose-300">
          Bienvenue chez Histyra
        </p>
        <h2 className="mt-3 max-w-2xl text-3xl font-black sm:text-4xl">
          Chaque film mérite qu’on raconte son histoire.
        </h2>
        <p className="mt-4 max-w-xl leading-7 text-slate-300">
          Rejoins notre univers pour explorer le cinéma, découvrir des pépites
          et partager ta passion du grand écran.
        </p>
        <Link href="/inscription" className="btn btn-error mt-7 text-white">
          Rejoindre Histyra
        </Link>
      </section>
    </div>
  );
}
