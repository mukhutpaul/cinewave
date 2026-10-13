
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CategoryManager from "@/components/admin/categories/CategoryManager";

export default async function CategoriesAdminPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Vérifier que l'utilisateur est connecté
  if (!session?.user) {
    redirect("/login");
  }

  // Réserver cette page aux administrateurs actifs
  if (
    session.user.role !== "ADMIN" ||
    session.user.banned
  ) {
    redirect("/dashboard");
  }

  // Récupérer les catégories et le nombre de contenus associés
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: {
          movies: true,
          articles: true,
        },
      },
    },
  });

  // Préparer les données transmises au composant client
  const data = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    moviesCount: category._count.movies,
    articlesCount: category._count.articles,
  }));

  return (
    <main className="min-h-screen space-y-8 bg-zinc-950 p-6 text-white md:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-400">
            Histyra / Administration
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Catégories
          </h1>

          <p className="mt-2 text-zinc-400">
            Organisez les films et les articles de votre plateforme.
          </p>
        </div>

        <Link
          href="/dashboard/admin"
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm transition hover:bg-zinc-800"
        >
          Retour au tableau de bord
        </Link>
      </div>

      <CategoryManager categories={data} />
    </main>
  );
}
