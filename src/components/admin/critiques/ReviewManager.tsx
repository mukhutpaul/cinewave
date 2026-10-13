
"use client";

import { useMemo, useState, useTransition } from "react";
import type { FormEvent } from "react";
import Select from "react-select";
import type { StylesConfig } from "react-select";
import Swal from "sweetalert2";

import {
  createReview,
  updateReview,
  deleteReview,
} from "@/lib/actions/review-actions";

type ReviewStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

type Review = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  authorName: string;
  rating: number | null;
  status: ReviewStatus;
  movieId: string | null;
  movieTitle: string | null;
  publishedAt: string | null;
};

type Movie = {
  id: string;
  title: string;
};

type ReviewForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  authorName: string;
  rating: string;
  status: ReviewStatus;
  movieId: string;
};

type SelectOption = {
  value: string;
  label: string;
};

const emptyForm: ReviewForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  authorName: "",
  rating: "",
  status: "DRAFT",
  movieId: "",
};

const statusLabels: Record<ReviewStatus, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
  ARCHIVED: "Archivé",
};

const statusOptions: SelectOption[] = [
  { value: "DRAFT", label: "Brouillon" },
  { value: "PUBLISHED", label: "Publié" },
  { value: "ARCHIVED", label: "Archivé" },
];

const filterStatusOptions: SelectOption[] = [
  { value: "ALL", label: "Tous les statuts" },
  { value: "DRAFT", label: "Brouillons" },
  { value: "PUBLISHED", label: "Publiées" },
  { value: "ARCHIVED", label: "Archivées" },
];

const swalTheme = {
  background: "#18181b",
  color: "#ffffff",
};

const selectStyles: StylesConfig<SelectOption, false> = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "#09090b",
    borderColor: state.isFocused ? "#ef4444" : "#3f3f46",
    borderRadius: "0.5rem",
    minHeight: "48px",
    boxShadow: "none",
    cursor: "pointer",
    "&:hover": {
      borderColor: "#ef4444",
    },
  }),

  menu: (base) => ({
    ...base,
    backgroundColor: "#18181b",
    border: "1px solid #3f3f46",
    borderRadius: "0.5rem",
    overflow: "hidden",
    zIndex: 50,
  }),

  menuList: (base) => ({
    ...base,
    padding: "4px",
  }),

  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#dc2626"
      : state.isFocused
        ? "#27272a"
        : "transparent",
    color: "#ffffff",
    borderRadius: "0.375rem",
    cursor: "pointer",
    "&:active": {
      backgroundColor: "#b91c1c",
    },
  }),

  singleValue: (base) => ({
    ...base,
    color: "#ffffff",
  }),

  input: (base) => ({
    ...base,
    color: "#ffffff",
  }),

  placeholder: (base) => ({
    ...base,
    color: "#71717a",
  }),

  indicatorSeparator: (base) => ({
    ...base,
    backgroundColor: "#3f3f46",
  }),

  dropdownIndicator: (base) => ({
    ...base,
    color: "#a1a1aa",
    "&:hover": {
      color: "#ffffff",
    },
  }),

  clearIndicator: (base) => ({
    ...base,
    color: "#a1a1aa",
    "&:hover": {
      color: "#ffffff",
    },
  }),

  noOptionsMessage: (base) => ({
    ...base,
    color: "#a1a1aa",
  }),
};

function makeSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function ReviewManager({
  reviews,
  movies,
}: {
  reviews: Review[];
  movies: Movie[];
}) {
  const [form, setForm] = useState<ReviewForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [customSlug, setCustomSlug] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, startTransition] = useTransition();

  const movieOptions = useMemo<SelectOption[]>(
    () =>
      movies.map((movie) => ({
        value: movie.id,
        label: movie.title,
      })),
    [movies]
  );

  const selectedMovie = useMemo(
    () => movieOptions.find((option) => option.value === form.movieId) ?? null,
    [movieOptions, form.movieId]
  );

  const selectedStatus = useMemo(
    () =>
      statusOptions.find((option) => option.value === form.status) ?? null,
    [form.status]
  );

  const selectedFilterStatus = useMemo(
    () =>
      filterStatusOptions.find(
        (option) => option.value === statusFilter
      ) ?? filterStatusOptions[0],
    [statusFilter]
  );

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return reviews.filter((review) => {
      const matchesQuery =
        review.title.toLowerCase().includes(query) ||
        review.authorName.toLowerCase().includes(query) ||
        review.slug.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" || review.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [reviews, search, statusFilter]);

  function resetForm() {
    setForm({ ...emptyForm });
    setEditingId(null);
    setCustomSlug(false);
    setError("");
  }

  function setField<K extends keyof ReviewForm>(
    key: K,
    value: ReviewForm[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const data = new FormData();

    data.set("title", form.title.trim());
    data.set("slug", makeSlug(form.slug || form.title));
    data.set("excerpt", form.excerpt.trim());
    data.set("content", form.content.trim());
    data.set("authorName", form.authorName.trim());
    data.set("rating", form.rating);
    data.set("status", form.status);
    data.set("movieId", form.movieId);

    startTransition(async () => {
      try {
        if (editingId) {
          await updateReview(editingId, data);
          setSuccess("Critique modifiée avec succès.");
        } else {
          await createReview(data);
          setSuccess("Critique créée avec succès.");
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

  function edit(review: Review) {
    setEditingId(review.id);
    setCustomSlug(true);

    setForm({
      title: review.title,
      slug: review.slug,
      excerpt: review.excerpt,
      content: review.content,
      authorName: review.authorName,
      rating: review.rating === null ? "" : String(review.rating),
      status: review.status,
      movieId: review.movieId ?? "",
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function remove(review: Review) {
    const result = await Swal.fire({
      title: "Supprimer cette critique ?",
      text: `Voulez-vous vraiment supprimer « ${review.title} » ? Cette action est irréversible.`,
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
        await deleteReview(review.id);

        if (editingId === review.id) {
          resetForm();
        }

        setSuccess("Critique supprimée avec succès.");

        await Swal.fire({
          title: "Suppression réussie",
          text: `La critique « ${review.title} » a été supprimée.`,
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#16a34a",
          ...swalTheme,
        });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Impossible de supprimer cette critique.";

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
    <div className="space-y-8">
      {/* Formulaire de création et de modification */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 md:p-7">
        <h2 className="text-xl font-semibold">
          {editingId ? "Modifier la critique" : "Rédiger une critique"}
        </h2>

        <form onSubmit={submit} className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="review-title"
              className="mb-2 block text-sm text-zinc-300"
            >
              Titre
            </label>

            <input
              id="review-title"
              required
              maxLength={180}
              value={form.title}
              onChange={(event) => {
                const title = event.target.value;
                setField("title", title);

                if (!customSlug) {
                  setField("slug", makeSlug(title));
                }
              }}
              placeholder="Ex. Notre avis sur ce film"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label
              htmlFor="review-slug"
              className="mb-2 block text-sm text-zinc-300"
            >
              Slug
            </label>

            <input
              id="review-slug"
              value={form.slug}
              onChange={(event) => {
                setCustomSlug(true);
                setField("slug", makeSlug(event.target.value));
              }}
              placeholder="notre-avis-sur-ce-film"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label
              htmlFor="review-author"
              className="mb-2 block text-sm text-zinc-300"
            >
              Auteur
            </label>

            <input
              id="review-author"
              required
              maxLength={120}
              value={form.authorName}
              onChange={(event) =>
                setField("authorName", event.target.value)
              }
              placeholder="Nom de l'auteur"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label
              htmlFor="review-movie"
              className="mb-2 block text-sm text-zinc-300"
            >
              Film associé
            </label>

            <Select<SelectOption, false>
              inputId="review-movie"
              instanceId="review-movie"
              options={movieOptions}
              value={selectedMovie}
              onChange={(option) =>
                setField("movieId", option?.value ?? "")
              }
              placeholder="Rechercher un film..."
              noOptionsMessage={() => "Aucun film trouvé"}
              isClearable
              isSearchable
              isDisabled={pending}
              styles={selectStyles}
              className="text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="review-rating"
              className="mb-2 block text-sm text-zinc-300"
            >
              Note sur 10 (facultative)
            </label>

            <input
              id="review-rating"
              type="number"
              min="0"
              max="10"
              step="1"
              value={form.rating}
              onChange={(event) =>
                setField("rating", event.target.value)
              }
              placeholder="Ex. 8"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label
              htmlFor="review-status"
              className="mb-2 block text-sm text-zinc-300"
            >
              Statut
            </label>

            <Select<SelectOption, false>
              inputId="review-status"
              instanceId="review-status"
              options={statusOptions}
              value={selectedStatus}
              onChange={(option) => {
                if (option) {
                  setField("status", option.value as ReviewStatus);
                }
              }}
              isSearchable={false}
              isClearable={false}
              isDisabled={pending}
              styles={selectStyles}
              className="text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="review-excerpt"
              className="mb-2 block text-sm text-zinc-300"
            >
              Résumé
            </label>

            <textarea
              id="review-excerpt"
              required
              maxLength={500}
              rows={3}
              value={form.excerpt}
              onChange={(event) =>
                setField("excerpt", event.target.value)
              }
              placeholder="Présentez brièvement cette critique..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 outline-none focus:border-red-500"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="review-content"
              className="mb-2 block text-sm text-zinc-300"
            >
              Contenu de la critique
            </label>

            <textarea
              id="review-content"
              required
              rows={10}
              value={form.content}
              onChange={(event) =>
                setField("content", event.target.value)
              }
              placeholder="Rédigez votre critique..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 outline-none focus:border-red-500"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-950 p-3 text-sm text-red-300 md:col-span-2"
            >
              {error}
            </p>
          )}

          {success && (
            <p
              role="status"
              className="rounded-lg bg-emerald-950 p-3 text-sm text-emerald-300 md:col-span-2"
            >
              {success}
            </p>
          )}

          <div className="flex flex-wrap gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-red-600 px-5 py-3 font-medium hover:bg-red-500 disabled:opacity-50"
            >
              {pending
                ? "Traitement..."
                : editingId
                  ? "Enregistrer les modifications"
                  : "Créer la critique"}
            </button>

            {editingId && (
              <button
                type="button"
                disabled={pending}
                onClick={resetForm}
                className="rounded-lg border border-zinc-700 px-5 py-3 disabled:opacity-50"
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Liste des critiques */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Toutes les critiques</h2>

          <span className="text-sm text-zinc-400">
            {filtered.length} résultat(s)
          </span>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_220px]">
          <input
            aria-label="Rechercher une critique"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher par titre, auteur ou slug..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 outline-none focus:border-red-500"
          />

          <Select<SelectOption, false>
            inputId="review-status-filter"
            instanceId="review-status-filter"
            aria-label="Filtrer par statut"
            options={filterStatusOptions}
            value={selectedFilterStatus}
            onChange={(option) =>
              setStatusFilter(option?.value ?? "ALL")
            }
            isSearchable={false}
            isClearable={false}
            styles={selectStyles}
            className="text-sm"
          />
        </div>

        <div className="mt-5 space-y-3">
          {filtered.map((review) => (
            <article
              key={review.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-800 p-4"
            >
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold">{review.title}</h3>

                <p className="mt-1 break-all text-sm text-zinc-500">
                  /{review.slug}
                </p>

                <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-400">
                  <span>{review.authorName}</span>
                  <span>·</span>
                  <span>{review.movieTitle ?? "Sans film associé"}</span>
                  <span>·</span>
                  <span>
                    {review.rating === null
                      ? "Sans note"
                      : `${review.rating}/10`}
                  </span>
                </div>

                <p className="mt-2 text-sm text-zinc-400">
                  Statut : {statusLabels[review.status]}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => edit(review)}
                  className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800 disabled:opacity-50"
                >
                  Modifier
                </button>

                <button
                  type="button"
                  disabled={pending}
                  onClick={() => remove(review)}
                  className="rounded-lg border border-red-900 px-3 py-2 text-sm text-red-300 hover:bg-red-950 disabled:opacity-50"
                >
                  Supprimer
                </button>
              </div>
            </article>
          ))}

          {filtered.length === 0 && (
            <p className="py-10 text-center text-zinc-500">
              Aucune critique trouvée.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
