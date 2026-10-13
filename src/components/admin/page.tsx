
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  auth,
} from "@/lib/auth";
import {
  LayoutDashboard,
  Clapperboard,
  Newspaper,
  Users,
  Tags,
  Settings,
  ArrowUpRight,
  FileText,
  Plus,
  Eye,
  ShieldCheck,
} from "lucide-react";

const menuItems = [
  {
    title: "Vue d'ensemble",
    description: "Consultez l'activité générale de Histyra.",
    href: "/dashboard/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Films et séries",
    description: "Gérez le catalogue de films et de séries.",
    href: "/dashboard/admin/films",
    icon: Clapperboard,
  },
  {
    title: "Articles",
    description: "Publiez vos actualités et contenus éditoriaux.",
    href: "/dashboard/admin/articles",
    icon: Newspaper,
  },
  {
    title: "Utilisateurs",
    description: "Gérez les comptes et les autorisations.",
    href: "/dashboard/admin/utilisateurs",
    icon: Users,
  },
  {
    title: "Catégories",
    description: "Organisez les contenus par catégories.",
    href: "/dashboard/admin/categories",
    icon: Tags,
  },
  {
    title: "Paramètres",
    description: "Configurez votre plateforme.",
    href: "/dashboard/admin/parametres",
    icon: Settings,
  },
];

const quickActions = [
  {
    title: "Créer un article",
    description: "Rédiger une nouvelle publication",
    href: "/dashboard/admin/articles",
    icon: Newspaper,
  },
  {
    title: "Gérer le catalogue",
    description: "Accéder aux films et séries",
    href: "/dashboard/admin/films",
    icon: Clapperboard,
  },
  {
    title: "Voir les utilisateurs",
    description: "Administrer les comptes",
    href: "/dashboard/admin/utilisateurs",
    icon: Users,
  },
];

export default async function AdminPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN" || session.user.banned) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* En-tête */}
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-violet-400">
              <ShieldCheck size={17} />
              Espace sécurisé
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Administration
            </h1>

            <p className="mt-2 text-sm text-slate-400 sm:text-base">
              Gérez votre plateforme Histyra depuis un espace unique.
            </p>
          </div>

          <Link
            href="/dashboard/admin/articles"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500"
          >
            <Plus size={18} />
            Créer un article
          </Link>
        </header>

        {/* Bannière de bienvenue */}
        <section className="relative mb-8 overflow-hidden rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-950 via-slate-900 to-slate-900 p-6 sm:p-8">
          <div className="absolute -right-10 -top-16 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Administration active
              </span>

              <h2 className="mt-4 text-2xl font-bold">
                Bienvenue dans Histyra
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Pilotez vos contenus, préparez vos publications et organisez
                votre catalogue depuis votre tableau de bord.
              </p>
            </div>

            <div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 sm:flex">
              <Clapperboard size={42} className="text-violet-300" />
            </div>
          </div>
        </section>

        {/* Rubriques d'administration */}
        <section className="mb-10">
          <div className="mb-5">
            <h2 className="text-xl font-semibold">Gestion de la plateforme</h2>
            <p className="mt-1 text-sm text-slate-400">
              Sélectionnez une rubrique pour commencer.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isOverview = item.href === "/dashboard/admin";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group rounded-2xl border p-5 transition duration-200 hover:-translate-y-0.5 hover:border-violet-400/40 hover:bg-slate-900 ${
                    isOverview
                      ? "border-violet-400/30 bg-violet-500/5"
                      : "border-slate-800 bg-slate-900/50"
                  }`}
                >
                  <div className="mb-5 flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300 transition group-hover:bg-violet-500/20">
                      <Icon size={23} />
                    </div>

                    <ArrowUpRight
                      size={19}
                      className="text-slate-500 transition group-hover:text-violet-300"
                    />
                  </div>

                  <h3 className="font-semibold">{item.title}</h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Actions rapides */}
        <section className="mb-10">
          <h2 className="mb-5 text-xl font-semibold">Actions rapides</h2>

          <div className="grid gap-3 md:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition hover:border-violet-400/30 hover:bg-slate-900"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-violet-300">
                    <Icon size={21} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold">
                      {action.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {action.description}
                    </p>
                  </div>

                  <ArrowUpRight
                    size={17}
                    className="shrink-0 text-slate-500"
                  />
                </Link>
              );
            })}
          </div>
        </section>

        {/* État de la plateforme */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Eye size={22} />
            </div>

            <div>
              <h2 className="font-semibold">Prochaine étape</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Connectez les statistiques aux données de votre base de
                données, puis activez progressivement la gestion des films,
                des séries, des utilisateurs et des paramètres.
              </p>
              <p className="mt-3 inline-flex items-center gap-2 text-xs text-slate-500">
                <FileText size={15} />
                Les statistiques réelles ne sont pas encore configurées.
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-8 border-t border-slate-800 pt-5 text-center text-xs text-slate-500">
          Histyra · Espace d’administration
        </footer>
      </div>
    </main>
  );
}
