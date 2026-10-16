
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";

export default async function HomeContent() {
  await connection();

  const t = await getTranslations("Home");
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
            {t("tagline")}
          </div>

          <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            {t("heroLine1")}
            <span className="block text-rose-400">
              {t("heroLine2")}
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
            {t("heroDescription")}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/films" className="btn btn-error text-white">
              {t("exploreFilms")}
            </Link>

            <Link
              href="/critiques"
              className="btn border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              {t("readReviews")}
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-8 text-sm text-slate-400">
            <div>
              <p className="text-2xl font-bold text-white">
                {movies.length}
              </p>
              <p>{t("filmsAndSeries")}</p>
            </div>

            <div>
              <p className="text-2xl font-bold text-white">
                {reviews.length}
              </p>
              <p>{t("recentReviewsCount")}</p>
            </div>

            <div>
              <p className="text-2xl font-bold text-white">
                {articles.length}
              </p>
              <p>{t("recentArticlesCount")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Emplacement publicitaire */}
      <div
        className="mx-auto my-8 flex min-h-[90px] max-w-5xl items-center justify-center px-5"
        aria-label={t("adSpace")}
      >
        <span className="text-xs text-slate-600">
          {t("adSpace")}
        </span>
      </div>

      {/* Film à la une */}
      {featured && (
        <section className="mx-auto max-w-7xl px-5 py-12 md:px-8">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-rose-400">
              {t("discover")}
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {t("featured")}
            </h2>
          </div>

          <div className="grid overflow-hidden rounded-3xl border border-white/10 bg-slate-900 md:grid-cols-2">
            <div className="poster-gradient flex min-h-64 items-center justify-center p-8">
              {featured.posterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featured.posterUrl}
                  alt={t("posterAlt", { title: featured.title })}
                  loading="lazy"
                  className="max-h-[420px] rounded-xl object-contain shadow-2xl"
                />
              ) : (
                <div className="text-center">
                  <span className="text-6xl">🎬</span>
                  <p className="mt-4 text-xl font-bold">
                    {featured.title}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center p-7 sm:p-10">
              <div className="badge badge-error mb-4 w-fit">
                {t("ourSelection")}
              </div>

              <h3 className="text-3xl font-black sm:text-4xl">
                {featured.title}
              </h3>

              <p className="mt-3 text-sm text-slate-400">
                {featured.releaseYear ?? t("unknownYear")}
                {" · "}
                {featured.type === "SERIES"
                  ? t("series")
                  : t("film")}
                {"duration" in featured &&
                typeof featured.duration === "number"
                  ? ` · ${featured.duration} ${t("minutes")}`
                  : ""}
              </p>

              {featured.synopsis && (
                <p className="mt-5 whitespace-pre-line leading-7 text-slate-300">
                  {featured.synopsis}
                </p>
              )}

              <Link
                href={`/films/${featured.slug}`}
                className="btn btn-error mt-7 w-fit text-white"
              >
                {t("discoverMore")}
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
              {t("onScreen")}
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {t("latestFilms")}
            </h2>
          </div>

          <Link href="/films" className="link link-hover text-rose-400">
            {t("seeAll")} →
          </Link>
        </div>

        {movies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center">
            <p className="text-4xl">🍿</p>

            <h3 className="mt-4 text-xl font-bold">
              {t("cinemaPreparing")}
            </h3>

            <p className="mt-2 text-slate-400">
              {t("firstFilmsSoon")}
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
                      alt={t("posterAlt", { title: movie.title })}
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
                  {movie.releaseYear ?? t("unknownYear")}
                  {" · "}
                  {movie.type === "SERIES"
                    ? t("series")
                    : t("film")}
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
              {t("editorialView")}
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {t("latestReviews")}
            </h2>
          </div>

          <Link
            href="/critiques"
            className="link link-hover text-rose-400"
          >
            {t("allReviews")} →
          </Link>
        </div>

        {reviews.length === 0 ? (
          <p className="rounded-2xl bg-white/[0.03] p-6 text-slate-400">
            {t("firstReviewsSoon")}
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

                  {review.excerpt && (
                    <p className="line-clamp-3 leading-7 text-slate-300">
                      {review.excerpt}
                    </p>
                  )}

                  <p className="mt-3 text-xs text-slate-400">
                    {t("byAuthor", { author: review.authorName })}
                  </p>

                  <div className="card-actions mt-3">
                    <Link
                      href={`/critiques/${review.slug}`}
                      className="btn btn-outline btn-sm border-rose-500 text-rose-400"
                    >
                      {t("readReview")}
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
        aria-label={t("adSpace")}
      >
        <span className="text-xs text-slate-600">
          {t("adSpace")}
        </span>
      </div>

      {/* Actualités */}
      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-rose-400">
              {t("magazine")}
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {t("latestNews")}
            </h2>
          </div>

          <Link
            href="/actualites"
            className="link link-hover text-rose-400"
          >
            {t("readAll")} →
          </Link>
        </div>

        {articles.length === 0 ? (
          <p className="rounded-2xl bg-white/[0.03] p-6 text-slate-400">
            {t("firstNewsSoon")}
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
                    alt={t("articleImageAlt", {
                      title: article.title,
                    })}
                    loading="lazy"
                    className="h-48 w-full object-cover"
                  />
                )}

                <div className="card-body">
                  <h3 className="card-title">{article.title}</h3>

                  {article.excerpt && (
                    <p className="line-clamp-3 leading-7 text-slate-300">
                      {article.excerpt}
                    </p>
                  )}

                  <p className="text-xs text-slate-400">
                    {t("byAuthor", { author: article.authorName })}
                  </p>

                  <div className="card-actions mt-3">
                    <Link
                      href={`/actualites/${article.slug}`}
                      className="btn btn-ghost btn-sm text-rose-400"
                    >
                      {t("readArticle")} →
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
          {t("welcome")}
        </p>

        <h2 className="mt-3 max-w-2xl text-3xl font-black sm:text-4xl">
          {t("everyFilmStory")}
        </h2>

        <p className="mt-4 max-w-xl leading-7 text-slate-300">
          {t("joinDescription")}
        </p>

        <Link
          href="/inscription"
          className="btn btn-error mt-7 text-white"
        >
          {t("joinHistyra")}
        </Link>
      </section>
    </div>
  );
}
