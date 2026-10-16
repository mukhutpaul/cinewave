
import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "./contact-form";

export const metadata: Metadata = {
  title: "Contact — HISTYRA",
  description:
    "Contacte l'équipe HISTYRA pour une question, une suggestion, un partenariat ou un retour concernant le cinéma et les séries.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact — HISTYRA",
    description:
      "Une question ou une idée ? Échange avec l'équipe HISTYRA.",
    type: "website",
    locale: "fr_FR",
    siteName: "HISTYRA",
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#080b14] text-white">
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
            className="text-sm text-slate-400 transition hover:text-sky-300"
          >
            ← Retour à l'accueil
          </Link>

          <p className="mt-10 text-xs font-bold uppercase tracking-[0.3em] text-sky-400 sm:text-sm">
            Restons en contact
          </p>

          <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
            Une question ?
            <span className="block bg-gradient-to-r from-sky-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">
              Parlons cinéma.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Une suggestion, une question ou une proposition de partenariat ?
            Écris-nous. L'équipe HISTYRA sera ravie de te lire.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <aside className="space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-400">
              Parlons ensemble
            </p>
            <h2 className="mt-3 text-2xl font-bold">
              Nous sommes à ton écoute.
            </h2>
            <p className="mt-4 leading-7 text-slate-400">
              Utilise le formulaire pour nous envoyer ton message.
              Tu peux nous contacter pour différentes raisons.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-400/10 text-xl text-sky-300"
                >
                  ✉
                </span>
                <div>
                  <h3 className="font-semibold">Question générale</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Une question sur HISTYRA ou sur nos contenus ?
                    Écris-nous directement via le formulaire.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-xl text-violet-300"
                >
                  ✦
                </span>
                <div>
                  <h3 className="font-semibold">Partenariats et propositions</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Tu as une idée de collaboration ou un projet à proposer ?
                    Présente-nous ton initiative.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-sky-400/20 bg-sky-400/[0.04] p-5">
            <p className="text-sm leading-7 text-slate-300">
              <span className="font-semibold text-sky-300">
                Notre engagement :
              </span>{" "}
              tes informations sont utilisées pour traiter ta demande.
              Évite d'inclure des données personnelles sensibles dans ton message.
            </p>
            <Link
              href="/confidentialite"
              className="mt-3 inline-flex text-sm font-semibold text-sky-300 hover:text-sky-200"
            >
              Politique de confidentialité →
            </Link>
          </div>
        </aside>

        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 shadow-2xl shadow-black/20 sm:p-8 lg:p-10">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-400">
              Formulaire de contact
            </p>
            <h2 className="mt-3 text-2xl font-black sm:text-3xl">
              Envoie-nous un message
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Les champs marqués d'un astérisque sont obligatoires.
            </p>
          </div>

          <ContactForm />
        </div>
      </section>
    </main>
  );
}
