import type { Metadata } from "next"; import Link from "next/link";

export const metadata: Metadata = { title: "Politique de confidentialité | HISTYRA", description: "Consultez la politique de confidentialité de HISTYRA pour comprendre comment vos données personnelles sont collectées, utilisées et protégées.", alternates: { canonical: "/confidentialite", }, openGraph: { title: "Politique de confidentialité | HISTYRA", description: "Découvrez comment HISTYRA traite et protège vos données personnelles.", type: "website", locale: "fr_FR", siteName: "HISTYRA", url: "/confidentialite", }, };

const sections = [ { id: "responsable", title: "1. Responsable du traitement" }, { id: "donnees", title: "2. Données collectées" }, { id: "utilisation", title: "3. Finalités et bases légales" }, { id: "cookies", title: "4. Cookies et technologies similaires" }, { id: "publicite", title: "5. Publicité et Google AdSense" }, { id: "destinataires", title: "6. Destinataires et services tiers" }, { id: "securite", title: "7. Sécurité des données" }, { id: "conservation", title: "8. Durée de conservation" }, { id: "droits", title: "9. Vos droits" }, { id: "mineurs", title: "10. Protection des mineurs" }, { id: "transferts", title: "11. Transferts de données" }, { id: "modifications", title: "12. Modifications de la politique" }, { id: "contact", title: "13. Contact" }, ];

const sectionClass = "scroll-mt-28"; const headingClass = "mb-4 text-xl font-bold tracking-tight text-white sm:text-2xl"; const paragraphClass = "mt-3 leading-8 text-slate-300"; const listClass = "mt-4 list-disc space-y-2 pl-6 leading-7 text-slate-300";

const linkClass = "font-medium text-rose-300 underline decoration-rose-300/30 underline-offset-4 transition hover:text-rose-200";

