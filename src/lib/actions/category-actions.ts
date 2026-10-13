
"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

function validateName(name: string) {
  const value = name.trim();

  if (value.length < 2 || value.length > 80) {
    throw new Error(
      "Le nom doit contenir entre 2 et 80 caractères."
    );
  }

  return value;
}

function validateSlug(slug: string, name: string) {
  const value = slugify(slug || name);

  if (!value) {
    throw new Error("Le slug est invalide.");
  }

  return value;
}

function revalidateCategories() {
  revalidatePath("/dashboard/admin/categories");
  revalidatePath("/dashboard/admin/films");
  revalidatePath("/dashboard/admin/critiques");
  revalidatePath("/films");
  revalidatePath("/series");
}

export async function createCategory(formData: FormData) {
  await requireAdmin();

  const name = validateName(String(formData.get("name") ?? ""));
  const slug = validateSlug(
    String(formData.get("slug") ?? ""),
    name
  );

  const existing = await prisma.category.findFirst({
    where: {
      OR: [{ name }, { slug }],
    },
  });

  if (existing) {
    throw new Error("Ce nom ou ce slug existe déjà.");
  }

  const category = await prisma.category.create({
    data: { name, slug },
  });

  revalidateCategories();

  return { success: true, categoryId: category.id };
}

export async function updateCategory(
  id: string,
  formData: FormData
) {
  await requireAdmin();

  if (!id.trim()) {
    throw new Error("Catégorie invalide.");
  }

  const name = validateName(String(formData.get("name") ?? ""));
  const slug = validateSlug(
    String(formData.get("slug") ?? ""),
    name
  );

  const existing = await prisma.category.findFirst({
    where: {
      OR: [{ name }, { slug }],
      NOT: { id },
    },
  });

  if (existing) {
    throw new Error("Ce nom ou ce slug est déjà utilisé.");
  }

  await prisma.category.update({
    where: { id },
    data: { name, slug },
  });

  revalidateCategories();

  return { success: true };
}

export async function deleteCategory(id: string) {
  await requireAdmin();

  if (!id.trim()) {
    throw new Error("Catégorie invalide.");
  }

  // Les relations définies dans votre schéma utilisent
  // onDelete: SetNull : les contenus restent conservés.
  await prisma.category.delete({
    where: { id },
  });

  revalidateCategories();

  return { success: true };
}
