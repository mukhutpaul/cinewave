
"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  saveMovie,
  searchMovies,
  toggleMovieFeatured,
  updateMovieStatus,
} from "./actions";

type VideoSourceRow = {
  id?: string;
  label: string;
  url: string;
  provider: "OWN_HOSTING" | "EXTERNAL";
  isPrimary: boolean;
  sortOrder?: number;
};

type MovieRow = {
  id: string;
  title: string;
  slug: string;
  synopsis: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseYear: number | null;
  duration: number | null;
  type: "MOVIE" | "SERIES";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: Date | null;
  categoryId: string | null;
  category: { name: string } | null;
  videoSources: VideoSourceRow[];
  _count: { reviews: number };
};

type Category = {
  id: string;
  name: string;
};

type Props = {
  initialMovies: MovieRow[];
  categories: Category[];
};

type ImageKind = "poster" | "backdrop";

const statusLabels: Record<MovieRow["status"], string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
  ARCHIVED: "Archivé",
};

const statusStyles: Record<MovieRow["status"], string> = {
  DRAFT: "badge-ghost",
  PUBLISHED: "badge-success",
  ARCHIVED: "badge-warning",
};

const inputClass =
  "input input-bordered w-full bg-base-100 focus:outline-primary";

const selectClass =
  "select select-bordered w-full bg-base-100 focus:outline-primary";

const labelClass = "mb-1.5 block text-sm font-medium";

const MAX_VIDEO_SIZE = 500 * 1024 * 1024;
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeVideoSources(
  sources: VideoSourceRow[] | undefined,
): VideoSourceRow[] {
  return (sources ?? []).map((source) => ({
    id: source.id,
    label: source.label,
    url: source.url,
    provider: source.provider,
    isPrimary: source.isPrimary,
    sortOrder: source.sortOrder,
  }));
}

