
import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "./contact-form";

export const metadata: Metadata = {
  title: "Contact — HISTYRA",
  description:
    "Contacte l'équipe HISTYRA pour une question, une proposition d'histoire, un article, une collaboration ou une suggestion.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact — HISTYRA",
    description:
      "Une histoire à proposer, une idée à partager ou une question ? Échange avec l'équipe HISTYRA.",
    type: "website",
    locale: "fr_FR",
    siteName: "HISTYRA",
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#080b14] text-white">
      {/* Introduction */}
      <section className="relative isolate border-b border-white/10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 -z-10 h-96 w-96 rounded-full bg-sky-500/15 blur-[120px]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-20 -z-10 h-80 w-80 rounded-full bg-violet-600/10 blur-[100px]"
        />

        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <Link
            href="/"
            className="text-sm text-slate-400 transition hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            ← Retour à l'accueil
          </Link>

          <p className="mt-10 text-xs font-bold uppercase tracking-[0.3em] text-sky-400 sm:text-sm">
            Une histoire commence par une idée
          </p>

          <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
            Une question ?
            <span className="block bg-gradient-to-r from-sky-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">
              Écrivons la suite ensemble.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Une histoire à partager, un article à proposer, une idée
            de collaboration ou simplement un message ? HISTYRA est
            à l'écoute de celles et ceux qui souhaitent contribuer
            à notre univers éditorial.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full border border-sky-400/30 bg-sky-400/[0.05] px-4 py-2 text-sm text-sky-300">
              Proposer une histoire
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300">
              Partager une idée
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300">
              Collaborer avec nous
            </span>
          </div>
        </div>
      </section>

      {/* Informations et formulaire */}
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <aside className="space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-400">
              Parlons ensemble
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              Chaque idée mérite d'être entendue.
            </h2>

            <p className="mt-4 leading-7 text-slate-400">
              HISTYRA est un espace dédié aux histoires, aux récits
              et aux publications qui éveillent la curiosité.
              Ton message peut nous aider à faire grandir cet univers.
            </p>
          </div>

          <div className="space-y-4">
            {/* Proposer une histoire */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-sky-400/30">
              <div className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-400/10 text-xl text-sky-300"
                >
                  📖
                </span>

                <div>
                  <h3 className="font-semibold">
                    Proposer une histoire
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Tu écris des récits ou tu as imaginé un univers
                    original ? Présente-nous ton projet et explique
                    ce que tu aimerais partager avec nos lecteurs.
                  </p>
                </div>
              </div>
            </div>

            {/* Articles et contributions */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-sky-400/30">
              <div className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-xl text-violet-300"
                >
                  ✍️
                </span>

                <div>
                  <h3 className="font-semibold">
                    Articles et contributions
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Tu souhaites proposer un article, une analyse,
                    un sujet à explorer ou une contribution éditoriale ?
                    Partage ton idée avec notre équipe.
                  </p>
                </div>
              </div>
            </div>

            {/* Partenariats */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-sky-400/30">
              <div className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-400/10 text-xl text-indigo-300"
                >
                  ✦
                </span>

                <div>
                  <h3 className="font-semibold">
                    Partenariats et collaborations
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Tu représentes un projet, une communauté ou
                    une initiative compatible avec l'univers HISTYRA ?
                    Nous sommes ouverts aux propositions pertinentes.
                  </p>
                </div>
              </div>
            </div>

            {/* Questions générales */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-sky-400/30">
              <div className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-400/10 text-xl text-rose-300"
                >
                  ✉
                </span>

                <div>
                  <h3 className="font-semibold">
                    Une question ou une suggestion
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Une question sur nos publications, une remarque
                    sur le site ou une idée pour améliorer ton expérience ?
                    Écris-nous directement.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Confidentialité */}
          <div className="rounded-2xl border border-sky-400/20 bg-sky-400/[0.04] p-5">
            <p className="text-sm leading-7 text-slate-300">
              <span className="font-semibold text-sky-300">
                Ta confidentialité compte.
              </span>{" "}
              Les informations transmises servent à traiter ta demande.
              Évite d'inclure des mots de passe ou des données personnelles
              sensibles dans ton message.
            </p>

            <Link
              href="/confidentialite"
              className="mt-3 inline-flex text-sm font-semibold text-sky-300 transition hover:text-sky-200"
            >
              Consulter notre politique de confidentialité →
            </Link>
          </div>
        </aside>

        {/* Formulaire existant */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 shadow-2xl shadow-black/20 sm:p-8 lg:p-10">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-400">
              Écrivons-nous
            </p>

            <h2 className="mt-3 text-2xl font-black sm:text-3xl">
              Parlons de ton projet.
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-400">
              Explique-nous ta demande avec quelques détails.
              Qu'il s'agisse d'une histoire, d'un article ou d'une
              simple question, nous prendrons le temps de la lire.
            </p>

            <p className="mt-3 text-xs leading-6 text-slate-500">
              Les champs marqués d'un astérisque sont obligatoires.
            </p>
          </div>

          <ContactForm />
        </div>
      </section>

      {/* Appel à la découverte */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <div className="relative isolate overflow-hidden rounded-3xl border border-sky-400/20 bg-gradient-to-br from-[#12213b] via-[#11162a] to-[#17132a] p-7 sm:p-10 lg:p-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 -z-10 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl"
          />

          <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-400">
            Explore l'univers HISTYRA
          </p>

          <h2 className="mt-4 max-w-2xl text-3xl font-black leading-tight sm:text-4xl">
            Les plus belles découvertes commencent parfois par quelques mots.
          </h2>

          <p className="mt-4 max-w-xl leading-7 text-slate-300">
            En attendant les prochaines histoires et publications,
            découvre les autres espaces de notre univers éditorial.
          </p>

          <div className="mt-7 flex flex-wrap gap-4">
            <Link
              href="/actualites"
              className="inline-flex items-center justify-center rounded-xl bg-sky-400 px-6 py-3.5 font-bold text-slate-950 transition hover:bg-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
            >
              Explorer les articles →
            </Link>

            <Link
              href="/a-propos"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 px-6 py-3.5 font-semibold text-white transition hover:border-sky-400/50 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              Découvrir HISTYRA
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
