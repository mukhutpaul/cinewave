
import { connection } from "next/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function HomeContent() {
  await connection();

  const now = new Date();

  const publicationFilter = {
    status: "PUBLISHED" as const,
    OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
  };

  const [articles, stories] = await Promise.all([
    prisma.article.findMany({
      where: publicationFilter,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 6,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImageUrl: true,
        authorName: true,
      },
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
  ]);

  return (
    <main className="min-h-screen">
      {/* Bannière principale */}
      <section className="relative isolate mx-auto mt-6 flex min-h-[480px] max-w-7xl items-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-indigo-950 to-rose-950 px-6 py-16 sm:mx-5 sm:px-12 md:px-16">
        <div
          aria-hidden="true"
          className="absolute -right-16 top-0 -z-10 h-80 w-80 rounded-full bg-rose-500/20 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="absolute bottom-0 left-1/3 -z-10 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl"
        />

        <div className="max-w-3xl">
          <span className="badge badge-outline mb-6 border-rose-400/50 px-4 py-4 text-rose-300">
            Histoires · Articles · Découvertes
          </span>

          <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Chaque histoire
            <span className="block text-rose-400">
              mérite d’être racontée.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
            Bienvenue sur Histyra. Découvrez des articles
            intéressants, des histoires captivantes et des
            publications qui éveillent la curiosité et
            nourrissent l’imagination.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/actualites" className="btn btn-error text-white">
              Lire les articles
            </Link>

            <Link
              href="/films"
              className="btn border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              Découvrir les histoires
            </Link>
          </div>

          <div className="mt-10 flex gap-8 text-sm text-slate-400">
            <div>
              <p className="text-2xl font-bold text-white">
                {articles.length}
              </p>
              <p>Articles</p>
            </div>

            <div>
              <p className="text-2xl font-bold text-white">
                {stories.length}
              </p>
              <p>Histoires</p>
            </div>
          </div>
        </div>
      </section>

      {/* Espace publicitaire */}
      <div
        className="mx-auto my-8 flex min-h-[90px] max-w-5xl items-center justify-center px-5"
        aria-label="Espace publicitaire"
      >
        <span className="text-xs text-slate-600">
          Espace publicitaire
        </span>
      </div>

      {/* Articles */}
      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-rose-400">
              Le magazine Histyra
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Derniers articles
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-slate-400">
              Des idées, des informations et des sujets à
              explorer à travers nos publications.
            </p>
          </div>

          <Link
            href="/actualites"
            className="link link-hover text-rose-400"
          >
            Tout lire →
          </Link>
        </div>

        {articles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center">
            <p className="text-4xl">✍️</p>

            <h3 className="mt-4 text-xl font-bold">
              Les articles arrivent bientôt
            </h3>

            <p className="mt-2 text-slate-400">
              De nouvelles publications seront bientôt
              disponibles sur Histyra.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {articles.map((article) => (
              <article
                key={article.id}
                className="card overflow-hidden border border-white/10 bg-slate-900 transition hover:border-rose-500/40"
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
                  <p className="text-xs font-bold uppercase tracking-widest text-rose-400">
                    Article
                  </p>

                  <h3 className="card-title">
                    {article.title}
                  </h3>

                  {article.excerpt && (
                    <p className="line-clamp-3 leading-7 text-slate-300">
                      {article.excerpt}
                    </p>
                  )}

                  <p className="text-xs text-slate-400">
                    Par {article.authorName}
                  </p>

                  <div className="card-actions mt-3">
                    <Link
                      href={`/actualites/${article.slug}`}
                      className="btn btn-outline btn-sm border-rose-500 text-rose-400"
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

      {/* Histoires */}
      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-rose-400">
              À découvrir
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Nos histoires
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-slate-400">
              Explorez des univers, des récits et des
              histoires qui méritent votre attention.
            </p>
          </div>

          <Link
            href="/films"
            className="link link-hover text-rose-400"
          >
            Tout explorer →
          </Link>
        </div>

        {stories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center">
            <p className="text-4xl">📚</p>

            <h3 className="mt-4 text-xl font-bold">
              De nouvelles histoires se préparent
            </h3>

            <p className="mt-2 text-slate-400">
              Revenez bientôt pour découvrir nos prochaines
              publications.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {stories.map((story) => (
              <Link
                key={story.id}
                href={`/films/${story.slug}`}
                className="group"
              >
                <div className="aspect-[2/3] overflow-hidden rounded-xl border border-white/10 bg-slate-900 transition group-hover:border-rose-500/60">
                  {story.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={story.posterUrl}
                      alt={`Illustration de ${story.title}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-indigo-950 to-rose-950 p-3 text-center">
                      <span className="text-4xl">📖</span>
                      <span className="mt-3 text-sm font-bold">
                        {story.title}
                      </span>
                    </div>
                  )}
                </div>

                <h3 className="mt-3 font-bold transition group-hover:text-rose-400">
                  {story.title}
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  {story.releaseYear ?? "À découvrir"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Prochaines publications */}
      <section className="mx-5 mb-12 rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950 to-rose-950 px-6 py-12 sm:px-12 md:mx-auto md:max-w-7xl">
        <p className="text-sm font-bold uppercase tracking-widest text-rose-300">
          Bientôt sur Histyra
        </p>

        <h2 className="mt-3 max-w-2xl text-3xl font-black sm:text-4xl">
          De nouvelles histoires restent à raconter.
        </h2>

        <p className="mt-4 max-w-xl leading-7 text-slate-300">
          Des articles inédits, des récits captivants et
          de nouvelles découvertes viendront enrichir
          Histyra. Revenez régulièrement pour ne manquer
          aucune publication.
        </p>

        <Link
          href="/inscription"
          className="btn btn-error mt-7 text-white"
        >
          Rejoindre Histyra
        </Link>
      </section>
    </main>
  );
}
