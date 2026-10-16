
"use client";

import { useState, type FormEvent } from "react";

type FormStatus = "idle" | "loading" | "success" | "error";

const inputClass =
  "mt-2 w-full rounded-xl border border-white/10 bg-[#080b14] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/15";

export default function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (status === "loading") return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          subject: formData.get("subject"),
          message: formData.get("message"),
          website: formData.get("website"),
        }),
      });

      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
            "Impossible d'envoyer le message. Réessaie plus tard.",
        );
      }

      form.reset();
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue. Réessaie plus tard.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Champ anti-spam : les visiteurs ne doivent pas le remplir */}
      <div
        aria-hidden="true"
        className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
      >
        <label htmlFor="contact-website">
          Ne pas remplir ce champ
        </label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="contact-name"
            className="text-sm font-semibold text-slate-200"
          >
            Ton nom *
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            minLength={2}
            maxLength={100}
            required
            disabled={status === "loading"}
            placeholder="Ton nom"
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="contact-email"
            className="text-sm font-semibold text-slate-200"
          >
            Ton adresse e-mail *
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            disabled={status === "loading"}
            placeholder="toi@exemple.com"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="contact-subject"
          className="text-sm font-semibold text-slate-200"
        >
          Sujet *
        </label>
        <select
          id="contact-subject"
          name="subject"
          required
          disabled={status === "loading"}
          defaultValue=""
          className={inputClass}
        >
          <option value="" disabled>
            Choisis le sujet de ton message
          </option>
          <option value="Question générale">Question générale</option>
          <option value="Suggestion">Suggestion</option>
          <option value="Partenariat">Partenariat</option>
          <option value="Problème technique">Problème technique</option>
          <option value="Autre demande">Autre demande</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="text-sm font-semibold text-slate-200"
        >
          Ton message *
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={7}
          disabled={status === "loading"}
          placeholder="Dis-nous comment nous pouvons t'aider..."
          className={`${inputClass} resize-y`}
        />
        <p className="mt-2 text-xs text-slate-500">
          Décris ta demande en 10 à 5 000 caractères.
        </p>
      </div>

      <p className="text-xs leading-6 text-slate-500">
        En envoyant ce formulaire, tu acceptes que tes informations
        soient utilisées pour répondre à ta demande.
      </p>

      {status === "success" && (
        <div
          role="status"
          className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm leading-6 text-emerald-300"
        >
          <p className="font-bold">Message envoyé !</p>
          <p className="mt-1">
            Merci d'avoir contacté HISTYRA. Ton message a été transmis.
          </p>
        </div>
      )}

      {status === "error" && (
        <div
          role="alert"
          className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm leading-6 text-red-300"
        >
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-sky-400 px-6 py-4 font-bold text-slate-950 transition hover:bg-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === "loading" ? (
          <>
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950"
            />
            Envoi en cours...
          </>
        ) : (
          <>
            Envoyer mon message <span aria-hidden="true">→</span>
          </>
        )}
      </button>
    </form>
  );
}
