"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type UserSearchProps = {
  initialQuery: string;
};

export function UserSearch({ initialQuery }: UserSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialQuery);
  const skipFirstSearchEffect = useRef(true);

  // Synchronise le champ lorsque la recherche serveur change l'URL.
  useEffect(() => {
    setValue(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    // Ne pas effacer les notifications message/erreur lors du chargement initial.
    if (skipFirstSearchEffect.current) {
      skipFirstSearchEffect.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      const nextParams = new URLSearchParams(searchParams.toString());
      const trimmed = value.trim();

      if (trimmed) {
        nextParams.set("q", trimmed);
      } else {
        nextParams.delete("q");
      }

      // Une recherche manuelle efface les anciennes notifications flash.
      nextParams.delete("message");
      nextParams.delete("erreur");

      const nextQuery = nextParams.toString();
      const currentQuery = searchParams.toString();

      if (nextQuery !== currentQuery) {
        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
          scroll: false,
        });
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [value, pathname, router, searchParams]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextParams = new URLSearchParams(searchParams.toString());
    const trimmed = value.trim();

    if (trimmed) {
      nextParams.set("q", trimmed);
    } else {
      nextParams.delete("q");
    }

    nextParams.delete("message");
    nextParams.delete("erreur");

    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }

  function clearSearch() {
    setValue("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="flex flex-col gap-3 sm:flex-row"
    >
      <label htmlFor="q" className="sr-only">
        Rechercher un utilisateur
      </label>

      <input
        id="q"
        name="q"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Rechercher par nom ou adresse e-mail..."
        autoComplete="off"
        className="input input-bordered w-full border-white/10 bg-[#080b14] text-white placeholder:text-slate-500"
      />

      {value && (
        <button
          type="button"
          onClick={clearSearch}
          className="btn btn-outline border-white/15"
        >
          Effacer
        </button>
      )}

      <button type="submit" className="btn btn-error text-white">
        Rechercher
      </button>
    </form>
  );
}
