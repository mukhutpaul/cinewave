
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité | HISTYRA",
  description:
    "Découvrez comment HISTYRA collecte, utilise, protège et conserve vos données personnelles lorsque vous consultez notre site.",
  alternates: {
    canonical: "/confidentialite",
  },
  openGraph: {
    title: "Politique de confidentialité | HISTYRA",
    description:
      "Consultez la politique de confidentialité de HISTYRA et découvrez comment vos données personnelles sont traitées.",
    type: "website",
    locale: "fr_FR",
    siteName: "HISTYRA",
    url: "/confidentialite",
  },
};

const sections = [
  { id: "responsable", title: "1. Responsable du site" },
  { id: "donnees", title: "2. Données collectées" },
  { id: "utilisation", title: "3. Utilisation des données" },
  { id: "cookies", title: "4. Cookies et technologies similaires" },
  { id: "publicite", title: "5. Publicité et Google AdSense" },
  { id: "tiers", title: "6. Services tiers et liens externes" },
  { id: "securite", title: "7. Sécurité des données" },
  { id: "conservation", title: "8. Conservation des données" },
  { id: "droits", title: "9. Vos droits" },
  { id: "mineurs", title: "10. Protection des mineurs" },
  { id: "modifications", title: "11. Modifications de cette politique" },
  { id: "contact", title: "12. Nous contacter" },
];

const sectionClass = "scroll-mt-28";
const headingClass =
  "mb-4 text-xl font-bold tracking-tight text-white sm:text-2xl";
const paragraphClass = "mt-3 leading-8 text-slate-300";
const listClass = "mt-4 list-disc space-y-2 pl-6 leading-7 text-slate-300";

