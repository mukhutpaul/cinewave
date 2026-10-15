

"use client";

import { useMemo, useState, useTransition } from "react";

import Select, { type StylesConfig } from "react-select";

import Swal from "sweetalert2";

import {

  createArticle,

  updateArticle,

  deleteArticle,

} from "@/lib/actions/article-actions";

type Status = "DRAFT" | "PUBLISHED" | "ARCHIVED";

type ArticleItem = {

  id: string;

  title: string;

  slug: string;

  excerpt: string;

  content: string;

  coverImageUrl: string | null;

  authorName: string;

  status: Status;

  seoTitle: string | null;

  seoDescription: string | null;

  categoryId: string | null;

  categoryName: string | null;

  publishedAt: string | null;

  updatedAt: string;

};

type Category = {

  id: string;

  name: string;

};

type Option = {

  value: string;

  label: string;

};

type ArticleForm = {

  title: string;

  slug: string;

  excerpt: string;

  content: string;

  authorName: string;

  coverImageUrl: string;

  seoTitle: string;

  seoDescription: string;

  categoryId: string;

  status: Status;

};

type ArticleManagerProps = {

  articles: ArticleItem[];

  categories: Category[];

};

const STATUS_OPTIONS: Option[] = [

  { value: "DRAFT", label: "Brouillon" },

  { value: "PUBLISHED", label: "Publié" },

  { value: "ARCHIVED", label: "Archivé" },

];

const EMPTY_FORM: ArticleForm = {

  title: "",

  slug: "",

  excerpt: "",

  content: "",

  authorName: "",

  coverImageUrl: "",

  seoTitle: "",

  seoDescription: "",

  categoryId: "",

  status: "DRAFT",

};

const selectStyles: StylesConfig<Option, false> = {

  control: (base, state) => ({

    ...base,

    minHeight: 44,

    backgroundColor: "#111827",

    borderColor: state.isFocused ? "#6366f1" : "#374151",

    boxShadow: "none",

    "&:hover": { borderColor: "#6366f1" },

  }),

  menu: (base) => ({

    ...base,

    backgroundColor: "#111827",

    zIndex: 60,

  }),

  menuPortal: (base) => ({ ...base, zIndex: 100 }),

  option: (base, state) => ({

    ...base,

    cursor: "pointer",

    color: "#f9fafb",

    backgroundColor: state.isSelected

      ? "#4f46e5"

      : state.isFocused

        ? "#1f2937"

        : "#111827",

  }),

  singleValue: (base) => ({ ...base, color: "#f9fafb" }),

  input: (base) => ({ ...base, color: "#f9fafb" }),

  placeholder: (base) => ({ ...base, color: "#9ca3af" }),

  clearIndicator: (base) => ({ ...base, color: "#9ca3af" }),

  dropdownIndicator: (base) => ({ ...base, color: "#9ca3af" }),

};

const inputClass =

  "w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-indigo-500";

const labelClass = "mb-1.5 block text-sm font-medium text-gray-300";

function statusLabel(status: Status) {

  return (

    STATUS_OPTIONS.find((option) => option.value === status)?.label ??

    status

  );

}

function formatDate(date: string) {

  return new Intl.DateTimeFormat("fr-FR", {

    dateStyle: "medium",

    timeStyle: "short",

  }).format(new Date(date));

}

