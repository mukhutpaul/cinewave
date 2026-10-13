
import Link from "next/link";
import { headers } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  await connection();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/connexion");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true,
      banned: true,
    },
  });

  if (!user || user.banned) {
    redirect("/connexion");
  }

  const isEditor = user.role === "EDITOR" || user.role === "ADMIN";
  const isAdmin = user.role === "ADMIN";

  const [
    movies,
    series,
    reviews,
    articles,
    draftMovies,
    draftReviews,
    draftArticles,
    users,
  ] = isEditor
    ? await Promise.all([
        prisma.movie.count({
          where: { status: "PUBLISHED", type: "MOVIE" },
        }),
        prisma.movie.count({
          where: { status: "PUBLISHED", type: "SERIES" },
        }),
        prisma.review.count({
          where: { status: "PUBLISHED" },
        }),
        prisma.article.count({
          where: { status: "PUBLISHED" },
        }),
        prisma.movie.count({
          where: { status: "DRAFT" },
        }),
        prisma.review.count({
          where: { status: "DRAFT" },
        }),
        prisma.article.count({
          where: { status: "DRAFT" },
        }),
        isAdmin ? prisma.user.count() : Promise.resolve(0),
      ])
    : [0, 0, 0, 0, 0, 0, 0, 0];

  const firstName = user.name.trim().split(/\s+/)[0] || "Cinéphile";

  const roleLabel = {
    USER: "Membre",
    EDITOR: "Éditeur",
    ADMIN: "Administrateur",
  }[user.role];

  const shortcuts = [
    {
      icon: "🎬",
      title: "Films",
      description: "Découvre les dernières sorties et les classiques.",
      href: "/films",
      color: "from-rose-500/20 to-rose-900/5",
    },
    {
      icon: "📺",
      title: "Séries",
      description: "Explore les séries qui méritent ton attention.",
      href: "/series",
      color: "from-violet-500/20 to-violet-900/5",
    },
    {
      icon: "✍️",
      title: "Critiques",
      description: "Retrouve les analyses de notre rédaction.",
      href: "/critiques",
      color: "from-amber-500/20 to-amber-900/5",
    },
    {
      icon: "📰",
      title: "Actualités",
      description: "Suis toute l'actualité du cinéma.",
      href: "/actualites",
      color: "from-sky-500/20 to-sky-900/5",
    },
  ];

  return (
    <main className="min-h-screen bg-[#080b14] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        {/* En-tête */}
        <header className="mb-10 flex flex-wrap items-center justify-between gap-5">
          <div>
            <Link
              href="/"
              className="text-sm font-bold text-slate-400 hover:text-white"
            >
              ← Retour à Histyra
            </Link>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-rose-400">
              Ton espace personnel
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Bonjour, {firstName}
              <span className="text-rose-500">.</span>
            </h1>

            <p className="mt-3 text-sm text-slate-400 sm:text-base">
              Bienvenue dans ton univers cinéma.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Bouton visible uniquement pour l'administrateur */}
            {isAdmin && (
              <Link
                href="/dashboard/admin"
                className="btn btn-error gap-2 text-white shadow-lg shadow-rose-950/30"
              >
                <span aria-hidden="true">⚙️</span>
                Administration
                <span aria-hidden="true">→</span>
              </Link>
            )}

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt=""
                  className="h-12 w-12 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-violet-600 text-xl font-black">
                  {firstName.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <p className="max-w-48 truncate font-bold">{user.name}</p>
                <span className="badge badge-sm badge-outline border-rose-500/50 text-rose-400">
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Bannière */}
        <section className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#241126] via-[#17152b] to-slate-950 p-6 sm:p-10">
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-20 -z-10 h-72 w-72 rounded-full bg-rose-600/20 blur-3xl"
          />

          <div className="max-w-2xl">
            <span className="badge border-rose-400/30 bg-rose-500/10 text-rose-300">
              ✦ L'univers Histyra
            </span>

            <h2 className="mt-5 text-2xl font-black sm:text-3xl">
              Le cinéma, autrement.
            </h2>

            <p className="mt-3 max-w-xl leading-7 text-slate-300">
              Explore des histoires, découvre de nouveaux talents et plonge
              dans des critiques pensées pour les passionnés du grand écran.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/films" className="btn btn-error text-white">
                Explorer les films
              </Link>

              <Link
                href="/critiques"
                className="btn border-white/15 bg-white/5 text-white hover:bg-white/10"
              >
                Lire les critiques
              </Link>
            </div>
          </div>
        </section>

        {/* Statistiques éditoriales */}
        {isEditor && (
          <section className="mt-10" aria-labelledby="stats-heading">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400">
                Vue d'ensemble
              </p>
              <h2 id="stats-heading" className="mt-2 text-2xl font-bold">
                Activité éditoriale
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                État actuel des contenus enregistrés dans Histyra.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                {
                  label: "Films publiés",
                  value: movies,
                  icon: "🎬",
                  color: "text-rose-400",
                },
                {
                  label: "Séries publiées",
                  value: series,
                  icon: "📺",
                  color: "text-violet-400",
                },
                {
                  label: "Critiques publiées",
                  value: reviews,
                  icon: "✍️",
                  color: "text-amber-400",
                },
                {
                  label: "Articles publiés",
                  value: articles,
                  icon: "📰",
                  color: "text-sky-400",
                },
              ].map((stat) => (
                <article
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-slate-900/70 p-5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-2xl" aria-hidden="true">
                      {stat.icon}
                    </span>
                    <span className={`text-2xl font-black ${stat.color}`}>
                      {stat.value}
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-slate-400">{stat.label}</p>
                </article>
              ))}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Films en brouillon", value: draftMovies },
                { label: "Critiques en brouillon", value: draftReviews },
                { label: "Articles en brouillon", value: draftArticles },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <span className="text-sm text-slate-400">{item.label}</span>
                  <span className="badge badge-ghost">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Raccourci d'administration */}
            {isAdmin && (
              <section className="mt-5 rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-500/10 to-violet-500/10 p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-5">
                  <div>
                    <span className="badge border-rose-500/40 bg-rose-500/10 text-rose-300">
                      ⚙️ Espace réservé
                    </span>
                    <h3 className="mt-3 text-xl font-bold">
                      Administration Histyra
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Gérez les comptes, consultez les statistiques globales et
                      accédez aux outils d'administration de la plateforme.
                    </p>
                    <p className="mt-2 text-sm text-slate-300">
                      {users} compte(s) enregistré(s).
                    </p>
                  </div>

                  <Link
                    href="/dashboard/admin"
                    className="btn btn-error gap-2 text-white"
                  >
                    Ouvrir l'administration
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </section>
            )}
          </section>
        )}

        {/* Raccourcis */}
        <section className="mt-10" aria-labelledby="shortcuts-heading">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400">
              À découvrir
            </p>
            <h2 id="shortcuts-heading" className="mt-2 text-2xl font-bold">
              Explore Histyra
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {shortcuts.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className={`group rounded-2xl border border-white/10 bg-gradient-to-br ${item.color} p-5 transition duration-200 hover:-translate-y-1 hover:border-rose-500/40`}
              >
                <span className="text-3xl" aria-hidden="true">
                  {item.icon}
                </span>

                <h3 className="mt-5 text-lg font-bold transition group-hover:text-rose-400">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {item.description}
                </p>

                <span className="mt-5 inline-block text-sm font-semibold text-rose-400">
                  Découvrir →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Profil */}
        <section
          className="mt-10 rounded-2xl border border-white/10 bg-slate-900/50 p-6 sm:p-8"
          aria-labelledby="profile-heading"
        >
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <h2 id="profile-heading" className="text-xl font-bold">
                Mon compte
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Connecté avec {user.email}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Membre depuis le{" "}
                {user.createdAt.toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {isAdmin && (
                <Link
                  href="/dashboard/admin"
                  className="btn btn-error text-white"
                >
                  ⚙️ Administration
                </Link>
              )}

              <Link href="/" className="btn btn-outline border-white/15">
                Retour au site
              </Link>
            </div>
          </div>
        </section>

        <footer className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Histyra — Un regard indépendant sur le
          cinéma.
        </footer>
      </div>
    </main>
  );
}
