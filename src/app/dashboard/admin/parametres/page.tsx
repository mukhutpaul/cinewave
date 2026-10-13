
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Settings,
  Globe,
  Search,
  Image as ImageIcon,
  ShieldCheck,
  ArrowLeft,
  ChevronRight,
  Clapperboard,
  Bell,
  Database,
  Palette,
  LockKeyhole,
  Info,
} from "lucide-react";
import { auth } from "@/lib/auth";

const settingsSections = [
  {
    title: "Général",
    description: "Configurez le nom et les informations de CineWave.",
    detail: "Identité et informations du site",
    icon: Globe,
    color: "text-violet-300",
    bg: "bg-violet-500/10",
    items: [
      "Nom de la plateforme",
      "Description du site",
      "Adresse du site",
      "Adresse e-mail de contact",
    ],
    status: "Interface prête",
  },
  {
    title: "Apparence",
    description: "Personnalisez l'identité visuelle de la plateforme.",
    detail: "Logo, favicon et identité visuelle",
    icon: Palette,
    color: "text-pink-300",
    bg: "bg-pink-500/10",
    items: [
      "Logo de CineWave",
      "Favicon",
      "Couleur principale",
      "Image de couverture",
    ],
    status: "Interface prête",
  },
  {
    title: "SEO",
    description: "Préparez CineWave pour les moteurs de recherche.",
    detail: "Métadonnées et référencement",
    icon: Search,
    color: "text-sky-300",
    bg: "bg-sky-500/10",
    items: [
      "Titre par défaut",
      "Description SEO",
      "Image de partage social",
      "Indexation des pages",
    ],
    status: "Interface prête",
  },
  {
    title: "Médias et stockage",
    description: "Organisez le stockage des affiches et images.",
    detail: "Images, stockage et services externes",
    icon: ImageIcon,
    color: "text-amber-300",
    bg: "bg-amber-500/10",
    items: [
      "Fournisseur de stockage",
      "URL publique des médias",
      "Optimisation des images",
      "Limites de téléchargement",
    ],
    status: "À configurer",
  },
  {
    title: "Notifications",
    description: "Définissez les préférences de notification.",
    detail: "E-mails et alertes de la plateforme",
    icon: Bell,
    color: "text-emerald-300",
    bg: "bg-emerald-500/10",
    items: [
      "E-mails administratifs",
      "Notifications de publication",
      "Alertes de sécurité",
    ],
    status: "À configurer",
  },
  {
    title: "Sécurité",
    description: "Préparez les contrôles d'accès et de sécurité.",
    detail: "Sessions et accès administrateur",
    icon: LockKeyhole,
    color: "text-red-300",
    bg: "bg-red-500/10",
    items: [
      "Accès à l'administration",
      "Gestion des sessions",
      "Politique de sécurité",
    ],
    status: "À configurer",
  },
  {
    title: "Base de données",
    description: "Consultez les éléments liés à l'infrastructure.",
    detail: "Prisma et services de données",
    icon: Database,
    color: "text-indigo-300",
    bg: "bg-indigo-500/10",
    items: [
      "État de la connexion",
      "Fournisseur de base de données",
      "Stratégie de sauvegarde",
    ],
    status: "À configurer",
  },
];

export default async function AdminSettingsPage() {
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
        {/* Navigation */}
        <Link
          href="/dashboard/admin"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={17} />
          Retour à l'administration
        </Link>

        {/* En-tête */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
            <Settings size={28} />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Paramètres
            </h1>
            <p className="mt-2 text-sm text-slate-400 sm:text-base">
              Configurez et personnalisez votre plateforme CineWave.
            </p>
          </div>
        </header>

        {/* Présentation */}
        <section className="mb-8 overflow-hidden rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-950/70 via-slate-900 to-slate-900 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-violet-300 sm:flex">
              <Clapperboard size={26} />
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-violet-300">
                <ShieldCheck size={17} />
                Espace administrateur
              </div>

              <h2 className="mt-3 text-xl font-semibold">
                Gérez la configuration de CineWave
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                Retrouvez les options essentielles pour votre identité
                visuelle, votre référencement, vos médias et la sécurité.
                Les modifications devront être reliées à une configuration
                persistante pour être enregistrées.
              </p>
            </div>
          </div>
        </section>

        {/* Sections */}
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-semibold">
              Toutes les configurations
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Choisissez une rubrique pour consulter ses options.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {settingsSections.map((section) => {
              const Icon = section.icon;

              return (
                <article
                  key={section.title}
                  className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-slate-700 hover:bg-slate-900"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${section.bg} ${section.color}`}
                    >
                      <Icon size={23} />
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs ${
                        section.status === "Interface prête"
                          ? "bg-violet-500/10 text-violet-300"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {section.status}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold">
                    {section.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {section.description}
                  </p>

                  <div className="my-4 border-t border-slate-800" />

                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                    Options prévues
                  </p>

                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-slate-300"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2.5">
                    <span className="text-xs text-slate-500">
                      {section.detail}
                    </span>
                    <ChevronRight
                      size={17}
                      className="shrink-0 text-slate-500"
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Information importante */}
        <section className="mt-8 rounded-xl border border-sky-400/15 bg-sky-400/5 p-4">
          <div className="flex items-start gap-3">
            <Info
              size={19}
              className="mt-0.5 shrink-0 text-sky-300"
            />
            <div>
              <h2 className="text-sm font-semibold text-sky-200">
                À propos de cette page
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                Cette version présente les rubriques de configuration.
                Elle n'enregistre pas encore de paramètres et ne teste pas
                la connexion à la base de données. Les clés secrètes,
                mots de passe et jetons API doivent rester dans les
                variables d'environnement côté serveur.
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-8 border-t border-slate-800 pt-5 text-center text-xs text-slate-500">
          CineWave · Paramètres d'administration
        </footer>
      </div>
    </main>
  );
}
