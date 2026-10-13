
"use client";

import { useMemo, useState, useTransition } from "react";
import type { FormEvent } from "react";
import Swal from "sweetalert2";

import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/actions/category-actions";

type Category = {
  id: string;
  name: string;
  slug: string;
  moviesCount: number;
  articlesCount: number;
};

function makeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const swalTheme = {
  background: "#18181b",
  color: "#ffffff",
};

export default function CategoryManager({
  categories,
}: {
  categories: Category[];
}) {
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [customSlug, setCustomSlug] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query)
    );
  }, [categories, search]);

  function resetForm() {
    setName("");
    setSlug("");
    setEditingId(null);
    setCustomSlug(false);
    setError("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("slug", slug || makeSlug(name));

    startTransition(async () => {
      try {
        if (editingId) {
          await updateCategory(editingId, formData);
          setSuccess("Catégorie modifiée avec succès.");
        } else {
          await createCategory(formData);
          setSuccess("Catégorie créée avec succès.");
        }

        resetForm();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Une erreur est survenue."
        );
      }
    });
  }

  function edit(category: Category) {
    setEditingId(category.id);
    setName(category.name);
    setSlug(category.slug);
    setCustomSlug(true);
    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function remove(category: Category) {
    const result = await Swal.fire({
      title: "Supprimer cette catégorie ?",
      text: `La catégorie « ${category.name} » sera supprimée. Les films et articles associés seront conservés sans catégorie.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#52525b",
      reverseButtons: true,
      focusCancel: true,
      ...swalTheme,
    });

    if (!result.isConfirmed) return;

    setError("");
    setSuccess("");

    startTransition(async () => {
      try {
        await deleteCategory(category.id);

        if (editingId === category.id) {
          resetForm();
        }

        setSuccess("Catégorie supprimée avec succès.");

        await Swal.fire({
          title: "Suppression réussie",
          text: `La catégorie « ${category.name} » a été supprimée.`,
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#16a34a",
          ...swalTheme,
        });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Impossible de supprimer cette catégorie.";

        setError(message);

        await Swal.fire({
          title: "Erreur",
          text: message,
          icon: "error",
          confirmButtonText: "Fermer",
          confirmButtonColor: "#dc2626",
          ...swalTheme,
        });
      }
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
      <section className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-xl font-semibold">
          {editingId
            ? "Modifier la catégorie"
            : "Nouvelle catégorie"}
        </h2>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="category-name"
              className="mb-2 block text-sm text-zinc-300"
            >
              Nom
            </label>

            <input
              id="category-name"
              required
              minLength={2}
              maxLength={80}
              value={name}
              onChange={(event) => {
                const value = event.target.value;
                setName(value);

                if (!customSlug) {
                  setSlug(makeSlug(value));
                }
              }}
              placeholder="Ex. Action"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label
              htmlFor="category-slug"
              className="mb-2 block text-sm text-zinc-300"
            >
              Slug
            </label>

            <input
              id="category-slug"
              value={slug}
              onChange={(event) => {
                setCustomSlug(true);
                setSlug(makeSlug(event.target.value));
              }}
              placeholder="ex-action"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 outline-none focus:border-red-500"
            />

            <p className="mt-1 text-xs text-zinc-500">
              Utilisé dans les URL.
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-950 p-3 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          {success && (
            <p
              role="status"
              className="rounded-lg bg-emerald-950 p-3 text-sm text-emerald-300"
            >
              {success}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-lg bg-red-600 px-4 py-3 font-medium hover:bg-red-500 disabled:opacity-50"
            >
              {pending
                ? "Traitement..."
                : editingId
                  ? "Enregistrer"
                  : "Créer"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                disabled={pending}
                className="rounded-lg border border-zinc-700 px-4 py-3 disabled:opacity-50"
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">
            Liste des catégories
          </h2>

          <span className="text-sm text-zinc-400">
            {filtered.length} résultat(s)
          </span>
        </div>

        <input
          aria-label="Rechercher une catégorie"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher une catégorie..."
          className="mt-5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 outline-none focus:border-red-500"
        />

        <div className="mt-5 space-y-3">
          {filtered.map((category) => (
            <article
              key={category.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-800 p-4"
            >
              <div className="min-w-0">
                <h3 className="font-semibold">
                  {category.name}
                </h3>

                <p className="mt-1 break-all text-sm text-zinc-500">
                  /{category.slug}
                </p>

                <p className="mt-2 text-xs text-zinc-400">
                  {category.moviesCount} film(s) ·{" "}
                  {category.articlesCount} article(s)
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => edit(category)}
                  className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800 disabled:opacity-50"
                >
                  Modifier
                </button>

                <button
                  type="button"
                  disabled={pending}
                  onClick={() => remove(category)}
                  className="rounded-lg border border-red-900 px-3 py-2 text-sm text-red-300 hover:bg-red-950 disabled:opacity-50"
                >
                  Supprimer
                </button>
              </div>
            </article>
          ))}

          {filtered.length === 0 && (
            <p className="py-10 text-center text-zinc-500">
              Aucune catégorie trouvée.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