export default function FilmsManager({
  initialMovies,
  categories,
}: Props) {
  const [movies, setMovies] = useState<MovieRow[]>(initialMovies);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [editing, setEditing] = useState<MovieRow | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [posterUrl, setPosterUrl] = useState("");
  const [backdropUrl, setBackdropUrl] = useState("");
  const [uploadingImage, setUploadingImage] =
    useState<ImageKind | null>(null);

  const [videoSources, setVideoSources] = useState<VideoSourceRow[]>([]);
  const [externalVideoUrl, setExternalVideoUrl] = useState("");
  const [externalVideoLabel, setExternalVideoLabel] =
    useState("Source externe");
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const busy = saving || uploadingVideo || uploadingImage !== null;

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const results = await searchMovies(
        query,
        typeFilter,
        statusFilter,
      );

      setMovies(results as MovieRow[]);
    } catch {
      toast.error("Impossible de charger le catalogue.");
    } finally {
      setLoading(false);
    }
  }, [query, typeFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void refresh();
    }, 350);

    return () => clearTimeout(timer);
  }, [refresh]);

  function openCreate() {
    setEditing(null);
    setPosterUrl("");
    setBackdropUrl("");
    setVideoSources([]);
    setExternalVideoUrl("");
    setExternalVideoLabel("Source externe");
    setModalOpen(true);
  }

  function openEdit(movie: MovieRow) {
    setEditing(movie);
    setPosterUrl(movie.posterUrl ?? "");
    setBackdropUrl(movie.backdropUrl ?? "");
    setVideoSources(normalizeVideoSources(movie.videoSources));
    setExternalVideoUrl("");
    setExternalVideoLabel("Source externe");
    setModalOpen(true);
  }

  function closeModal() {
    if (busy) return;

    setModalOpen(false);
    setEditing(null);
    setPosterUrl("");
    setBackdropUrl("");
    setVideoSources([]);
    setExternalVideoUrl("");
    setExternalVideoLabel("Source externe");
  }

  async function handleImageUpload(
    kind: ImageKind,
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const input = event.currentTarget;
    const file = input.files?.[0];

    // Permet de sélectionner de nouveau le même fichier après une erreur.
    input.value = "";

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Format refusé. Utilisez JPG, PNG ou WebP.");
      return;
    }

    if (file.size <= 0 || file.size > MAX_IMAGE_SIZE) {
      toast.error("L'image doit peser au maximum 8 Mo.");
      return;
    }

    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
    const uploadPreset =
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim();

    if (!cloudName || !uploadPreset) {
      toast.error(
        "Configuration Cloudinary manquante. Vérifiez votre fichier .env.",
      );
      return;
    }

    setUploadingImage(kind);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", "cinewave");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(
          cloudName,
        )}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.error?.message === "string"
            ? data.error.message
            : "Impossible d'envoyer l'image vers Cloudinary.",
        );
      }

      if (
        typeof data.secure_url !== "string" ||
        !data.secure_url.startsWith("https://")
      ) {
        throw new Error("Cloudinary n'a pas retourné une URL valide.");
      }

      if (kind === "poster") {
        setPosterUrl(data.secure_url);
      } else {
        setBackdropUrl(data.secure_url);
      }

      toast.success(
        kind === "poster"
          ? "Affiche envoyée sur Cloudinary."
          : "Image de fond envoyée sur Cloudinary.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur pendant l'envoi de l'image.",
      );
    } finally {
      setUploadingImage(null);
    }
  }

  async function handleVideoUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";

    if (!file) return;

    if (
      file.type !== "video/mp4" &&
      !file.name.toLowerCase().endsWith(".mp4")
    ) {
      toast.error("Sélectionnez un fichier MP4.");
      return;
    }

    if (file.size <= 0 || file.size > MAX_VIDEO_SIZE) {
      toast.error("La vidéo doit peser au maximum 500 Mo.");
      return;
    }

    setUploadingVideo(true);

    try {
      const response = await fetch("/api/admin/video-upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: "video/mp4",
          fileSize: file.size,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Impossible de préparer l'envoi de la vidéo.",
        );
      }

      if (
        typeof data.uploadUrl !== "string" ||
        typeof data.publicUrl !== "string"
      ) {
        throw new Error("Les URL nécessaires à l'envoi sont absentes.");
      }

      const uploadResponse = await fetch(data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "video/mp4" },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error(
          "Échec de l'envoi vers R2. Vérifiez le CORS et le bucket.",
        );
      }

      setVideoSources((current) => [
        ...current.map((source) => ({
          ...source,
          isPrimary: false,
        })),
        {
          label: file.name,
          url: data.publicUrl,
          provider: "OWN_HOSTING",
          isPrimary: current.length === 0,
        },
      ]);

      toast.success("Vidéo envoyée sur Cloudflare R2.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur pendant l'envoi de la vidéo.",
      );
    } finally {
      setUploadingVideo(false);
    }
  }

  function addExternalVideo() {
    const url = externalVideoUrl.trim();

    if (!url) {
      toast.error("Saisissez une URL vidéo.");
      return;
    }

    try {
      const parsed = new URL(url);

      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error("Protocole non autorisé.");
      }
    } catch {
      toast.error("Saisissez une URL HTTP ou HTTPS valide.");
      return;
    }

    setVideoSources((current) => [
      ...current.map((source) => ({
        ...source,
        isPrimary: false,
      })),
      {
        label: externalVideoLabel.trim() || "Source externe",
        url,
        provider: "EXTERNAL",
        isPrimary: current.length === 0,
      },
    ]);

    setExternalVideoUrl("");
    setExternalVideoLabel("Source externe");
    toast.success("Source externe ajoutée.");
  }

  function setPrimaryVideo(index: number) {
    setVideoSources((current) =>
      current.map((source, sourceIndex) => ({
        ...source,
        isPrimary: sourceIndex === index,
      })),
    );
  }

  function removeVideoSource(index: number) {
    setVideoSources((current) => {
      const removedPrimary = current[index]?.isPrimary;

      const next = current
        .filter((_, sourceIndex) => sourceIndex !== index)
        .map((source) => ({ ...source, isPrimary: false }));

      if (next.length > 0) {
        const previousPrimaryIndex = current.findIndex(
          (source) => source.isPrimary,
        );

        const nextPrimaryIndex = removedPrimary
          ? 0
          : Math.max(
              0,
              previousPrimaryIndex > index
                ? previousPrimaryIndex - 1
                : previousPrimaryIndex,
            );

        next[nextPrimaryIndex].isPrimary = true;
      }

      return next;
    });
  }

  async function handleSave(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (uploadingVideo || uploadingImage !== null) {
      toast.error("Attendez la fin de tous les envois.");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData(event.currentTarget);

      formData.set("posterUrl", posterUrl.trim());
      formData.set("backdropUrl", backdropUrl.trim());
      formData.set("videoSources", JSON.stringify(videoSources));

      const result = await saveMovie(formData);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setModalOpen(false);
      setEditing(null);
      setPosterUrl("");
      setBackdropUrl("");
      setVideoSources([]);
      setExternalVideoUrl("");
      setExternalVideoLabel("Source externe");

      await refresh();
    } catch {
      toast.error("Erreur pendant l'enregistrement du contenu.");
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(
    movie: MovieRow,
    status: MovieRow["status"],
  ) {
    const result = await updateMovieStatus(movie.id, status);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    await refresh();
  }

  async function changeFeatured(movie: MovieRow) {
    const result = await toggleMovieFeatured(
      movie.id,
      !movie.featured,
    );

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    await refresh();
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Catalogue</h2>
          <p className="mt-1 text-sm text-base-content/60">
            {movies.length} résultat(s) affiché(s), maximum 100 par recherche.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={openCreate}
        >
          <span className="text-lg">＋</span>
          Ajouter un contenu
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-base-300 bg-base-100 p-4 md:grid-cols-[minmax(0,1fr)_180px_180px]">
        <label className="form-control">
          <span className={labelClass}>Rechercher</span>
          <input
            className={inputClass}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Titre, slug ou synopsis..."
          />
        </label>

        <label className="form-control">
          <span className={labelClass}>Type</span>
          <select
            className={selectClass}
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            <option value="ALL">Tous les types</option>
            <option value="MOVIE">Films</option>
            <option value="SERIES">Séries</option>
          </select>
        </label>

        <label className="form-control">
          <span className={labelClass}>Statut</span>
          <select
            className={selectClass}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="ALL">Tous les statuts</option>
            <option value="PUBLISHED">Publiés</option>
            <option value="DRAFT">Brouillons</option>
            <option value="ARCHIVED">Archivés</option>
          </select>
        </label>
      </div>

      <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100">
        {loading && (
          <div className="flex items-center gap-2 border-b border-base-300 px-4 py-3 text-sm text-base-content/60">
            <span className="loading loading-spinner loading-sm" />
            Actualisation du catalogue...
          </div>
        )}

        {movies.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="text-4xl">🎬</div>
            <h3 className="mt-3 text-lg font-semibold">
              Aucun contenu trouvé
            </h3>
            <p className="mt-1 text-sm text-base-content/60">
              Ajoutez un film ou modifiez vos critères de recherche.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm mt-4"
              onClick={openCreate}
            >
              Ajouter un contenu
            </button>
          </div>
        ) : (
          <div className="divide-y divide-base-300">
            {movies.map((movie) => (
              <article
                key={movie.id}
                className="flex flex-col gap-4 p-4 transition-colors hover:bg-base-200/40 sm:flex-row sm:items-start"
              >
                <div className="h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-base-200">
                  {movie.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={movie.posterUrl}
                      alt={`Affiche de ${movie.title}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl">
                      🎞️
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{movie.title}</h3>
                    <span className={`badge badge-sm ${statusStyles[movie.status]}`}>
                      {statusLabels[movie.status]}
                    </span>
                    <span className="badge badge-outline badge-sm">
                      {movie.type === "MOVIE" ? "Film" : "Série"}
                    </span>
                    {movie.featured && (
                      <span className="badge badge-primary badge-sm">
                        Mis en avant
                      </span>
                    )}
                  </div>

                  <p className="mt-1 truncate text-sm text-base-content/60">
                    /films/{movie.slug}
                  </p>

                  <p className="mt-2 line-clamp-2 text-sm text-base-content/75">
                    {movie.synopsis}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-base-content/60">
                    {movie.releaseYear && <span>{movie.releaseYear}</span>}
                    {movie.duration && <span>{movie.duration} min</span>}
                    {movie.category && <span>{movie.category.name}</span>}
                    <span>{movie._count.reviews} avis</span>
                    <span>{movie.videoSources?.length ?? 0} source(s) vidéo</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={() => openEdit(movie)}
                    >
                      Modifier
                    </button>

                    <button
                      type="button"
                      className={`btn btn-sm ${movie.featured ? "btn-primary" : "btn-outline"}`}
                      onClick={() => void changeFeatured(movie)}
                    >
                      {movie.featured ? "Retirer de la sélection" : "Mettre en avant"}
                    </button>

                    {movie.status !== "PUBLISHED" && (
                      <button
                        type="button"
                        className="btn btn-sm btn-success btn-outline"
                        onClick={() => void changeStatus(movie, "PUBLISHED")}
                      >
                        Publier
                      </button>
                    )}

                    {movie.status !== "DRAFT" && (
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        onClick={() => void changeStatus(movie, "DRAFT")}
                      >
                        Brouillon
                      </button>
                    )}

                    {movie.status !== "ARCHIVED" && (
                      <button
                        type="button"
                        className="btn btn-sm btn-warning btn-outline"
                        onClick={() => void changeStatus(movie, "ARCHIVED")}
                      >
                        Archiver
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-3 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busy) closeModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="movie-form-title"
            className="my-4 w-full max-w-3xl rounded-2xl border border-base-300 bg-base-100 shadow-2xl sm:my-8"
          >
            <div className="flex items-center justify-between border-b border-base-300 p-5">
              <div>
                <h2 id="movie-form-title" className="text-xl font-bold">
                  {editing ? "Modifier le contenu" : "Ajouter un contenu"}
                </h2>
                <p className="mt-1 text-sm text-base-content/60">
                  Les champs marqués d’un * sont obligatoires.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-circle btn-ghost btn-sm"
                aria-label="Fermer"
                disabled={busy}
                onClick={closeModal}
              >
                ✕
              </button>
            </div>

            <form
              key={editing?.id ?? "new"}
              onSubmit={handleSave}
              className="space-y-5 p-5"
            >
              <input type="hidden" name="id" value={editing?.id ?? ""} />
              <input type="hidden" name="videoSources" value={JSON.stringify(videoSources)} />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="form-control sm:col-span-2">
                  <span className={labelClass}>Titre *</span>
                  <input
                    name="title"
                    className={inputClass}
                    required
                    maxLength={200}
                    defaultValue={editing?.title ?? ""}
                    placeholder="Ex. Le Dernier Royaume"
                    onChange={(event) => {
                      const slugField = event.currentTarget.form?.elements.namedItem(
                        "slug",
                      ) as HTMLInputElement | null;

                      if (slugField && !editing) {
                        slugField.value = slugify(event.currentTarget.value);
                      }
                    }}
                  />
                </label>

                <label className="form-control">
                  <span className={labelClass}>Slug URL *</span>
                  <input
                    name="slug"
                    className={inputClass}
                    required
                    defaultValue={editing?.slug ?? ""}
                    placeholder="le-dernier-royaume"
                  />
                  <span className="mt-1 text-xs text-base-content/55">
                    Utilisé dans l’adresse du contenu.
                  </span>
                </label>

                <label className="form-control">
                  <span className={labelClass}>Type *</span>
                  <select name="type" className={selectClass} defaultValue={editing?.type ?? "MOVIE"}>
                    <option value="MOVIE">Film</option>
                    <option value="SERIES">Série</option>
                  </select>
                </label>

                <label className="form-control">
                  <span className={labelClass}>Statut *</span>
                  <select name="status" className={selectClass} defaultValue={editing?.status ?? "DRAFT"}>
                    <option value="DRAFT">Brouillon</option>
                    <option value="PUBLISHED">Publié</option>
                    <option value="ARCHIVED">Archivé</option>
                  </select>
                </label>

                <label className="form-control">
                  <span className={labelClass}>Catégorie</span>
                  <select name="categoryId" className={selectClass} defaultValue={editing?.categoryId ?? ""}>
                    <option value="">Sans catégorie</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-control">
                  <span className={labelClass}>Année de sortie</span>
                  <input name="releaseYear" type="number" min={1888} max={2200} className={inputClass} defaultValue={editing?.releaseYear ?? ""} placeholder="2026" />
                </label>

                <label className="form-control">
                  <span className={labelClass}>Durée en minutes</span>
                  <input name="duration" type="number" min={1} className={inputClass} defaultValue={editing?.duration ?? ""} placeholder="120" />
                </label>

                <label className="form-control sm:col-span-2">
                  <span className={labelClass}>Synopsis *</span>
                  <textarea
                    name="synopsis"
                    className="textarea textarea-bordered min-h-32 w-full bg-base-100"
                    required
                    maxLength={10000}
                    defaultValue={editing?.synopsis ?? ""}
                    placeholder="Présentez l’histoire du film ou de la série..."
                  />
                </label>

                {/* Affiche Cloudinary */}
                <div className="space-y-3 rounded-2xl border border-base-300 p-4 sm:col-span-2">
                  <div>
                    <h3 className="font-semibold">Affiche du contenu</h3>
                    <p className="mt-1 text-sm text-base-content/60">
                      JPG, PNG ou WebP — 8 Mo maximum.
                    </p>
                  </div>

                  {posterUrl && (
                    <div className="flex items-start gap-4">
                      <div className="h-40 w-28 shrink-0 overflow-hidden rounded-lg bg-base-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={posterUrl} alt="Aperçu de l’affiche" className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="break-all text-xs text-base-content/60">{posterUrl}</p>
                        <button type="button" className="btn btn-ghost btn-xs mt-2" disabled={busy} onClick={() => setPosterUrl("")}>
                          Retirer l’affiche
                        </button>
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="file-input file-input-bordered w-full"
                    disabled={busy}
                    onChange={(event) => void handleImageUpload("poster", event)}
                  />

                  {uploadingImage === "poster" && (
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <span className="loading loading-spinner loading-sm" />
                      Envoi de l’affiche vers Cloudinary...
                    </div>
                  )}

                  <label className="form-control">
                    <span className={labelClass}>Ou saisir une URL existante</span>
                    <input
                      name="posterUrl"
                      type="url"
                      className={inputClass}
                      value={posterUrl}
                      onChange={(event) => setPosterUrl(event.target.value)}
                      placeholder="https://..."
                      disabled={busy}
                    />
                  </label>
                </div>

                {/* Image de fond Cloudinary */}
                <div className="space-y-3 rounded-2xl border border-base-300 p-4 sm:col-span-2">
                  <div>
                    <h3 className="font-semibold">Image de fond</h3>
                    <p className="mt-1 text-sm text-base-content/60">
                      Choisissez une image large pour la bannière du contenu.
                    </p>
                  </div>

                  {backdropUrl && (
                    <div className="space-y-2">
                      <div className="aspect-video max-h-64 overflow-hidden rounded-lg bg-base-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={backdropUrl} alt="Aperçu de l’image de fond" className="h-full w-full object-cover" />
                      </div>
                      <p className="break-all text-xs text-base-content/60">{backdropUrl}</p>
                      <button type="button" className="btn btn-ghost btn-xs" disabled={busy} onClick={() => setBackdropUrl("")}>
                        Retirer l’image de fond
                      </button>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="file-input file-input-bordered w-full"
                    disabled={busy}
                    onChange={(event) => void handleImageUpload("backdrop", event)}
                  />

                  {uploadingImage === "backdrop" && (
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <span className="loading loading-spinner loading-sm" />
                      Envoi de l’image de fond vers Cloudinary...
                    </div>
                  )}

                  <label className="form-control">
                    <span className={labelClass}>Ou saisir une URL existante</span>
                    <input
                      name="backdropUrl"
                      type="url"
                      className={inputClass}
                      value={backdropUrl}
                      onChange={(event) => setBackdropUrl(event.target.value)}
                      placeholder="https://..."
                      disabled={busy}
                    />
                  </label>
                </div>

                {/* Sources vidéo */}
                <div className="space-y-4 rounded-2xl border border-base-300 p-4 sm:col-span-2">
                  <div>
                    <h3 className="font-semibold">Sources vidéo</h3>
                    <p className="mt-1 text-sm text-base-content/60">
                      Envoyez un MP4 vers Cloudflare R2 ou ajoutez une URL externe.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className={labelClass}>Téléverser un fichier MP4 (500 Mo maximum)</label>
                    <input
                      type="file"
                      accept="video/mp4,.mp4"
                      className="file-input file-input-bordered w-full"
                      disabled={busy}
                      onChange={(event) => void handleVideoUpload(event)}
                    />

                    {uploadingVideo && (
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <span className="loading loading-spinner loading-sm" />
                        Envoi de la vidéo vers Cloudflare R2...
                      </div>
                    )}
                    <p className="text-xs text-base-content/55">
                      Le fichier est envoyé directement depuis votre navigateur vers R2.
                    </p>
                  </div>

                  <div className="divider text-xs">OU URL EXTERNE</div>

                  <label className="form-control">
                    <span className={labelClass}>Nom de la source</span>
                    <input className={inputClass} value={externalVideoLabel} onChange={(event) => setExternalVideoLabel(event.target.value)} maxLength={255} placeholder="Ex. Lecteur externe" disabled={busy} />
                  </label>

                  <label className="form-control">
                    <span className={labelClass}>URL vidéo externe</span>
                    <input type="url" className={inputClass} value={externalVideoUrl} onChange={(event) => setExternalVideoUrl(event.target.value)} placeholder="https://..." disabled={busy} />
                  </label>

                  <button type="button" className="btn btn-outline btn-sm" onClick={addExternalVideo} disabled={busy}>
                    Ajouter cette URL
                  </button>

                  {videoSources.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold">Sources ajoutées ({videoSources.length})</h4>
                      {videoSources.map((source, index) => (
                        <div key={`${source.url}-${index}`} className="rounded-xl border border-base-300 p-3">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium">{source.label}</span>
                                <span className="badge badge-sm badge-outline">
                                  {source.provider === "OWN_HOSTING" ? "Cloudflare R2" : "Externe"}
                                </span>
                                {source.isPrimary && <span className="badge badge-sm badge-primary">Principale</span>}
                              </div>
                              <p className="mt-1 break-all text-xs text-base-content/60">{source.url}</p>
                            </div>

                            <div className="flex shrink-0 flex-wrap gap-2">
                              {!source.isPrimary && (
                                <button type="button" className="btn btn-xs btn-outline" onClick={() => setPrimaryVideo(index)} disabled={busy}>
                                  Principale
                                </button>
                              )}
                              <button type="button" className="btn btn-xs btn-error btn-outline" onClick={() => removeVideoSource(index)} disabled={busy}>
                                Supprimer
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-lg bg-base-200 p-3 text-sm text-base-content/60">
                      Aucune source vidéo ajoutée. Vous pourrez en ajouter plus tard.
                    </p>
                  )}
                </div>

                <label className="form-control sm:col-span-2">
                  <span className={labelClass}>Titre SEO</span>
                  <input name="seoTitle" className={inputClass} maxLength={200} defaultValue={editing?.seoTitle ?? ""} placeholder="Titre affiché dans les résultats de recherche" />
                </label>

                <label className="form-control sm:col-span-2">
                  <span className={labelClass}>Description SEO</span>
                  <textarea name="seoDescription" className="textarea textarea-bordered min-h-20 w-full bg-base-100" maxLength={320} defaultValue={editing?.seoDescription ?? ""} placeholder="Description pour les moteurs de recherche..." />
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-base-300 p-4 sm:col-span-2">
                  <input type="checkbox" name="featured" className="checkbox checkbox-primary" defaultChecked={editing?.featured ?? false} />
                  <span>
                    <span className="block font-medium">Mettre en avant</span>
                    <span className="text-sm text-base-content/60">
                      Signaler ce contenu comme sélectionné sur CineWave.
                    </span>
                  </span>
                </label>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-base-300 pt-5 sm:flex-row sm:justify-end">
                <button type="button" className="btn btn-ghost" disabled={busy} onClick={closeModal}>
                  Annuler
                </button>

                <button type="submit" className="btn btn-primary" disabled={busy}>
                  {busy && <span className="loading loading-spinner loading-sm" />}
                  {uploadingImage
                    ? "Envoi de l’image..."
                    : uploadingVideo
                      ? "Envoi de la vidéo..."
                      : saving
                        ? "Enregistrement..."
                        : editing
                          ? "Enregistrer les modifications"
                          : "Créer le contenu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
