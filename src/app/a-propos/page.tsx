
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "À propos de HISTYRA — Des histoires à découvrir",
  description:
    "Découvre HISTYRA, un univers consacré aux articles, aux histoires captivantes, aux récits et aux nouvelles publications.",
  alternates: {
    canonical: "/a-propos",
  },
  openGraph: {
    title: "À propos de HISTYRA — Des histoires à découvrir",
    description:
      "Des articles, des histoires et des idées à explorer. Bienvenue dans l'univers HISTYRA.",
    type: "website",
    locale: "fr_FR",
    siteName: "HISTYRA",
    url: "/a-propos",
  },
};

const values = [
  {
    number: "01",
    title: "Le pouvoir des histoires",
    description:
      "Nous croyons que chaque histoire peut transmettre une émotion, éveiller une réflexion ou nous faire découvrir une nouvelle façon de voir le monde.",
    icon: "✍️",
  },
  {
    number: "02",
    title: "La curiosité avant tout",
    description:
      "Des articles aux récits captivants, nous voulons encourager la découverte, nourrir l'imagination et donner envie d'explorer de nouveaux sujets.",
    icon: "✦",
  },
  {
    number: "03",
    title: "Des idées à partager",
    description:
      "Nous souhaitons créer un espace où les publications, les réflexions et les histoires peuvent inspirer, informer et rapprocher les lecteurs.",
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
            Chaque histoire
            <br />
            <span className="bg-gradient-to-r from-sky-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">
              mérite d'être racontée.
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Bienvenue chez HISTYRA, un espace dédié aux histoires,
            aux articles et aux idées qui méritent d'être partagés.
            Nous explorons des sujets variés, racontons des récits
            captivants et préparons de nouvelles publications pour
            éveiller ta curiosité et nourrir ton imagination.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/actualites"
              className="inline-flex items-center justify-center rounded-xl bg-sky-400 px-6 py-3.5 font-bold text-slate-950 transition hover:bg-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080b14]"
            >
              Découvrir nos articles <span className="ml-2">→</span>
            </Link>

            <Link
              href="/films"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] px-6 py-3.5 font-semibold text-white transition hover:border-sky-400/50 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              Explorer nos histoires
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
                ✍
              </span>

              <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#080b14] bg-indigo-400/20 text-indigo-300">
                ★
              </span>
            </div>

            <p className="text-sm text-slate-400">
              Un univers de découvertes, d'idées et d'histoires.
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
            Un espace pour découvrir.
            <span className="mt-2 block text-slate-400">
              Un univers pour raconter.
            </span>
          </h2>
        </div>

        <div className="space-y-5 text-base leading-8 text-slate-400">
          <p>
            Une histoire peut nous faire voyager, un article peut
            changer notre regard et une idée peut ouvrir la porte
            à de nouvelles possibilités.
          </p>

          <p>
            C'est cette conviction qui inspire HISTYRA. Nous
            souhaitons proposer un espace où les lecteurs peuvent
            découvrir des articles, explorer des récits et retrouver
            des publications qui donnent envie d'apprendre,
            de réfléchir et d'imaginer.
          </p>

          <p>
            Notre ambition est de faire grandir un univers éditorial
            vivant, enrichi progressivement par de nouveaux sujets,
            des histoires originales et des contenus soigneusement
            préparés.
          </p>

          <p>
            HISTYRA évolue au fil de ses publications. Chaque nouvel
            article et chaque nouvelle histoire sont une occasion
            de faire découvrir quelque chose de différent.
          </p>
        </div>
      </section>

      {/* Notre mission */}
      <section className="border-y border-white/10 bg-gradient-to-b from-[#0d1322] to-[#080b14]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-400">
              Notre mission
            </p>

            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
              Donner vie aux idées et aux histoires.
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              Nous voulons rendre la découverte agréable et accessible,
              avec des publications qui invitent à explorer de nouveaux
              sujets et à prendre le temps de lire.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:border-sky-400/40">
              <span className="text-3xl" aria-hidden="true">
                📚
              </span>

              <h3 className="mt-5 text-lg font-bold">
                Des articles à explorer
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                Des sujets variés pour apprendre, comprendre et
                découvrir de nouvelles perspectives.
              </p>
            </article>

            <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:border-violet-400/40">
              <span className="text-3xl" aria-hidden="true">
                ✨
              </span>

              <h3 className="mt-5 text-lg font-bold">
                Des histoires captivantes
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                Des récits et des univers qui stimulent l'imagination
                et donnent envie de poursuivre la lecture.
              </p>
            </article>

            <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:border-indigo-400/40 sm:col-span-2">
              <span className="text-3xl" aria-hidden="true">
                🚀
              </span>

              <h3 className="mt-5 text-lg font-bold">
                De nouvelles publications à venir
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                Nous préparons progressivement de nouveaux contenus
                afin d'enrichir l'expérience des lecteurs et de faire
                évoluer l'univers HISTYRA.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Nos valeurs */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-400">
              Ce qui nous anime
            </p>

            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              Les valeurs d'HISTYRA.
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              Trois principes guident notre vision et la manière
              dont nous souhaitons faire vivre notre plateforme.
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

      {/* Les prochaines publications */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="relative isolate overflow-hidden rounded-3xl border border-sky-400/20 bg-gradient-to-br from-[#12213b] via-[#11162a] to-[#17132a] p-8 sm:p-12 lg:p-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 -z-10 h-72 w-72 rounded-full bg-sky-400/10 blur-[90px]"
          />

          <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-400">
            Le prochain chapitre
          </p>

          <h2 className="mt-5 max-w-2xl text-3xl font-black leading-tight sm:text-5xl">
            De nouvelles histoires restent à raconter.
          </h2>

          <p className="mt-5 max-w-xl leading-8 text-slate-300">
            Des articles inédits, des récits captivants et de nouvelles
            découvertes viendront enrichir HISTYRA. Notre aventure
            éditoriale continue, et de nouvelles lectures sont à venir.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/actualites"
              className="rounded-xl bg-sky-400 px-6 py-3.5 font-bold text-slate-950 transition hover:bg-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
            >
              Lire les articles →
            </Link>

            <Link
              href="/inscription"
              className="rounded-xl border border-white/15 px-6 py-3.5 font-semibold transition hover:border-sky-400/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              Rejoindre HISTYRA
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