export default function ConfidentialitePage() {
  const lastUpdated = "16 octobre 2026";

  return (
    <main className="min-h-screen overflow-hidden bg-[#080b14] text-white">
      {/* En-tête */}
      <section className="relative isolate border-b border-white/10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-24 -z-10 h-96 w-96 rounded-full bg-rose-500/15 blur-[120px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-24 -z-10 h-80 w-80 rounded-full bg-violet-600/10 blur-[110px]"
        />

        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            <span aria-hidden="true">←</span>
            Retour à l’accueil
          </Link>

          <div className="mt-12 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-rose-300">
              <span aria-hidden="true">✦</span>
              Transparence et confiance
            </div>

            <h1 className="mt-7 text-4xl font-black leading-tight tracking-tight sm:text-6xl">
              Politique de{" "}
              <span className="bg-gradient-to-r from-rose-300 via-rose-400 to-violet-400 bg-clip-text text-transparent">
                confidentialité
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Chez HISTYRA, nous accordons de l’importance à la confidentialité
              de vos données personnelles. Cette page explique les informations
              susceptibles d’être collectées, leur utilisation et les moyens
              dont vous disposez pour exercer vos droits.
            </p>

            <p className="mt-6 text-sm text-slate-500">
              Dernière mise à jour : {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      {/* Contenu */}
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16 lg:py-16">
        {/* Sommaire */}
        <aside className="h-fit lg:sticky lg:top-8">
          <nav
            aria-label="Sommaire de la politique de confidentialité"
            className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6"
          >
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-rose-300">
              Sommaire
            </h2>

            <ul className="mt-5 space-y-1">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="block rounded-lg px-3 py-2.5 text-sm leading-6 text-slate-400 transition hover:bg-rose-400/10 hover:text-rose-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Texte de confidentialité */}
        <article className="min-w-0 space-y-12">
          <section id="responsable" className={sectionClass}>
            <h2 className={headingClass}>1. Responsable du site</h2>
            <p className={paragraphClass}>
              HISTYRA est un site consacré au cinéma, aux films, aux séries,
              aux critiques et aux actualités du secteur audiovisuel.
              Le responsable du site est la personne physique ou morale qui
              exploite HISTYRA.
            </p>
            <p className={paragraphClass}>
              Pour toute question relative à la confidentialité ou au
              traitement des données personnelles, vous pouvez nous contacter
              à l’adresse suivante :{" "}
              <a
                href="mailto:contact@histyra.com"
                className="font-medium text-rose-300 underline decoration-rose-300/30 underline-offset-4 hover:text-rose-200"
              >
                contact@histyra.com
              </a>
              .
            </p>
          </section>

          <section id="donnees" className={sectionClass}>
            <h2 className={headingClass}>2. Données collectées</h2>
            <p className={paragraphClass}>
              Selon les fonctionnalités que vous utilisez, HISTYRA peut
              collecter différentes catégories d’informations :
            </p>
            <ul className={listClass}>
              <li>
                <strong className="text-white">Données de compte :</strong>{" "}
                nom ou pseudonyme, adresse e-mail et informations nécessaires
                à la gestion de votre compte, si cette fonctionnalité est
                proposée.
              </li>
              <li>
                <strong className="text-white">
                  Données de communication :
                </strong>{" "}
                informations que vous transmettez lorsque vous nous contactez
                ou envoyez un message.
              </li>
              <li>
                <strong className="text-white">
                  Données de navigation :
                </strong>{" "}
                informations techniques telles que le type de navigateur,
                l’appareil, les pages consultées et les journaux du serveur,
                lorsqu’ils sont collectés.
              </li>
              <li>
                <strong className="text-white">
                  Données de mesure d’audience :
                </strong>{" "}
                informations relatives à la fréquentation du site, si un
                outil de mesure d’audience est utilisé.
              </li>
            </ul>
            <p className={paragraphClass}>
              Nous ne prétendons pas collecter systématiquement toutes ces
              données. Les informations effectivement recueillies dépendent
              des fonctionnalités activées et de votre utilisation du site.
            </p>
          </section>

          <section id="utilisation" className={sectionClass}>
            <h2 className={headingClass}>3. Utilisation des données</h2>
            <p className={paragraphClass}>
              Les informations collectées peuvent être utilisées pour :
            </p>
            <ul className={listClass}>
              <li>Assurer le fonctionnement et la sécurité du site.</li>
              <li>Gérer les comptes et les fonctionnalités disponibles.</li>
              <li>Répondre aux messages et demandes des visiteurs.</li>
              <li>Améliorer les contenus et l’expérience de navigation.</li>
              <li>
                Comprendre la fréquentation du site lorsque des outils
                d’analyse sont utilisés.
              </li>
              <li>
                Afficher et mesurer des annonces publicitaires lorsque ces
                services sont activés.
              </li>
            </ul>
            <p className={paragraphClass}>
              Les données ne doivent être utilisées que pour des finalités
              déterminées et légitimes, conformément aux règles applicables.
            </p>
          </section>

          <section id="cookies" className={sectionClass}>
            <h2 className={headingClass}>
              4. Cookies et technologies similaires
            </h2>
            <p className={paragraphClass}>
              Des cookies ou technologies similaires peuvent être utilisés
              pour assurer certaines fonctions du site, mémoriser des
              préférences, sécuriser une session ou mesurer l’audience.
            </p>
            <p className={paragraphClass}>
              Certains cookies sont nécessaires au fonctionnement du site.
              D’autres, notamment ceux destinés à la publicité ou à certaines
              mesures d’audience, peuvent être soumis à des choix ou à un
              consentement préalable selon la réglementation applicable.
            </p>
            <p className={paragraphClass}>
              Vous pouvez également gérer les cookies dans les paramètres
              de votre navigateur. Le blocage de certains cookies peut
              toutefois empêcher le fonctionnement de certaines fonctionnalités.
            </p>
          </section>

          <section id="publicite" className={sectionClass}>
            <h2 className={headingClass}>
              5. Publicité et Google AdSense
            </h2>
            <p className={paragraphClass}>
              HISTYRA peut utiliser des services publicitaires tiers, notamment
              Google AdSense, si cette solution est activée sur le site.
              Ces services peuvent utiliser des cookies ou des technologies
              similaires pour afficher des annonces, limiter leur répétition,
              mesurer leur efficacité ou personnaliser la publicité lorsque
              cela est autorisé.
            </p>
            <p className={paragraphClass}>
              Selon votre région, votre consentement et les paramètres
              disponibles, des annonces personnalisées ou non personnalisées
              peuvent être proposées.
            </p>
            <p className={paragraphClass}>
              Pour en savoir plus sur la manière dont Google traite les
              données, consultez la{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-rose-300 underline decoration-rose-300/30 underline-offset-4 hover:text-rose-200"
              >
                politique de confidentialité de Google
              </a>
              .
            </p>
            <p className={paragraphClass}>
              Si HISTYRA utilise des annonces Google, les paramètres de
              personnalisation publicitaire et les choix de consentement
              doivent être configurés conformément aux exigences applicables.
              Cette politique ne remplace pas les mécanismes de consentement
              nécessaires.
            </p>
          </section>

          <section id="tiers" className={sectionClass}>
            <h2 className={headingClass}>
              6. Services tiers et liens externes
            </h2>
            <p className={paragraphClass}>
              HISTYRA peut proposer des liens vers des sites externes ou
              intégrer des contenus provenant de services tiers, par exemple
              des vidéos hébergées sur une plateforme externe.
            </p>
            <p className={paragraphClass}>
              Lorsque vous consultez ces contenus, les fournisseurs concernés
              peuvent recevoir certaines informations techniques ou déposer
              des cookies selon leur fonctionnement et vos paramètres.
              Leurs propres politiques de confidentialité s’appliquent à
              leurs services.
            </p>
            <p className={paragraphClass}>
              Nous vous invitons à consulter les politiques des services
              concernés avant de les utiliser. Les conditions de confidentialité
              d’un service tiers ne sont pas nécessairement identiques à celles
              de HISTYRA.
            </p>
          </section>

          <section id="securite" className={sectionClass}>
            <h2 className={headingClass}>7. Sécurité des données</h2>
            <p className={paragraphClass}>
              Nous prenons des mesures techniques et organisationnelles
              raisonnables pour protéger les données contre l’accès non
              autorisé, la perte, la divulgation ou l’altération.
            </p>
            <p className={paragraphClass}>
              Toutefois, aucun système de transmission ou de stockage
              électronique ne peut garantir une sécurité absolue. Nous
              travaillons à limiter les risques et à maintenir la sécurité
              des informations traitées.
            </p>
          </section>

          <section id="conservation" className={sectionClass}>
            <h2 className={headingClass}>8. Conservation des données</h2>
            <p className={paragraphClass}>
              Les données sont conservées pendant la durée nécessaire aux
              finalités pour lesquelles elles ont été collectées, sous réserve
              des obligations légales, des nécessités de sécurité et de la
              résolution d’éventuels litiges.
            </p>
            <p className={paragraphClass}>
              Les durées de conservation peuvent varier selon la nature des
              données, la fonctionnalité utilisée et les obligations
              applicables.
            </p>
          </section>

          <section id="droits" className={sectionClass}>
            <h2 className={headingClass}>9. Vos droits</h2>
            <p className={paragraphClass}>
              Selon la législation applicable à votre situation, vous pouvez
              disposer de droits concernant vos données personnelles,
              notamment :
            </p>
            <ul className={listClass}>
              <li>Demander l’accès à vos données personnelles.</li>
              <li>Demander la rectification d’informations inexactes.</li>
              <li>Demander la suppression de certaines données.</li>
              <li>
                Vous opposer à certains traitements ou en demander la
                limitation lorsque les conditions légales sont réunies.
              </li>
              <li>
                Retirer votre consentement lorsque le traitement repose
                sur celui-ci.
              </li>
            </ul>
            <p className={paragraphClass}>
              Pour exercer un droit ou poser une question, contactez-nous à{" "}
              <a
                href="mailto:contact@histyra.com"
                className="font-medium text-rose-300 underline decoration-rose-300/30 underline-offset-4 hover:text-rose-200"
              >
                contact@histyra.com
              </a>
              . Nous pourrons vous demander les informations nécessaires pour
              vérifier votre demande et y répondre conformément aux règles
              applicables.
            </p>
          </section>

          <section id="mineurs" className={sectionClass}>
            <h2 className={headingClass}>10. Protection des mineurs</h2>
            <p className={paragraphClass}>
              HISTYRA est un site consacré aux contenus et actualités du
              cinéma. Les personnes qui utilisent le site doivent respecter
              les éventuelles restrictions d’âge applicables aux contenus
              consultés.
            </p>
            <p className={paragraphClass}>
              Si vous êtes parent ou représentant légal et estimez que des
              informations concernant un mineur nous ont été transmises de
              manière inappropriée, contactez-nous afin que nous puissions
              examiner la situation.
            </p>
          </section>

          <section id="modifications" className={sectionClass}>
            <h2 className={headingClass}>
              11. Modifications de cette politique
            </h2>
            <p className={paragraphClass}>
              Cette politique peut être mise à jour pour tenir compte de
              l’évolution du site, de ses fonctionnalités ou des obligations
              applicables. La date de dernière mise à jour figurant en haut
              de cette page permet d’identifier sa version la plus récente.
            </p>
            <p className={paragraphClass}>
              Nous vous invitons à consulter régulièrement cette page.
            </p>
          </section>

          <section
            id="contact"
            className={`${sectionClass} rounded-2xl border border-rose-400/20 bg-gradient-to-br from-rose-400/[0.08] to-violet-500/[0.05] p-6 sm:p-8`}
          >
            <h2 className={headingClass}>12. Nous contacter</h2>
            <p className={paragraphClass}>
              Pour toute question relative à cette politique ou à la protection
              de vos données personnelles, vous pouvez contacter l’équipe
              HISTYRA.
            </p>
            <a
              href="mailto:contact@histyra.com"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-3 font-bold text-white transition hover:bg-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080b14]"
            >
              Nous contacter
              <span aria-hidden="true">↗</span>
            </a>
          </section>

          <div className="border-t border-white/10 pt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-rose-300"
            >
              <span aria-hidden="true">←</span>
              Retour à l’accueil de HISTYRA
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
