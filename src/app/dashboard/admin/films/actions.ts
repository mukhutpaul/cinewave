
"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type {
  ContentStatus,
  ContentType,
  VideoProvider,
} from "@/generated/prisma/client";

type ActionResult = {
  ok: boolean;
  message: string;
};

type VideoSourceInput = {
  label: string;
  url: string;
  provider: VideoProvider;
  isPrimary: boolean;
};

async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (
    !session?.user ||
    session.user.role !== "ADMIN" ||
    session.user.banned
  ) {
    throw new Error("Accès réservé aux administrateurs.");
  }

  return session.user;
}

function makeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function optionalNumber(value: FormDataEntryValue | null) {
  if (value === null || value.toString().trim() === "") {
    return null;
  }

  const number = Number(value);

  if (!Number.isInteger(number) || number < 0) {
    throw new Error(
      "L’année et la durée doivent être des nombres entiers positifs.",
    );
  }

  return number;
}

function optionalText(value: FormDataEntryValue | null) {
  const text = value?.toString().trim();
  return text || null;
}

/**
 * Convertit uniquement les URL de l'ancien endpoint API R2
 * en URL publique. Les URL externes restent inchangées.
 *
 * .env :
 * CLOUDFLARE_R2_PUBLIC_URL="https://pub-0feb5c32872842748601348f5adf40a0.r2.dev"
 */
function normalizeVideoUrl(url: string): string {
  const publicBaseUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL?.trim();

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error("L’URL vidéo est invalide.");
  }

  const oldR2ApiHost =
    "e2e2e110612b2afd851917ebbb7f3880.r2.cloudflarestorage.com";

  // Ne pas transformer les sources externes.
  if (parsedUrl.hostname.toLowerCase() !== oldR2ApiHost) {
    return url;
  }

  if (parsedUrl.protocol !== "https:") {
    throw new Error("L’URL de l’API Cloudflare R2 doit utiliser HTTPS.");
  }

  if (!publicBaseUrl) {
    throw new Error(
      "Configurez CLOUDFLARE_R2_PUBLIC_URL dans le fichier .env.",
    );
  }

  let parsedPublicUrl: URL;

  try {
    parsedPublicUrl = new URL(publicBaseUrl);
  } catch {
    throw new Error("L’URL publique Cloudflare R2 est invalide.");
  }

  if (
    parsedPublicUrl.protocol !== "https:" ||
    parsedPublicUrl.username ||
    parsedPublicUrl.password ||
    parsedPublicUrl.search ||
    parsedPublicUrl.hash
  ) {
    throw new Error(
      "L’URL publique Cloudflare R2 doit être une URL HTTPS valide.",
    );
  }

  const objectKey = parsedUrl.pathname.replace(/^\/+/, "");

  if (!objectKey) {
    throw new Error("Le chemin de la vidéo Cloudflare R2 est invalide.");
  }

  // Préserve le chemin de l'objet et ses éventuels sous-dossiers.
  const encodedKey = objectKey
    .split("/")
    .map((part) => {
      try {
        return encodeURIComponent(decodeURIComponent(part));
      } catch {
        throw new Error("Le chemin de la vidéo Cloudflare R2 est invalide.");
      }
    })
    .join("/");

  return `${publicBaseUrl.replace(/\/+$/, "")}/${encodedKey}`;
}

/**
 * Si videoSources n'est pas envoyé, les sources existantes sont conservées.
 * Si le champ contient [], toutes les sources sont supprimées.
 */
