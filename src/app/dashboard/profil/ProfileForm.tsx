
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserRound,
  Mail,
  ShieldCheck,
  Camera,
  Save,
  RotateCcw,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

type ProfileFormProps = {
  user: {
    name: string;
    email: string;
    image: string;
    role: string;
  };
};

export default function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();

  const [name, setName] = useState(user.name);
  const [image, setImage] = useState(user.image);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Deux initiales centrées dans l'avatar
  const initials =
    user.name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "U";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setError("");

    const cleanName = name.trim();
    const cleanImage = image.trim();

    if (cleanName.length < 2) {
      setError("Le nom doit contenir au moins 2 caractères.");
      return;
    }

    if (cleanName.length > 100) {
      setError("Le nom ne peut pas dépasser 100 caractères.");
      return;
    }

    if (cleanImage) {
      try {
        const url = new URL(cleanImage);

        if (url.protocol !== "https:" && url.protocol !== "http:") {
          setError("Veuillez saisir une URL HTTP ou HTTPS valide.");
          return;
        }
      } catch {
        setError("L'URL de la photo n'est pas valide.");
        return;
      }
    }

    setSaving(true);

    try {
      const result = await authClient.updateUser({
        name: cleanName,
        image: cleanImage || null,
      });

      if (result.error) {
        setError(
          result.error.message ||
            "Impossible de modifier votre profil."
        );
        return;
      }

      setMessage("Votre profil a été mis à jour avec succès.");
      router.refresh();
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      {/* Carte utilisateur */}
      <aside className="card h-fit border border-white/10 bg-[#101522] shadow-xl">
        <div className="card-body items-center text-center">
          {/* Avatar avec deux initiales parfaitement centrées */}
          <div className="avatar placeholder mb-3">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-rose-500/15 text-3xl font-bold text-rose-400 ring-4 ring-rose-500/20">
              {image.trim() ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image.trim()}
                  alt="Photo de profil"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center">
                  {initials}
                </span>
              )}
            </div>
          </div>

          <h2 className="max-w-full break-words text-xl font-bold">
            {name.trim() || "Utilisateur Histyra"}
          </h2>

          <p className="max-w-full break-all text-sm text-slate-400">
            {user.email}
          </p>

          <div className="badge badge-error mt-2 gap-1 px-3 py-3 text-white">
            <ShieldCheck size={14} />
            {user.role}
          </div>

          <div className="mt-5 w-full rounded-xl border border-white/10 bg-white/5 p-4 text-left">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Statut du compte
            </p>

            <p className="mt-2 flex items-center gap-2 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Connecté
            </p>
          </div>
        </div>
      </aside>

      {/* Formulaire du profil */}
      <section className="card border border-white/10 bg-[#101522] shadow-xl">
        <div className="card-body p-5 sm:p-8">
          <div className="mb-2">
            <h2 className="text-xl font-bold">
              Informations personnelles
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Modifiez les informations associées à votre compte.
            </p>
          </div>

          {message && (
            <div
              role="status"
              className="alert alert-success my-3 text-sm"
            >
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="alert alert-error my-3 text-sm"
            >
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-6">
            {/* Nom complet */}
            <div className="form-control w-full">
              <label htmlFor="name" className="label">
                <span className="label-text font-medium text-slate-200">
                  Nom complet
                </span>
              </label>

              <label className="input input-bordered flex w-full items-center gap-3 border-white/10 bg-[#080b14] focus-within:border-rose-500">
                <UserRound size={18} className="text-slate-500" />

                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  maxLength={100}
                  minLength={2}
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setMessage("");
                    setError("");
                  }}
                  placeholder="Votre nom complet"
                  className="grow bg-transparent text-white outline-none"
                />
              </label>
            </div>

            {/* Adresse e-mail */}
            <div className="form-control w-full">
              <label htmlFor="email" className="label">
                <span className="label-text font-medium text-slate-200">
                  Adresse e-mail
                </span>

                <span className="label-text-alt text-slate-500">
                  Non modifiable ici
                </span>
              </label>

              <label className="input input-bordered flex w-full items-center gap-3 border-white/10 bg-white/5">
                <Mail size={18} className="text-slate-500" />

                <input
                  id="email"
                  type="email"
                  value={user.email}
                  readOnly
                  className="grow bg-transparent text-slate-400 outline-none"
                />
              </label>
            </div>

            {/* Photo de profil */}
            <div className="form-control w-full">
              <label htmlFor="image" className="label">
                <span className="label-text font-medium text-slate-200">
                  Photo de profil
                </span>
              </label>

              <label className="input input-bordered flex w-full items-center gap-3 border-white/10 bg-[#080b14] focus-within:border-rose-500">
                <Camera size={18} className="text-slate-500" />

                <input
                  id="image"
                  name="image"
                  type="url"
                  value={image}
                  onChange={(e) => {
                    setImage(e.target.value);
                    setMessage("");
                    setError("");
                  }}
                  placeholder="https://exemple.com/photo.jpg"
                  className="grow bg-transparent text-white outline-none"
                />
              </label>

              <p className="mt-2 text-xs text-slate-500">
                Saisissez une URL d'image accessible publiquement,
                ou laissez ce champ vide pour supprimer la photo.
              </p>
            </div>

            {/* Rôle du compte */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium text-slate-200">
                  Rôle du compte
                </span>
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                <ShieldCheck size={19} className="text-rose-400" />

                <div>
                  <p className="font-semibold">{user.role}</p>

                  <p className="text-xs text-slate-500">
                    Le rôle est géré par l'administration.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setName(user.name);
                  setImage(user.image);
                  setError("");
                  setMessage("");
                }}
                disabled={saving}
                className="btn btn-ghost"
              >
                <RotateCcw size={17} />
                Réinitialiser
              </button>

              <button
                type="submit"
                disabled={saving}
                className="btn btn-error text-white"
              >
                {saving ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <Save size={17} />
                )}

                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
