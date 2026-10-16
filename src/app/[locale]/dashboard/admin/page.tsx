
import { Suspense } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Administration | Histyra",
  description: "Tableau de bord d'administration de Histyra.",
};

function AdminDashboardLoading() {
  return (
    <main className="min-h-screen bg-[#080b14] p-6 text-white md:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-white/10" />
        <div className="h-36 animate-pulse rounded-3xl bg-white/5" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl border border-white/10 bg-white/5"
            />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-white/5" />
      </div>
    </main>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<AdminDashboardLoading />}>
      <AdminDashboardContent />
    </Suspense>
  );
}

async function AdminDashboardContent() {
  await connection();

  // 1. Vérifier la session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/connexion");
  }

  // 2. Vérifier le rôle et le statut directement en base
  const admin = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      role: true,
      banned: true,
    },
  });

  if (!admin || admin.banned) {
    redirect("/connexion");
  }

  if (admin.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // 3. Charger les statistiques réelles
  const [
    totalUsers,
    activeUsers,
    totalMovies,
    publishedMovies,
    publishedSeries,
    totalArticles,
    publishedArticles,
    totalReviews,
    publishedReviews,
    draftMovies,
    draftArticles,
    draftReviews,
    archivedMovies,
    archivedArticles,
    archivedReviews,
    totalCategories,
    recentUsers,
    recentMovies,
    recentArticles,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { banned: false } }),
    prisma.movie.count({ where: { type: "MOVIE" } }),
    prisma.movie.count({
      where: { type: "MOVIE", status: "PUBLISHED" },
    }),
    prisma.movie.count({
      where: { type: "SERIES", status: "PUBLISHED" },
    }),
    prisma.article.count(),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.review.count(),
    prisma.review.count({ where: { status: "PUBLISHED" } }),
    prisma.movie.count({ where: { status: "DRAFT" } }),
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.review.count({ where: { status: "DRAFT" } }),
    prisma.movie.count({ where: { status: "ARCHIVED" } }),
    prisma.article.count({ where: { status: "ARCHIVED" } }),
    prisma.review.count({ where: { status: "ARCHIVED" } }),
    prisma.category.count(),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.movie.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.article.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  const drafts = draftMovies + draftArticles + draftReviews;
  const archived = archivedMovies + archivedArticles + archivedReviews;
  const published =
    publishedMovies +
    publishedSeries +
    publishedArticles +
    publishedReviews;

  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const stats = [
    {
      label: "Utilisateurs",
      value: totalUsers,
      detail: `${activeUsers} compte(s) non suspendu(s)`,
      icon: "👥",
      color: "text-sky-400",
    },
    {
      label: "Films publiés",
      value: publishedMovies,
      detail: `${totalMovies} film(s) au total`,
      icon: "🎬",
      color: "text-rose-400",
    },
    {
      label: "Séries publiées",
      value: publishedSeries,
      detail: "Disponibles sur la plateforme",
      icon: "📺",
      color: "text-violet-400",
    },
    {
      label: "Articles publiés",
      value: publishedArticles,
      detail: `${totalArticles} article(s) au total`,
      icon: "📰",
      color: "text-sky-300",
    },
    {
      label: "Critiques publiées",
      value: publishedReviews,
      detail: `${totalReviews} critique(s) au total`,
      icon: "✍️",
      color: "text-amber-400",
    },
    {
      label: "Catégories",
      value: totalCategories,
      detail: "Catégories enregistrées",
      icon: "🏷️",
      color: "text-emerald-400",
    },
    {
      label: "Brouillons",
      value: drafts,
      detail: "Films, articles et critiques",
      icon: "📝",
      color: "text-orange-400",
    },
    {
      label: "Contenus archivés",
      value: archived,
      detail: "Films, articles et critiques",
      icon: "🗄️",
      color: "text-slate-400",
    },
  ];

  const managementLinks = [
    {
      title: "Utilisateurs",
      description: "Consulter les comptes et gérer les rôles.",
      href: "/dashboard/admin/utilisateurs",
      icon: "👥",
    },
    {
      title: "Films et séries",
      description: "Organiser le catalogue et les publications.",
      href: "/dashboard/admin/films",
      icon: "🎬",
    },
    {
      title: "Articles",
      description: "Gérer les actualités et leur publication.",
      href: "/dashboard/admin/articles",
      icon: "📰",
    },
    {
      title: "Critiques",
      description: "Consulter et gérer les critiques de films.",
      href: "/dashboard/admin/critiques",
      icon: "✍️",
    },
    {
      title: "Catégories",
      description: "Organiser les contenus par catégorie.",
      href: "/dashboard/admin/categories",
      icon: "🏷️",
    },
  ];

  return (
    <main className="min-h-screen bg-[#080b14] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-5">
          <div>
            <Link
              href="/dashboard"
              className="text-sm text-slate-400 transition hover:text-white"
            >
              ← Retour au dashboard
            </Link>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-rose-400">
              Histyra Control Center
            </p>

            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              Administration<span className="text-rose-500">.</span>
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              Bonjour {admin.name}, voici l&apos;état de votre plateforme.
            </p>
          </div>

          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3">
            <p className="text-xs text-rose-300">Connecté en tant que</p>
            <p className="mt-1 font-bold">Administrateur</p>
            <p className="mt-1 max-w-64 truncate text-xs text-slate-400">
              {admin.email}
            </p>
          </div>
        </header>

        <section className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#301326] via-[#19152d] to-slate-950 p-6 sm:p-9">
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-rose-500/20 blur-3xl"
          />

          <div className="relative max-w-2xl">
            <span className="badge border-rose-400/30 bg-rose-500/10 text-rose-300">
              Espace sécurisé
            </span>

            <h2 className="mt-4 text-2xl font-black sm:text-3xl">
              Pilotez Histyra.
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              Suivez les utilisateurs, surveillez les publications et
              préparez les prochaines sorties depuis un espace centralisé.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="btn btn-outline border-white/20 text-white hover:bg-white/10"
              >
                Dashboard général
              </Link>
              <Link href="/dashboard/profil" className="btn btn-error text-white">
                Mon profil
              </Link>
            </div>
          </div>
        </section>

        <section aria-labelledby="stats-heading">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400">
              Vue d&apos;ensemble
            </p>
            <h2 id="stats-heading" className="mt-2 text-2xl font-bold">
              Statistiques de la plateforme
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Les chiffres sont calculés à partir de la base de données.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <article
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 transition hover:border-rose-500/30"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    {stat.icon}
                  </span>
                  <span className={`text-3xl font-black ${stat.color}`}>
                    {stat.value}
                  </span>
                </div>
                <h3 className="mt-4 font-bold">{stat.label}</h3>
                <p className="mt-1 text-sm text-slate-400">{stat.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10" aria-labelledby="management-heading">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400">
              Outils
            </p>
            <h2 id="management-heading" className="mt-2 text-2xl font-bold">
              Gestion de Histyra
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {managementLinks.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:border-rose-500/40 hover:bg-white/[0.05]"
              >
                <span className="text-3xl" aria-hidden="true">
                  {item.icon}
                </span>
                <h3 className="mt-4 font-bold transition group-hover:text-rose-400">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {item.description}
                </p>
                <span className="mt-4 inline-block text-sm font-semibold text-rose-400">
                  Accéder →
                </span>
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Derniers utilisateurs</h2>
              <span className="badge badge-ghost">5 derniers</span>
            </div>

            {recentUsers.length === 0 ? (
              <p className="text-sm text-slate-400">
                Aucun utilisateur enregistré.
              </p>
            ) : (
              <div className="space-y-4">
                {recentUsers.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 border-b border-white/5 pb-3 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {item.name}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {item.email}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="badge badge-sm badge-outline">
                        {item.role}
                      </span>
                      <p className="mt-1 text-xs text-slate-500">
                        {dateFormatter.format(item.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Derniers films et séries</h2>
              <span className="badge badge-ghost">5 derniers</span>
            </div>

            {recentMovies.length === 0 ? (
              <p className="text-sm text-slate-400">
                Aucun film ou série enregistré.
              </p>
            ) : (
              <div className="space-y-4">
                {recentMovies.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 border-b border-white/5 pb-3 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {item.type === "MOVIE" ? "Film" : "Série"} ·{" "}
                        {dateFormatter.format(item.createdAt)}
                      </p>
                    </div>
                    <span className="badge badge-sm badge-outline">
                      {item.status === "PUBLISHED"
                        ? "Publié"
                        : item.status === "DRAFT"
                          ? "Brouillon"
                          : "Archivé"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 sm:p-6 lg:col-span-2">
            <h2 className="mb-5 text-lg font-bold">Derniers articles</h2>

            {recentArticles.length === 0 ? (
              <p className="text-sm text-slate-400">
                Aucun article enregistré.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {recentArticles.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
                  >
                    <h3 className="font-semibold">{item.title}</h3>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <span className="badge badge-sm badge-outline">
                        {item.status === "PUBLISHED"
                          ? "Publié"
                          : item.status === "DRAFT"
                            ? "Brouillon"
                            : "Archivé"}
                      </span>
                      <span className="text-xs text-slate-500">
                        {dateFormatter.format(item.createdAt)}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <footer className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Histyra — Administration
        </footer>
      </div>
    </main>
  );
}
