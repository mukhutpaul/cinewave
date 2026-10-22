"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type AuthFormProps = {
  mode: "signup" | "signin";
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";
  const passwordsMatch = password === confirmPassword;
  const passwordValid = password.length >= 8 && password.length <= 128;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim();
    const normalizedName = name.trim();

    if (isSignup && normalizedName.length < 2) {
      setError("Ton nom doit contenir au moins 2 caractères.");
      return;
    }

    if (!passwordValid) {
      setError("Le mot de passe doit contenir entre 8 et 128 caractères.");
      return;
    }

    if (isSignup && password !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const result = isSignup
        ? await authClient.signUp.email({
            name: normalizedName,
            email: normalizedEmail,
            password,
          })
        : await authClient.signIn.email({
            email: normalizedEmail,
            password,
          });

      if (result.error) {
        setError(
          isSignup
            ? result.error.message ||
                "Impossible de créer ton compte. Vérifie tes informations."
            : "Adresse e-mail ou mot de passe incorrect.",
        );
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError(
        "Une erreur est survenue. Vérifie ta connexion et réessaie.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-4 py-12 sm:px-6">
      {/* Décoration du fond */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-rose-600/10 blur-[100px]" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-violet-600/10 blur-[100px]" />
      </div>

      <section className="relative w-full max-w-md">
        {/* Identité Histyra */}
        <div className="mb-7 text-center">
          <Link
            href="/"
            aria-label="Histyra, accueil"
            className="inline-flex items-center gap-3"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-700 text-xl font-black text-white shadow-lg shadow-rose-950/40">
              H
            </span>

            <span className="text-3xl font-black tracking-tight text-white">
              His<span className="text-rose-500">tyra</span>
            </span>
          </Link>

          <p className="mt-3 text-sm text-slate-400">
            L'histoire mérite un autre regard.
          </p>
        </div>

        {/* Formulaire */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="h-1 w-full bg-gradient-to-r from-rose-600 via-pink-500 to-violet-600" />

          <div className="p-6 sm:p-8">
            <div className="mb-7">
              <span className="badge badge-outline border-rose-500/40 text-rose-400">
                {isSignup ? "Nouveau membre" : "Espace membre"}
              </span>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-white">
                {isSignup ? "Rejoins Histyra." : "Heureux de te revoir."}
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                {isSignup
                  ? "Crée ton compte et plonge dans l'univers du cinéma."
                  : "Connecte-toi pour retrouver ton espace personnel."}
              </p>
            </div>

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="alert alert-error mb-5 items-start rounded-xl text-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              onChange={() => error && setError("")}
              className="space-y-5"
            >
              {isSignup && (
                <div className="form-control w-full">
                  <label htmlFor="auth-name" className="label pb-2">
                    <span className="label-text font-semibold text-slate-200">
                      Nom affiché
                    </span>
                  </label>

                  <input
                    id="auth-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    minLength={2}
                    maxLength={80}
                    required
                    placeholder="Comment t'appelle-t-on ?"
                    className="input input-lg w-full border-white/10 bg-slate-950/70 text-white placeholder:text-slate-600 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
              )}

              <div className="form-control w-full">
                <label htmlFor="auth-email" className="label pb-2">
                  <span className="label-text font-semibold text-slate-200">
                    Adresse e-mail
                  </span>
                </label>

                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  maxLength={254}
                  required
                  placeholder="toi@exemple.com"
                  className="input input-lg w-full border-white/10 bg-slate-950/70 text-white placeholder:text-slate-600 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="form-control w-full">
                <label htmlFor="auth-password" className="label pb-2">
                  <span className="label-text font-semibold text-slate-200">
                    Mot de passe
                  </span>
                </label>

                <div className="relative">
                  <input
                    id="auth-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      isSignup ? "new-password" : "current-password"
                    }
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={8}
                    maxLength={128}
                    required
                    placeholder="8 caractères minimum"
                    className="input input-lg w-full border-white/10 bg-slate-950/70 pr-20 text-white placeholder:text-slate-600 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute inset-y-0 right-3 my-auto text-xs font-semibold text-slate-400 hover:text-rose-400"
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                  >
                    {showPassword ? "Masquer" : "Afficher"}
                  </button>
                </div>

                {isSignup && password.length > 0 && (
                  <p
                    className={`mt-2 text-xs ${
                      passwordValid ? "text-emerald-400" : "text-slate-400"
                    }`}
                  >
                    {passwordValid
                      ? "✓ Longueur du mot de passe valide"
                      : "8 caractères minimum"}
                  </p>
                )}
              </div>

              {isSignup && (
                <div className="form-control w-full">
                  <label htmlFor="auth-confirm-password" className="label pb-2">
                    <span className="label-text font-semibold text-slate-200">
                      Confirmer le mot de passe
                    </span>
                  </label>

                  <div className="relative">
                    <input
                      id="auth-confirm-password"
                      name="confirmPassword"
                      type={showConfirmation ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      minLength={8}
                      maxLength={128}
                      required
                      placeholder="Saisis à nouveau ton mot de passe"
                      aria-invalid={
                        confirmPassword.length > 0 && !passwordsMatch
                      }
                      className={`input input-lg w-full bg-slate-950/70 pr-20 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 ${
                        confirmPassword.length === 0
                          ? "border-white/10 focus:border-rose-500 focus:ring-rose-500/20"
                          : passwordsMatch
                            ? "border-emerald-500/60 focus:border-emerald-500 focus:ring-emerald-500/20"
                            : "border-rose-500/70 focus:border-rose-500 focus:ring-rose-500/20"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmation((value) => !value)
                      }
                      className="absolute inset-y-0 right-3 my-auto text-xs font-semibold text-slate-400 hover:text-rose-400"
                      aria-label={
                        showConfirmation
                          ? "Masquer la confirmation"
                          : "Afficher la confirmation"
                      }
                    >
                      {showConfirmation ? "Masquer" : "Afficher"}
                    </button>
                  </div>

                  {confirmPassword.length > 0 && (
                    <p
                      className={`mt-2 text-xs ${
                        passwordsMatch
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                      aria-live="polite"
                    >
                      {passwordsMatch
                        ? "✓ Les mots de passe correspondent"
                        : "Les mots de passe ne correspondent pas"}
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-lg mt-2 w-full border-0 bg-gradient-to-r from-rose-600 to-pink-600 text-base font-bold text-white shadow-lg shadow-rose-950/30 transition hover:from-rose-500 hover:to-pink-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    {isSignup ? "Création du compte…" : "Connexion…"}
                  </>
                ) : isSignup ? (
                  "Créer mon compte →"
                ) : (
                  "Se connecter →"
                )}
              </button>

              <p className="text-center text-xs leading-5 text-slate-500">
                {isSignup
                  ? "En créant un compte, tu pourras retrouver plus facilement ton espace Histyra."
                  : "Tes identifiants restent confidentiels."}
              </p>
            </form>

            <div className="divider my-6 text-xs text-slate-600">
              {isSignup ? "DÉJÀ MEMBRE ?" : "NOUVEAU SUR Histyra ?"}
            </div>

            <p className="text-center text-sm text-slate-400">
              {isSignup ? "Tu as déjà un compte ?" : "Pas encore de compte ?"}{" "}
              <Link
                href={isSignup ? "/connexion" : "/inscription"}
                className="font-bold text-rose-400 transition hover:text-rose-300 hover:underline"
              >
                {isSignup ? "Connecte-toi" : "Créer un compte"}
              </Link>
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="mt-6 block text-center text-sm text-slate-500 transition hover:text-white"
        >
          ← Retour à l'accueil
        </Link>
      </section>
    </main>
  );
}