function parseVideoSources(
  value: FormDataEntryValue | null,
): VideoSourceInput[] | null {
  if (value === null) return null;

  if (typeof value !== "string") {
    throw new Error("Liste de sources vidéo invalide.");
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("Le format des sources vidéo est invalide.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Les sources vidéo doivent être une liste.");
  }

  if (parsed.length > 20) {
    throw new Error("Vous ne pouvez pas ajouter plus de 20 sources.");
  }

  const sources: VideoSourceInput[] = parsed.map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`La source vidéo ${index + 1} est invalide.`);
    }

    const source = item as Record<string, unknown>;
    const rawUrl =
      typeof source.url === "string" ? source.url.trim() : "";
    const label =
      typeof source.label === "string" ? source.label.trim() : "";

    if (!rawUrl) {
      throw new Error(`L’URL de la source ${index + 1} est obligatoire.`);
    }

    if (rawUrl.length > 4096) {
      throw new Error(`L’URL de la source ${index + 1} est trop longue.`);
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(rawUrl);
    } catch {
      throw new Error(`L’URL de la source ${index + 1} est invalide.`);
    }

    if (
      !["https:", "http:"].includes(parsedUrl.protocol) ||
      parsedUrl.username ||
      parsedUrl.password
    ) {
      throw new Error(
        `L’URL de la source ${index + 1} doit être une adresse HTTP ou HTTPS valide.`,
      );
    }

    if (
      source.provider !== "OWN_HOSTING" &&
      source.provider !== "EXTERNAL"
    ) {
      throw new Error(`Le type de la source ${index + 1} est invalide.`);
    }

    if (
      source.isPrimary !== undefined &&
      typeof source.isPrimary !== "boolean"
    ) {
      throw new Error(
        `Le choix de la source principale ${index + 1} est invalide.`,
      );
    }

    // Conversion automatique des URL API R2 vers l'URL publique.
    const url = normalizeVideoUrl(rawUrl);

    return {
      label: label || `Source ${index + 1}`,
      url,
      provider: source.provider,
      isPrimary: source.isPrimary === true,
    };
  });

  if (sources.filter((source) => source.isPrimary).length > 1) {
    throw new Error("Une seule source vidéo peut être principale.");
  }

  if (sources.length > 0 && !sources.some((source) => source.isPrimary)) {
    sources[0].isPrimary = true;
  }

  return sources;
}

function refreshPages() {
  revalidatePath("/dashboard/admin/films");
  revalidatePath("/films");
  revalidatePath("/series");
}

