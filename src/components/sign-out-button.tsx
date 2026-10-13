"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignOut() {
    setLoading(true);
    setError("");

    try {
      const result = await authClient.signOut();

      if (result.error) {
        setError("Déconnexion impossible. Réessaie.");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("Une erreur est survenue pendant la déconnexion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={loading}
        className="btn btn-ghost btn-sm text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
      >
        {loading ? "Déconnexion..." : "Déconnexion"}
      </button>

      {error && (
        <p role="alert" className="mt-1 max-w-48 text-xs text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}