export default function ConfidentialitePage() { const lastUpdated = "22 octobre 2026";

return ( <main className="min-h-screen overflow-hidden bg-[#080b14] text-white"> <section className="relative isolate border-b border-white/10"> <div
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
          Chez HISTYRA, nous accordons une importance particulière à la
          protection de vos données personnelles. Cette politique explique
          quelles informations peuvent être collectées, pourquoi elles
          sont utilisées, combien de temps elles peuvent être conservées
          et comment vous pouvez exercer vos droits.
        </p>

        <p className="mt-6 text-sm text-slate-500">
          Dernière mise à jour : {lastUpdated}
        </p>
      </div>
    </div>
  </section>

  <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16 lg:py-16">
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

    <article className="min-w-0 space-y-12">
      <section id="responsable" className={sectionClass}>
        <h2 className={headingClass}>1. Responsable du traitement</h2>

        <p className={paragraphClass}>
          HISTYRA est un site consacré au cinéma, aux films, aux séries,
          aux critiques et aux actualités du secteur audiovisuel.
        </p>

        <p className={paragraphClass}>
          Le responsable du traitement est la personne physique ou morale
          qui détermine les finalités et les moyens du traitement des
          données personnelles effectué dans le cadre de l’exploitation
          du site. Ses coordonnées complètes doivent être précisées par
          l’éditeur du site.
        </p>

        <p className={paragraphClass}>
          Pour toute question concernant vos données personnelles, vous
          pouvez nous contacter à l’adresse suivante :{" "}
          <a href="mailto:contact@histyra.com" className={linkClass}>
            contact@histyra.com
          </a>
          .
        </p>
      </section>

      <section id="donnees" className={sectionClass}>
        <h2 className={headingClass}>2. Données collectées</h2>

        <p className={paragraphClass}>
          Les données effectivement collectées dépendent des
          fonctionnalités disponibles et de votre utilisation de
          HISTYRA. Elles peuvent notamment comprendre :
        </p>

        <ul className={listClass}>
          <li>
            <strong className="text-white">Données de contact :</strong>{" "}
            nom, pseudonyme, adresse e-mail et contenu du message lorsque
            vous utilisez le formulaire de contact.
          </li>

          <li>
            <strong className="text-white">Données de compte :</strong>{" "}
            informations nécessaires à la création et à la gestion d’un
            compte, si cette fonctionnalité est proposée.
          </li>

          <li>
            <strong className="text-white">
              Données techniques et de navigation :
            </strong>{" "}
            adresse IP, type de navigateur, appareil utilisé, pages
            consultées et journaux techniques, dans la mesure où ces
            informations sont effectivement traitées.
          </li>

          <li>
            <strong className="text-white">
              Données de mesure d’audience :
            </strong>{" "}
            informations relatives à la fréquentation et à l’utilisation
            du site, si un outil d’analyse est activé.
          </li>

          <li>
            <strong className="text-white">
              Données liées à la publicité :
            </strong>{" "}
            informations éventuellement utilisées pour afficher,
            limiter, personnaliser ou mesurer les annonces publicitaires,
            selon les services activés et vos choix de consentement.
          </li>
        </ul>

        <p className={paragraphClass}>
          Nous vous invitons à ne pas transmettre de données sensibles
          dans les formulaires de contact, sauf nécessité particulière
          et si un canal approprié vous est proposé.
        </p>
      </section>

      <section id="utilisation" className={sectionClass}>
        <h2 className={headingClass}>
          3. Finalités et bases légales
        </h2>

        <p className={paragraphClass}>
          Les données peuvent être utilisées, selon les fonctionnalités
          réellement activées, pour :
        </p>

        <ul className={listClass}>
          <li>Assurer le fonctionnement et la sécurité du site.</li>
          <li>Recevoir et traiter les demandes envoyées par formulaire.</li>
          <li>Gérer les comptes et les services disponibles.</li>
          <li>Améliorer les contenus et l’expérience de navigation.</li>
          <li>Mesurer l’audience lorsque cette fonctionnalité est activée.</li>
          <li>
            Diffuser et mesurer des publicités lorsque des services
            publicitaires sont utilisés.
          </li>
          <li>Respecter les obligations légales applicables.</li>
        </ul>

        <p className={paragraphClass}>
          Selon la finalité concernée, le traitement peut reposer sur
          l’exécution d’une demande que vous avez formulée, le respect
          d’une obligation légale, un intérêt légitime ou votre
          consentement lorsque celui-ci est requis.
        </p>

        <p className={paragraphClass}>
          Lorsque le consentement constitue la base légale du traitement,
          vous pouvez le retirer à tout moment pour l’avenir, sans que
          cela remette en cause la licéité des traitements effectués
          avant son retrait.
        </p>
      </section>

      <section id="cookies" className={sectionClass}>
        <h2 className={headingClass}>
          4. Cookies et technologies similaires
        </h2>

        <p className={paragraphClass}>
          HISTYRA peut utiliser des cookies ou des technologies similaires
          afin de faire fonctionner certaines fonctionnalités, mémoriser
          des préférences, sécuriser les sessions ou mesurer l’audience.
        </p>

        <p className={paragraphClass}>
          Les cookies strictement nécessaires au service peuvent être
          utilisés dans les conditions prévues par la réglementation
          applicable. Les cookies publicitaires, certains cookies de
          mesure d’audience et les autres traceurs soumis au consentement
          ne doivent être activés qu’après avoir recueilli le consentement
          requis.
        </p>

        <p className={paragraphClass}>
          Lorsque cela est applicable, vous devez pouvoir accepter,
          refuser ou personnaliser les traceurs concernés. Le refus doit
          être aussi simple que l’acceptation lorsque la réglementation
          l’exige.
        </p>

        <p className={paragraphClass}>
          Vous pouvez également gérer les cookies dans les paramètres de
          votre navigateur. La désactivation de certains cookies
          nécessaires peut toutefois perturber le fonctionnement de
          certaines fonctionnalités.
        </p>

        <p className={paragraphClass}>
          Si un outil de gestion du consentement est disponible sur
          HISTYRA, utilisez-le pour modifier vos préférences.
        </p>
      </section>

      <section id="publicite" className={sectionClass}>
        <h2 className={headingClass}>
          5. Publicité et Google AdSense
        </h2>

        <p className={paragraphClass}>
          HISTYRA peut utiliser des services publicitaires tiers,
          notamment Google AdSense, si ces services sont effectivement
          activés sur le site.
        </p>

        <p className={paragraphClass}>
          Ces fournisseurs peuvent traiter certaines informations
          techniques ou utiliser des cookies et technologies similaires
          pour diffuser des annonces, limiter leur répétition, mesurer
          leurs performances ou personnaliser les publicités lorsque
          cela est autorisé.
        </p>

        <p className={paragraphClass}>
          Les types d’annonces affichées et les données traitées peuvent
          varier selon votre région, vos choix de consentement, les
          paramètres publicitaires et les services effectivement utilisés.
        </p>

        <p className={paragraphClass}>
          Pour plus d’informations sur le traitement des données par
          Google, consultez sa{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            politique de confidentialité
          </a>
          .
        </p>

        <p className={paragraphClass}>
          Vous pouvez également consulter les{" "}
          <a
            href="https://policies.google.com/technologies/ads"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            informations de Google relatives à la publicité
          </a>
          .
        </p>

        <p className={paragraphClass}>
          La présente politique ne remplace pas la mise en place des
          mécanismes de consentement, des paramètres de confidentialité
          ou des informations complémentaires éventuellement nécessaires
          à l’utilisation de ces services.
        </p>
      </section>

      <section id="destinataires" className={sectionClass}>
        <h2 className={headingClass}>
          6. Destinataires et services tiers
        </h2>

        <p className={paragraphClass}>
          Les données peuvent être accessibles aux personnes autorisées
          chargées de l’exploitation, de la maintenance et de la sécurité
          du site, dans la limite de leurs attributions.
        </p>

        <p className={paragraphClass}>
          Elles peuvent également être traitées par des prestataires
          techniques intervenant, par exemple, dans l’hébergement,
          l’envoi de messages, la maintenance, la mesure d’audience ou
          la diffusion publicitaire, si ces prestataires sont utilisés.
        </p>

        <p className={paragraphClass}>
          Ces prestataires ne doivent traiter les données que dans la
          mesure nécessaire à leurs missions et conformément aux
          obligations contractuelles et légales applicables.
        </p>

        <p className={paragraphClass}>
          HISTYRA peut aussi proposer des liens vers des sites externes
          ou intégrer des contenus hébergés par des plateformes tierces.
          La consultation de ces services peut entraîner un traitement
          de données par leurs propres exploitants.
        </p>

        <p className={paragraphClass}>
          Nous vous recommandons de consulter les politiques de
          confidentialité des services concernés avant de les utiliser.
        </p>
      </section>

      <section id="securite" className={sectionClass}>
        <h2 className={headingClass}>7. Sécurité des données</h2>

        <p className={paragraphClass}>
          HISTYRA s’engage à mettre en œuvre des mesures techniques et
          organisationnelles raisonnables et adaptées aux risques afin
          de protéger les données personnelles contre l’accès non
          autorisé, la perte, l’altération ou la divulgation.
        </p>

        <p className={paragraphClass}>
          Ces mesures peuvent notamment inclure la limitation des accès,
          la sécurisation des communications, les mises à jour des
          composants techniques et la protection des systèmes
          d’hébergement.
        </p>

        <p className={paragraphClass}>
          Aucun système de transmission ou de stockage électronique ne
          pouvant garantir une sécurité absolue, nous nous efforçons de
          limiter les risques et de réagir de manière appropriée en cas
          d’incident.
        </p>
      </section>

      <section id="conservation" className={sectionClass}>
        <h2 className={headingClass}>8. Durée de conservation</h2>

        <p className={paragraphClass}>
          Les données personnelles sont conservées pendant une durée
          proportionnée aux finalités pour lesquelles elles sont
          collectées, sous réserve des obligations légales applicables
          et des nécessités de gestion des litiges.
        </p>

        <ul className={listClass}>
          <li>
            <strong className="text-white">
              Messages de contact :
            </strong>{" "}
            pendant le temps nécessaire au traitement de la demande et,
            si nécessaire, à son suivi.
          </li>

          <li>
            <strong className="text-white">
              Données de compte :
            </strong>{" "}
            pendant la durée d’existence du compte, puis selon les
            obligations et nécessités légitimes applicables.
          </li>

          <li>
            <strong className="text-white">
              Journaux techniques :
            </strong>{" "}
            pendant la durée nécessaire à la sécurité, à la maintenance
            et au respect des obligations applicables.
          </li>

          <li>
            <strong className="text-white">
              Données publicitaires et cookies :
            </strong>{" "}
            selon la durée de vie des traceurs utilisés et les règles
            définies par les fournisseurs concernés.
          </li>
        </ul>

        <p className={paragraphClass}>
          Ces indications sont générales. Les durées exactes doivent
          être déterminées selon les traitements réellement effectués
          sur HISTYRA.
        </p>
      </section>

      <section id="droits" className={sectionClass}>
        <h2 className={headingClass}>9. Vos droits</h2>

        <p className={paragraphClass}>
          Selon la législation applicable à votre situation, vous pouvez
          disposer de plusieurs droits concernant vos données personnelles,
          notamment :
        </p>

        <ul className={listClass}>
          <li>Demander l’accès à vos données personnelles.</li>
          <li>Demander la rectification de données inexactes.</li>
          <li>Demander l’effacement de certaines données.</li>
          <li>
            Demander la limitation de certains traitements lorsque les
            conditions requises sont réunies.
          </li>
          <li>
            Vous opposer à certains traitements dans les conditions
            prévues par la réglementation.
          </li>
          <li>
            Retirer votre consentement lorsqu’un traitement repose sur
            celui-ci.
          </li>
          <li>
            Demander la portabilité de certaines données lorsque ce droit
            est applicable.
          </li>
        </ul>

        <p className={paragraphClass}>
          Pour exercer un droit ou poser une question concernant vos
          données, écrivez-nous à{" "}
          <a href="mailto:contact@histyra.com" className={linkClass}>
            contact@histyra.com
          </a>
          .
        </p>

        <p className={paragraphClass}>
          Pour protéger vos informations, nous pouvons vous demander
          les éléments strictement nécessaires à la vérification de
          votre identité. Votre demande sera traitée conformément aux
          règles applicables.
        </p>

        <p className={paragraphClass}>
          Lorsque la réglementation applicable le prévoit, vous pouvez
          également adresser une réclamation à l’autorité de protection
          des données compétente dans votre pays.
        </p>
      </section>

      <section id="mineurs" className={sectionClass}>
        <h2 className={headingClass}>10. Protection des mineurs</h2>

        <p className={paragraphClass}>
          HISTYRA est consacré au cinéma, aux films, aux séries et aux
          contenus éditoriaux associés. Les utilisateurs doivent tenir
          compte des restrictions d’âge éventuellement applicables aux
          contenus consultés.
        </p>

        <p className={paragraphClass}>
          Si vous êtes parent ou représentant légal et pensez que des
          données concernant un mineur ont été transmises de manière
          inappropriée, vous pouvez nous contacter afin que la situation
          soit examinée.
        </p>

        <p className={paragraphClass}>
          Les traitements concernant les mineurs doivent respecter les
          exigences légales applicables, notamment lorsque le consentement
          est requis.
        </p>
      </section>

      <section id="transferts" className={sectionClass}>
        <h2 className={headingClass}>
          11. Transferts de données
        </h2>

        <p className={paragraphClass}>
          Certains prestataires techniques ou services tiers peuvent
          traiter des données depuis des pays autres que celui dans
          lequel vous résidez.
        </p>

        <p className={paragraphClass}>
          Lorsque la législation applicable impose des garanties
          particulières pour les transferts internationaux de données,
          les mesures requises doivent être mises en place avant le
          transfert.
        </p>

        <p className={paragraphClass}>
          Les pays de destination et les garanties applicables dépendent
          des prestataires et des services effectivement utilisés par
          HISTYRA.
        </p>
      </section>

      <section id="modifications" className={sectionClass}>
        <h2 className={headingClass}>
          12. Modifications de cette politique
        </h2>

        <p className={paragraphClass}>
          Cette politique peut être modifiée afin de tenir compte de
          l’évolution du site, des fonctionnalités proposées, des
          prestataires utilisés ou des obligations légales applicables.
        </p>

        <p className={paragraphClass}>
          La date de dernière mise à jour figurant en haut de cette page
          permet d’identifier la version publiée. Nous vous invitons à
          consulter régulièrement cette page.
        </p>
      </section>

      <section
        id="contact"
        className={`${sectionClass} rounded-2xl border border-rose-400/20 bg-gradient-to-br from-rose-400/[0.08] to-violet-500/[0.05] p-6 sm:p-8`}
      >
        <h2 className={headingClass}>13. Contact</h2>

        <p className={paragraphClass}>
          Pour toute question concernant cette politique, le traitement
          de vos données personnelles ou l’exercice de vos droits,
          vous pouvez contacter l’équipe HISTYRA.
        </p>

        <p className={paragraphClass}>
          Adresse e-mail :{" "}
          <a href="mailto:contact@histyra.com" className={linkClass}>
            contact@histyra.com
          </a>
        </p>

        <Link
          href="/contact"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-3 font-semibold text-white transition hover:bg-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080b14]"
        >
          Nous contacter
          <span aria-hidden="true">→</span>
        </Link>
      </section>

      <div className="border-t border-white/10 pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
        >
          <span aria-hidden="true">←</span>
          Retour à l’accueil de HISTYRA
        </Link>
      </div>
    </article>
  </div>
</main>


); }