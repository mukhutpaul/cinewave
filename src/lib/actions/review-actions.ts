
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

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function readText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function requiredText(
  formData: FormData,
  key: string,
  label: string,
  maxLength: number
) {
  const value = readText(formData, key);

  if (!value || value.length > maxLength) {
    throw new Error(
      `${label} est obligatoire et limité à ${maxLength} caractères.`
    );
  }

  return value;
}

function readStatus(formData: FormData): ContentStatus {
  const status = readText(formData, "status");

  if (
    status !== "DRAFT" &&
    status !== "PUBLISHED" &&
    status !== "ARCHIVED"
  ) {
    throw new Error("Statut invalide.");
  }

  return status;
}

async function getReviewData(formData: FormData) {
  const title = requiredText(formData, "title", "Le titre", 180);
  const slug = slugify(readText(formData, "slug") || title);
  const excerpt = requiredText(
    formData,
    "excerpt",
    "Le résumé",
    500
  );
  const content = readText(formData, "content");
  const authorName = requiredText(
    formData,
    "authorName",
    "Le nom de l'auteur",
    120
  );

  if (!slug) {
    throw new Error("Le slug est invalide.");
  }

  if (!content) {
    throw new Error("Le contenu de la critique est obligatoire.");
  }

  const rawRating = readText(formData, "rating");
  let rating: number | null = null;

  if (rawRating !== "") {
    rating = Number(rawRating);

    if (
      !Number.isInteger(rating) ||
      rating < 0 ||
      rating > 10
    ) {
      throw new Error("La note doit être comprise entre 0 et 10.");
    }
  }

  const rawMovieId = readText(formData, "movieId");
  const movieId = rawMovieId || null;

  if (movieId) {
    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
      select: { id: true },
    });

    if (!movie) {
      throw new Error("Le film associé est introuvable.");
    }
  }

  const status = readStatus(formData);
  const publishedAt =
    status === "PUBLISHED" ? new Date() : null;

  return {
    title,
    slug,
    excerpt,
    content,
    authorName,
    rating,
    movieId,
    status,
    publishedAt,
  };
}

function revalidateReviews() {
  revalidatePath("/dashboard/admin/critiques");
  revalidatePath("/critiques");
}

export async function createReview(formData: FormData) {
  await requireAdmin();

  const data = await getReviewData(formData);

  const existing = await prisma.review.findUnique({
    where: { slug: data.slug },
    select: { id: true },
  });

  if (existing) {
    throw new Error("Ce slug est déjà utilisé.");
  }

  const review = await prisma.review.create({
    data,
  });

  revalidateReviews();

  return { success: true, reviewId: review.id };
}

export async function updateReview(
  id: string,
  formData: FormData
) {
  await requireAdmin();

  if (!id.trim()) {
    throw new Error("Critique invalide.");
  }

  const data = await getReviewData(formData);

  const existing = await prisma.review.findFirst({
    where: {
      slug: data.slug,
      NOT: { id },
    },
    select: { id: true },
  });

  if (existing) {
    throw new Error("Ce slug est déjà utilisé.");
  }

  const previous = await prisma.review.findUnique({
    where: { id },
    select: { publishedAt: true, status: true },
  });

  if (!previous) {
    throw new Error("Critique introuvable.");
  }

  // Conserve la date initiale de publication lors d'une modification.
  const publishedAt =
    data.status === "PUBLISHED"
      ? previous.status === "PUBLISHED"
        ? previous.publishedAt ?? new Date()
        : new Date()
      : null;

  await prisma.review.update({
    where: { id },
    data: { ...data, publishedAt },
  });

  revalidateReviews();

  return { success: true };
}

export async function deleteReview(id: string) {
  await requireAdmin();

  if (!id.trim()) {
    throw new Error("Critique invalide.");
  }

  await prisma.review.delete({
    where: { id },
  });

  revalidateReviews();

  return { success: true };
}
