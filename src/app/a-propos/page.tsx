
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "À propos de HISTYRA — Le cinéma autrement",
  description:
    "Découvre HISTYRA : actualités cinéma, critiques, analyses et découvertes autour des films et des séries.",
  alternates: {
    canonical: "/a-propos",
  },
  openGraph: {
    title: "À propos de HISTYRA — Le cinéma autrement",
    description:
      "Le cinéma ne se regarde pas seulement. Il se découvre, se raconte et se partage.",
    type: "website",
    locale: "fr_FR",
    siteName: "HISTYRA",
    url: "/a-propos",
  },
};

const values = [
  {
    number: "01",
    title: "La passion du cinéma",
    description:
      "Des grands classiques aux nouvelles sorties, nous célébrons les films et les séries qui nous font rire, réfléchir et vibrer.",
    icon: "🎬",
  },
  {
    number: "02",
    title: "La curiosité avant tout",
    description:
      "Explore de nouveaux univers, découvre des œuvres inattendues et laisse-toi surprendre par des histoires venues du monde entier.",
    icon: "✦",
  },
  {
    number: "03",
    title: "Un regard authentique",
    description:
      "Des critiques, des analyses et des actualités pour aller au-delà de l'écran et découvrir ce qui se cache derrière chaque histoire.",
    icon: "◉",
  },
];

export default function AProposPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#080b14] text-white">
      {/* Introduction */}
      <section className="relative isolate border-b border-white/10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-20 -z-10 h-96 w-96 rounded-full bg-sky-500/15 blur-[120px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-20 -z-10 h-80 w-80 rounded-full bg-violet-600/10 blur-[100px]"
        />

        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:py-36">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <span aria-hidden="true">←</span>
            Retour à l'accueil
          </Link>

          <p className="mt-12 text-xs font-bold uppercase tracking-[0.3em] text-sky-400 sm:text-sm">
            Bienvenue dans notre univers
          </p>

          <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[1.08] tracking-tight sm:text-6xl lg:text-8xl">
            Le cinéma
            <br />
            <span className="bg-gradient-to-r from-sky-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">
              est une histoire
            </span>
            <br />
            sans fin.
          </h1>

          <p className="mt-8 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Bienvenue chez HISTYRA, un espace dédié à celles et ceux qui
            aiment les films, les séries et les histoires qui restent
            avec nous bien après le générique de fin.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-sky-400 px-6 py-3.5 font-bold text-slate-950 transition hover:bg-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080b14]"
            >
              Explorer HISTYRA <span className="ml-2">→</span>
            </Link>

            <Link
              href="/actualites"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] px-6 py-3.5 font-semibold text-white transition hover:border-sky-400/50 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              Nos actualités
            </Link>
          </div>

          <div className="mt-16 flex items-center gap-4 border-t border-white/10 pt-6">
            <div
              aria-hidden="true"
              className="flex -space-x-2"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#080b14] bg-sky-400/20 text-sky-300">
                ✦
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#080b14] bg-violet-400/20 text-violet-300">
                ▶
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#080b14] bg-indigo-400/20 text-indigo-300">
                ★
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Un univers dédié aux amoureux du septième art.
            </p>
          </div>
        </div>
      </section>

      {/* Notre histoire */}
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-20 lg:py-28">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-400">
            Notre histoire
          </p>
          <h2 className="mt-5 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
            Bien plus qu'un écran.
            <span className="mt-2 block text-slate-400">
              Une émotion à partager.
            </span>
          </h2>
        </div>

        <div className="space-y-5 text-base leading-8 text-slate-400">
          <p>
            Chaque film commence par une idée. Chaque série nous entraîne
            dans un nouvel univers. Et certaines histoires finissent par
            devenir une partie de nous.
          </p>
          <p>
            C'est cette fascination pour les récits, les personnages et
            les mondes imaginaires qui inspire HISTYRA. Nous proposons
            un espace pour explorer le cinéma, suivre son actualité,
            lire des critiques et trouver de nouvelles œuvres à découvrir.
          </p>
          <p>
            Notre ambition est simple : rendre chaque visite intéressante,
            chaque découverte mémorable et chaque passion encore plus vivante.
          </p>
        </div>
      </section>

      {/* Nos valeurs */}
      <section className="border-y border-white/10 bg-gradient-to-b from-[#0d1322] to-[#080b14]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-400">
              Ce qui nous anime
            </p>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              Notre vision du cinéma.
            </h2>
            <p className="mt-5 leading-8 text-slate-400">
              Trois principes au cœur de l'expérience HISTYRA.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {values.map((value) => (
              <article
                key={value.number}
                className="group rounded-2xl border border-white/10 bg-white/[0.025] p-7 transition duration-300 hover:-translate-y-1 hover:border-sky-400/40 hover:bg-sky-400/[0.04] sm:p-8"
              >
                <div className="flex items-center justify-between">
                  <span
                    aria-hidden="true"
                    className="text-3xl text-sky-400"
                  >
                    {value.icon}
                  </span>
                  <span className="text-sm font-bold text-slate-600">
                    {value.number}
                  </span>
                </div>

                <h3 className="mt-8 text-xl font-bold transition group-hover:text-sky-300">
                  {value.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-slate-400">
                  {value.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Appel à la découverte */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="relative isolate overflow-hidden rounded-3xl border border-sky-400/20 bg-gradient-to-br from-[#12213b] via-[#11162a] to-[#17132a] p-8 sm:p-12 lg:p-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 -z-10 h-72 w-72 rounded-full bg-sky-400/10 blur-[90px]"
          />

          <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-400">
            Le prochain chapitre t'attend
          </p>

          <h2 className="mt-5 max-w-2xl text-3xl font-black leading-tight sm:text-5xl">
            Et si ta prochaine histoire préférée était ici ?
          </h2>

          <p className="mt-5 max-w-xl leading-8 text-slate-300">
            Parcours nos actualités, explore les critiques et pars à la
            recherche de ton prochain coup de cœur cinématographique.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/actualites"
              className="rounded-xl bg-sky-400 px-6 py-3.5 font-bold text-slate-950 transition hover:bg-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
            >
              Découvrir nos actualités →
            </Link>

            <Link
              href="/critiques"
              className="rounded-xl border border-white/15 px-6 py-3.5 font-semibold transition hover:border-sky-400/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              Lire nos critiques
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
