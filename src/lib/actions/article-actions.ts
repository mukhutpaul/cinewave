
"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ContentStatus } from "@/generated/prisma/client";

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
}

function getText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getStatus(value: string): ContentStatus {
  if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(value)) {
    throw new Error("Le statut sélectionné est invalide.");
  }

  return value as ContentStatus;
}

function validateArticle(formData: FormData) {
  const title = getText(formData, "title");
  const slug = slugify(getText(formData, "slug") || title);
  const excerpt = getText(formData, "excerpt");
  const content = getText(formData, "content");
  const authorName = getText(formData, "authorName");
  const coverImageUrl = getText(formData, "coverImageUrl");
  const seoTitle = getText(formData, "seoTitle");
  const seoDescription = getText(formData, "seoDescription");
  const categoryId = getText(formData, "categoryId");
  const status = getStatus(getText(formData, "status"));

  if (!title) throw new Error("Le titre est obligatoire.");
  if (title.length > 180) {
    throw new Error("Le titre ne peut pas dépasser 180 caractères.");
  }

  if (!slug) throw new Error("Le slug est invalide.");
  if (!excerpt) throw new Error("Le résumé est obligatoire.");
  if (!content) throw new Error("Le contenu est obligatoire.");
  if (!authorName) throw new Error("Le nom de l'auteur est obligatoire.");
  if (authorName.length > 120) {
    throw new Error("Le nom de l'auteur est trop long.");
  }

  if (coverImageUrl) {
    try {
      const url = new URL(coverImageUrl);
      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error();
      }
    } catch {
      throw new Error("L'URL de l'image de couverture est invalide.");
    }
  }

  if (seoTitle.length > 180) {
    throw new Error("Le titre SEO est trop long.");
  }

  if (seoDescription.length > 320) {
    throw new Error("La description SEO est trop longue.");
  }

  return {
    title,
    slug,
    excerpt,
    content,
    authorName,
    coverImageUrl: coverImageUrl || null,
    seoTitle: seoTitle || null,
    seoDescription: seoDescription || null,
    categoryId: categoryId || null,
    status,
  };
}

async function validateCategory(categoryId: string | null) {
  if (!categoryId) return;

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });

  if (!category) {
    throw new Error("La catégorie sélectionnée n'existe pas.");
  }
}

function revalidateArticlePaths() {
  revalidatePath("/dashboard/admin/articles");
  revalidatePath("/actualites");
  revalidatePath("/articles");
  revalidatePath("/");
}

export async function createArticle(formData: FormData) {
  await requireAdmin();

  const data = validateArticle(formData);
  await validateCategory(data.categoryId);

  const existing = await prisma.article.findUnique({
    where: { slug: data.slug },
    select: { id: true },
  });

  if (existing) {
    throw new Error("Ce slug est déjà utilisé.");
  }

  await prisma.article.create({
    data: {
      ...data,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
    },
  });

  revalidateArticlePaths();
}

export async function updateArticle(
  id: string,
  formData: FormData,
) {
  await requireAdmin();

  if (!id) throw new Error("Identifiant de l'article manquant.");

  const data = validateArticle(formData);
  await validateCategory(data.categoryId);

  const existing = await prisma.article.findUnique({
    where: { id },
    select: { id: true, publishedAt: true },
  });

  if (!existing) throw new Error("Article introuvable.");

  const slugOwner = await prisma.article.findUnique({
    where: { slug: data.slug },
    select: { id: true },
  });

  if (slugOwner && slugOwner.id !== id) {
    throw new Error("Ce slug est déjà utilisé.");
  }

  await prisma.article.update({
    where: { id },
    data: {
      ...data,
      publishedAt:
        data.status === "PUBLISHED"
          ? existing.publishedAt ?? new Date()
          : null,
    },
  });

  revalidateArticlePaths();
}

export async function deleteArticle(id: string) {
  await requireAdmin();

  if (!id) throw new Error("Identifiant de l'article manquant.");

  const existing = await prisma.article.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) throw new Error("Article introuvable.");

  await prisma.article.delete({ where: { id } });

  revalidateArticlePaths();
}