export default function ArticleManager({

  articles: initialArticles,

  categories,

}: ArticleManagerProps) {

  const [articles, setArticles] = useState(initialArticles);

  const [search, setSearch] = useState("");

  const [filterStatus, setFilterStatus] = useState<Option | null>(null);

  const [editing, setEditing] = useState<ArticleItem | null>(null);

  const [form, setForm] = useState<ArticleForm>({ ...EMPTY_FORM });

  const [modalOpen, setModalOpen] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState("");

  const categoryOptions = useMemo<Option[]>(

    () =>

      categories.map((category) => ({

        value: category.id,

        label: category.name,

      })),

    [categories],

  );

  const filteredArticles = useMemo(() => {

    const query = search.trim().toLowerCase();

    return articles.filter((article) => {

      const matchesSearch =

        !query ||

        article.title.toLowerCase().includes(query) ||

        article.slug.toLowerCase().includes(query) ||

        article.authorName.toLowerCase().includes(query);

      const matchesStatus =

        !filterStatus || article.status === filterStatus.value;

      return matchesSearch && matchesStatus;

    });

  }, [articles, search, filterStatus]);

  const counts = useMemo(

    () => ({

      total: articles.length,

      published: articles.filter((a) => a.status === "PUBLISHED").length,

      drafts: articles.filter((a) => a.status === "DRAFT").length,

      archived: articles.filter((a) => a.status === "ARCHIVED").length,

    }),

    [articles],

  );

  function openCreate() {

    setEditing(null);

    setForm({ ...EMPTY_FORM });

    setModalOpen(true);

  }

  function openEdit(article: ArticleItem) {

    setEditing(article);

    setForm({

      title: article.title,

      slug: article.slug,

      excerpt: article.excerpt,

      content: article.content,

      authorName: article.authorName,

      coverImageUrl: article.coverImageUrl ?? "",

      seoTitle: article.seoTitle ?? "",

      seoDescription: article.seoDescription ?? "",

      categoryId: article.categoryId ?? "",

      status: article.status,

    });

    setModalOpen(true);

  }

  function change<K extends keyof ArticleForm>(

    key: K,

    value: ArticleForm[K],

  ) {

    setForm((current) => ({ ...current, [key]: value }));

  }

  async function uploadCoverImage(file: File) {
    setCoverUploadError("");

    if (!file.type.startsWith("image/")) {
      setCoverUploadError("Veuillez sélectionner un fichier image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setCoverUploadError("L’image ne doit pas dépasser 5 Mo.");
      return;
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      setCoverUploadError(
        "Configuration Cloudinary manquante. Vérifiez les variables d’environnement dans Vercel."
      );
      return;
    }

    setIsUploadingCover(true);

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("upload_preset", uploadPreset);
      body.append("folder", "histyra/articles");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
        { method: "POST", body }
      );

      const result = (await response.json()) as {
        secure_url?: string;
        error?: { message?: string };
      };

      if (!response.ok || !result.secure_url) {
        throw new Error(
          result.error?.message || "Le téléversement vers Cloudinary a échoué."
        );
      }

      change("coverImageUrl", result.secure_url);
    } catch (error) {
      setCoverUploadError(
        error instanceof Error
          ? error.message
          : "Impossible de téléverser l’image. Réessayez."
      );
    } finally {
      setIsUploadingCover(false);
    }
  }

  function toFormData() {

    const data = new FormData();

    for (const [key, value] of Object.entries(form)) {

      data.set(key, value);

    }

    return data;

  }

  function saveArticle(event: React.FormEvent<HTMLFormElement>) {

    event.preventDefault();

    startTransition(async () => {

      try {

        const data = toFormData();

        if (editing) {

          await updateArticle(editing.id, data);

        } else {

          await createArticle(data);

        }

        await Swal.fire({

          icon: "success",

          title: "Opération réussie",

          text: editing

            ? "L'article a été modifié."

            : "L'article a été créé.",

          timer: 1800,

          showConfirmButton: false,

        });

        window.location.reload();

      } catch (error) {

        await Swal.fire({

          icon: "error",

          title: "Erreur",

          text:

            error instanceof Error

              ? error.message

              : "Une erreur est survenue.",

        });

      }

    });

  }

  async function confirmDelete(article: ArticleItem) {

    const result = await Swal.fire({

      title: "Supprimer cet article ?",

      text: `« ${article.title} » sera supprimé définitivement.`,

      icon: "warning",

      showCancelButton: true,

      confirmButtonText: "Oui, supprimer",

      cancelButtonText: "Annuler",

      confirmButtonColor: "#dc2626",

      cancelButtonColor: "#4b5563",

      reverseButtons: true,

    });

    if (!result.isConfirmed) return;

    startTransition(async () => {

      try {

        await deleteArticle(article.id);

        setArticles((current) =>

          current.filter((item) => item.id !== article.id),

        );

        await Swal.fire({

          icon: "success",

          title: "Article supprimé",

          timer: 1600,

          showConfirmButton: false,

        });

      } catch (error) {

        await Swal.fire({

          icon: "error",

          title: "Suppression impossible",

          text:

            error instanceof Error

              ? error.message

              : "Une erreur est survenue.",

        });

      }

    });

  }

  return (

    <div className="space-y-6 text-gray-100">

      {/* Statistiques */}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

        {[

          { label: "Total des articles", value: counts.total },

          { label: "Publiés", value: counts.published },

          { label: "Brouillons", value: counts.drafts },

          { label: "Archivés", value: counts.archived },

        ].map((stat) => (

          <div

            key={stat.label}

            className="rounded-xl border border-gray-800 bg-gray-900/70 p-4"

          >

            <p className="text-sm text-gray-400">{stat.label}</p>

            <p className="mt-2 text-2xl font-bold">{stat.value}</p>

          </div>

        ))}

      </div>

      {/* En-tête et création */}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

        <div>

          <h2 className="text-xl font-semibold">Gestion des actualités</h2>

          <p className="mt-1 text-sm text-gray-400">

            Créez, modifiez et organisez vos articles Histyra.

          </p>

        </div>

        <button

          type="button"

          onClick={openCreate}

          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"

        >

          + Nouvel article

        </button>

      </div>

      {/* Recherche et filtre */}

      <div className="grid gap-3 md:grid-cols-[1fr_240px]">

        <input

          className={inputClass}

          placeholder="Rechercher par titre, slug ou auteur..."

          value={search}

          onChange={(event) => setSearch(event.target.value)}

        />

        <Select<Option, false>

          instanceId="article-status-filter"

          options={STATUS_OPTIONS}

          value={filterStatus}

          onChange={setFilterStatus}

          isClearable

          placeholder="Tous les statuts"

          styles={selectStyles}

          menuPortalTarget={

            typeof document !== "undefined" ? document.body : undefined

          }

        />

      </div>

      {/* Tableau des articles */}

      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[850px] text-left text-sm">

            <thead className="border-b border-gray-800 bg-gray-900 text-gray-400">

              <tr>

                <th className="px-4 py-3">Article</th>

                <th className="px-4 py-3">Catégorie</th>

                <th className="px-4 py-3">Auteur</th>

                <th className="px-4 py-3">Statut</th>

                <th className="px-4 py-3">Modification</th>

                <th className="px-4 py-3 text-right">Actions</th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-800">

              {filteredArticles.map((article) => (

                <tr key={article.id} className="hover:bg-gray-800/40">

                  <td className="max-w-xs px-4 py-4">

                    <p className="truncate font-medium text-white">

                      {article.title}

                    </p>

                    <p className="mt-1 truncate text-xs text-gray-500">

                      /{article.slug}

                    </p>

                  </td>

                  <td className="px-4 py-4 text-gray-300">

                    {article.categoryName ?? "Sans catégorie"}

                  </td>

                  <td className="px-4 py-4 text-gray-300">

                    {article.authorName}

                  </td>

                  <td className="px-4 py-4">

                    <span

                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${

                        article.status === "PUBLISHED"

                          ? "bg-emerald-500/10 text-emerald-400"

                          : article.status === "DRAFT"

                            ? "bg-amber-500/10 text-amber-400"

                            : "bg-gray-700 text-gray-300"

                      }`}

                    >

                      {statusLabel(article.status)}

                    </span>

                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-gray-400">

                    {formatDate(article.updatedAt)}

                  </td>

                  <td className="px-4 py-4">

                    <div className="flex justify-end gap-2">

                      <button

                        type="button"

                        onClick={() => openEdit(article)}

                        disabled={isPending}

                        className="rounded-md border border-gray-700 px-3 py-1.5 text-xs hover:bg-gray-800 disabled:opacity-50"

                      >

                        Modifier

                      </button>

                      <button

                        type="button"

                        onClick={() => confirmDelete(article)}

                        disabled={isPending}

                        className="rounded-md border border-red-900/70 px-3 py-1.5 text-xs text-red-400 hover:bg-red-950 disabled:opacity-50"

                      >

                        Supprimer

                      </button>

                    </div>

                  </td>

                </tr>

              ))}

              {filteredArticles.length === 0 && (

                <tr>

                  <td

                    colSpan={6}

                    className="px-4 py-12 text-center text-gray-500"

                  >

                    {articles.length === 0

                      ? "Aucun article enregistré. Cliquez sur « Nouvel article » pour commencer."

                      : "Aucun article ne correspond à votre recherche."}

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

        <div className="border-t border-gray-800 px-4 py-3 text-xs text-gray-500">

          {filteredArticles.length} article(s) affiché(s)

        </div>

      </div>

      {/* Formulaire de création et de modification */}

      {modalOpen && (

        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/75 p-3 py-8 backdrop-blur-sm sm:p-6">

          <div className="my-auto w-full max-w-4xl rounded-2xl border border-gray-700 bg-gray-950 shadow-2xl">

            <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4 sm:px-7">

              <div>

                <h3 className="text-lg font-semibold">

                  {editing ? "Modifier l'article" : "Créer un article"}

                </h3>

                <p className="mt-1 text-sm text-gray-400">

                  Rédaction, publication et référencement.

                </p>

              </div>

              <button

                type="button"

                onClick={() => setModalOpen(false)}

                disabled={isPending}

                className="rounded-lg px-3 py-2 text-gray-400 hover:bg-gray-800 hover:text-white"

                aria-label="Fermer"

              >

                ✕

              </button>

            </div>

            <form onSubmit={saveArticle} className="space-y-5 p-5 sm:p-7">

              <div className="grid gap-4 md:grid-cols-2">

                <div>

                  <label className={labelClass}>Titre *</label>

                  <input

                    required

                    maxLength={180}

                    className={inputClass}

                    value={form.title}

                    onChange={(e) => change("title", e.target.value)}

                    placeholder="Ex. Les nouveautés du cinéma..."

                  />

                </div>

                <div>

                  <label className={labelClass}>Slug URL</label>

                  <input

                    className={inputClass}

                    value={form.slug}

                    onChange={(e) => change("slug", e.target.value)}

                    placeholder="Laisser vide pour utiliser le titre"

                  />

                  <p className="mt-1 text-xs text-gray-500">

                    Les espaces et accents seront normalisés à

                    l'enregistrement.

                  </p>

                </div>

              </div>

              <div>

                <label className={labelClass}>Résumé *</label>

                <textarea

                  required

                  rows={3}

                  className={inputClass}

                  value={form.excerpt}

                  onChange={(e) => change("excerpt", e.target.value)}

                  placeholder="Résumé présenté dans les listes d'articles..."

                />

              </div>

              <div>

                <label className={labelClass}>Contenu de l'article *</label>

                <textarea

                  required

                  rows={10}

                  className={inputClass}

                  value={form.content}

                  onChange={(e) => change("content", e.target.value)}

                  placeholder="Rédigez le contenu de votre actualité..."

                />

                <p className="mt-1 text-xs text-gray-500">

                  Saisie en texte brut. Un éditeur riche peut être intégré

                  ultérieurement.

                </p>

              </div>

              <div className="grid gap-4 md:grid-cols-2">

                <div>

                  <label className={labelClass}>Auteur *</label>

                  <input

                    required

                    maxLength={120}

                    className={inputClass}

                    value={form.authorName}

                    onChange={(e) => change("authorName", e.target.value)}

                    placeholder="Nom de l'auteur"

                  />

                </div>

                <div className="space-y-3">
                  <label className={labelClass}>Image de couverture</label>

                  <div className="rounded-lg border border-gray-700 bg-gray-900 p-3">
                    <label className={labelClass}>Téléverser depuis votre ordinateur</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                      disabled={isUploadingCover || isPending}
                      onChange={(event) => {
                        const file = event.currentTarget.files?.[0];
                        event.currentTarget.value = "";
                        if (file) void uploadCoverImage(file);
                      }}
                      className="block w-full text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-indigo-500 disabled:opacity-50"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Images JPG, PNG, WebP, GIF ou AVIF — 5 Mo maximum.
                    </p>
                    {isUploadingCover && (
                      <p role="status" className="mt-2 text-sm text-indigo-300">
                        Téléversement vers Cloudinary en cours…
                      </p>
                    )}
                    {coverUploadError && (
                      <p role="alert" className="mt-2 text-sm text-red-400">
                        {coverUploadError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>Ou coller l’URL de l’image</label>
                    <input
                      type="url"
                      className={inputClass}
                      value={form.coverImageUrl}
                      onChange={(e) => {
                        setCoverUploadError("");
                        change("coverImageUrl", e.target.value);
                      }}
                      placeholder="https://res.cloudinary.com/..."
                    />
                  </div>
                </div>

              </div>

              {form.coverImageUrl && (

                <div className="overflow-hidden rounded-lg border border-gray-800">

                  <p className="px-3 py-2 text-xs text-gray-400">

                    Aperçu de la couverture

                  </p>

                  {/* eslint-disable-next-line @next/next/no-img-element */}

                  <img

                    src={form.coverImageUrl}

                    alt="Aperçu de la couverture"

                    className="max-h-64 w-full object-cover"

                    onError={(event) => {

                      event.currentTarget.style.display = "none";

                    }}

                  />

                </div>

              )}

              <div className="grid gap-4 md:grid-cols-2">

                <div>

                  <label className={labelClass}>Catégorie</label>

                  <Select<Option, false>

                    instanceId="article-category"

                    options={categoryOptions}

                    value={

                      categoryOptions.find(

                        (option) => option.value === form.categoryId,

                      ) ?? null

                    }

                    onChange={(option) =>

                      change("categoryId", option?.value ?? "")

                    }

                    isClearable

                    placeholder="Choisir une catégorie..."

                    styles={selectStyles}

                    menuPortalTarget={

                      typeof document !== "undefined"

                        ? document.body

                        : undefined

                    }

                  />

                </div>

                <div>

                  <label className={labelClass}>Statut</label>

                  <Select<Option, false>

                    instanceId="article-status"

                    options={STATUS_OPTIONS}

                    value={

                      STATUS_OPTIONS.find(

                        (option) => option.value === form.status,

                      ) ?? null

                    }

                    onChange={(option) => {

                      if (option) {

                        change("status", option.value as Status);

                      }

                    }}

                    isClearable={false}

                    styles={selectStyles}

                    menuPortalTarget={

                      typeof document !== "undefined"

                        ? document.body

                        : undefined

                    }

                  />

                </div>

              </div>

              <section className="space-y-4 rounded-xl border border-gray-800 p-4 sm:p-5">

                <div>

                  <h4 className="font-semibold">Référencement SEO</h4>

                  <p className="mt-1 text-sm text-gray-400">

                    Ces champs sont facultatifs.

                  </p>

                </div>

                <div>

                  <label className={labelClass}>Titre SEO</label>

                  <input

                    maxLength={180}

                    className={inputClass}

                    value={form.seoTitle}

                    onChange={(e) => change("seoTitle", e.target.value)}

                    placeholder="Titre affiché dans les moteurs de recherche"

                  />

                  <p className="mt-1 text-right text-xs text-gray-500">

                    {form.seoTitle.length}/180

                  </p>

                </div>

                <div>

                  <label className={labelClass}>Description SEO</label>

                  <textarea

                    rows={3}

                    maxLength={320}

                    className={inputClass}

                    value={form.seoDescription}

                    onChange={(e) =>

                      change("seoDescription", e.target.value)

                    }

                    placeholder="Description pour les moteurs de recherche"

                  />

                  <p className="mt-1 text-right text-xs text-gray-500">

                    {form.seoDescription.length}/320

                  </p>

                </div>

              </section>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-800 pt-5 sm:flex-row sm:justify-end">

                <button

                  type="button"

                  onClick={() => setModalOpen(false)}

                  disabled={isPending}

                  className="rounded-lg border border-gray-700 px-5 py-2.5 text-sm hover:bg-gray-800 disabled:opacity-50"

                >

                  Annuler

                </button>

                <button

                  type="submit"

                  disabled={isPending}

                  className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"

                >

                  {isPending

                    ? "Enregistrement..."

                    : editing

                      ? "Enregistrer les modifications"

                      : "Créer l'article"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

}