export async function searchMovies(
  q = "",
  type = "ALL",
  status = "ALL",
) {
  await requireAdmin();

  const query = q.trim();

  return prisma.movie.findMany({
    where: {
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { slug: { contains: query, mode: "insensitive" } },
              { synopsis: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(type === "MOVIE" || type === "SERIES"
        ? { type: type as ContentType }
        : {}),
      ...(status === "DRAFT" ||
      status === "PUBLISHED" ||
      status === "ARCHIVED"
        ? { status: status as ContentStatus }
        : {}),
    },
    include: {
      category: { select: { name: true } },
      videoSources: {
        orderBy: { sortOrder: "asc" },
      },
      _count: { select: { reviews: true } },
    },
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    take: 100,
  });
}

export async function saveMovie(
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const id = optionalText(formData.get("id"));
    const title = formData.get("title")?.toString().trim() ?? "";
    const synopsis = formData.get("synopsis")?.toString().trim() ?? "";
    const slugInput = formData.get("slug")?.toString().trim() ?? "";
    const slug = makeSlug(slugInput || title);

    const typeValue = formData.get("type")?.toString() ?? "MOVIE";
    const statusValue = formData.get("status")?.toString() ?? "DRAFT";

    if (!title || !synopsis || !slug) {
      return {
        ok: false,
        message: "Le titre, le slug et le synopsis sont obligatoires.",
      };
    }

    if (typeValue !== "MOVIE" && typeValue !== "SERIES") {
      return { ok: false, message: "Type de contenu invalide." };
    }

    if (
      statusValue !== "DRAFT" &&
      statusValue !== "PUBLISHED" &&
      statusValue !== "ARCHIVED"
    ) {
      return { ok: false, message: "Statut invalide." };
    }

    const releaseYear = optionalNumber(formData.get("releaseYear"));
    const duration = optionalNumber(formData.get("duration"));
    const categoryId = optionalText(formData.get("categoryId"));
    const videoSources = parseVideoSources(formData.get("videoSources"));

    if (releaseYear !== null && (releaseYear < 1888 || releaseYear > 2200)) {
      return { ok: false, message: "L’année de sortie n’est pas valide." };
    }

    if (duration !== null && duration < 1) {
      return { ok: false, message: "La durée doit être supérieure à zéro." };
    }

    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { id: true },
      });

      if (!category) {
        return {
          ok: false,
          message: "La catégorie sélectionnée est introuvable.",
        };
      }
    }

    const existing = id
      ? await prisma.movie.findUnique({
          where: { id },
          select: { id: true, publishedAt: true },
        })
      : null;

    if (id && !existing) {
      return { ok: false, message: "Ce contenu n’existe plus." };
    }

    const publishedAt =
      statusValue === "PUBLISHED"
        ? existing?.publishedAt ?? new Date()
        : statusValue === "ARCHIVED"
          ? existing?.publishedAt ?? null
          : null;

    const data = {
      title,
      slug,
      synopsis,
      posterUrl: optionalText(formData.get("posterUrl")),
      backdropUrl: optionalText(formData.get("backdropUrl")),
      releaseYear,
      duration,
      type: typeValue as ContentType,
      status: statusValue as ContentStatus,
      featured: formData.get("featured") === "on",
      categoryId,
      seoTitle: optionalText(formData.get("seoTitle")),
      seoDescription: optionalText(formData.get("seoDescription")),
      publishedAt,
    };

    await prisma.$transaction(async (tx) => {
      const savedMovie = id
        ? await tx.movie.update({
            where: { id },
            data,
            select: { id: true },
          })
        : await tx.movie.create({
            data,
            select: { id: true },
          });

      // Ne modifier les sources que si le formulaire a envoyé ce champ.
      if (videoSources !== null) {
        await tx.videoSource.deleteMany({
          where: { movieId: savedMovie.id },
        });

        if (videoSources.length > 0) {
          await tx.videoSource.createMany({
            data: videoSources.map((source, index) => ({
              movieId: savedMovie.id,
              label: source.label,
              url: source.url,
              provider: source.provider,
              isPrimary: source.isPrimary,
              sortOrder: index,
            })),
          });
        }
      }
    });

    refreshPages();

    return {
      ok: true,
      message: id
        ? "Contenu modifié avec succès."
        : "Contenu créé avec succès.",
    };
  } catch (error) {
    console.error("saveMovie:", error);

    if (error instanceof Error) {
      const knownValidationMessages = [
        "Accès réservé",
        "source vidéo",
        "source ",
        "URL",
        "sources vidéo",
        "format des sources",
        "type de la source",
        "liste de sources",
        "Cloudflare R2",
        "CLOUDFLARE_R2_PUBLIC_URL",
        "chemin de la vidéo",
      ];

      if (knownValidationMessages.some((message) =>
        error.message.includes(message)
      )) {
        return { ok: false, message: error.message };
      }

      if ("code" in error && error.code === "P2002") {
        return {
          ok: false,
          message: "Ce slug existe déjà. Choisissez un autre slug.",
        };
      }
    }

    return {
      ok: false,
      message:
        "Impossible d’enregistrer le contenu. Vérifiez les données saisies.",
    };
  }
}

export async function updateMovieStatus(
  id: string,
  status: string,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) {
      return { ok: false, message: "Statut invalide." };
    }

    const movie = await prisma.movie.findUnique({
      where: { id },
      select: { id: true, publishedAt: true },
    });

    if (!movie) {
      return { ok: false, message: "Contenu introuvable." };
    }

    await prisma.movie.update({
      where: { id },
      data: {
        status: status as ContentStatus,
        publishedAt:
          status === "PUBLISHED"
            ? movie.publishedAt ?? new Date()
            : status === "DRAFT"
              ? null
              : movie.publishedAt,
      },
    });

    refreshPages();

    return {
      ok: true,
      message:
        status === "PUBLISHED"
          ? "Contenu publié."
          : status === "ARCHIVED"
            ? "Contenu archivé."
            : "Contenu remis en brouillon.",
    };
  } catch (error) {
    console.error("updateMovieStatus:", error);
    return { ok: false, message: "Impossible de modifier le statut." };
  }
}

export async function toggleMovieFeatured(
  id: string,
  featured: boolean,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    await prisma.movie.update({
      where: { id },
      data: { featured },
    });

    refreshPages();

    return {
      ok: true,
      message: featured
        ? "Contenu mis en avant."
        : "Contenu retiré de la sélection.",
    };
  } catch (error) {
    console.error("toggleMovieFeatured:", error);
    return { ok: false, message: "Impossible de modifier la sélection." };
  }
}
