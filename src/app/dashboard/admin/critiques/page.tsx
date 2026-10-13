
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ReviewManager from "@/components/admin/critiques/ReviewManager";

export default async function CritiquesAdminPage() {
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

  // Charger les critiques et les films publiés
  const [reviews, movies] = await Promise.all([
    prisma.review.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        movie: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    }),

    prisma.movie.findMany({
      where: {
        status: "PUBLISHED",
      },
      select: {
        id: true,
        title: true,
      },
      orderBy: {
        title: "asc",
      },
    }),
  ]);

  // Préparer les données pour le composant client
  const reviewData = reviews.map((review) => ({
    id: review.id,
    title: review.title,
    slug: review.slug,
    excerpt: review.excerpt,
    content: review.content,
    authorName: review.authorName,
    rating: review.rating,
    status: review.status,
    movieId: review.movieId,
    movieTitle: review.movie?.title ?? null,
    publishedAt: review.publishedAt?.toISOString() ?? null,
  }));

  return (
    <main className="min-h-screen space-y-8 bg-zinc-950 p-6 text-white md:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-400">
            CineWave / Administration
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Critiques
          </h1>

          <p className="mt-2 text-zinc-400">
            Rédigez, publiez et gérez les critiques de films.
          </p>
        </div>

        <Link
          href="/dashboard/admin"
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm transition hover:bg-zinc-800"
        >
          Retour au tableau de bord
        </Link>
      </div>

      <ReviewManager
        reviews={reviewData}
        movies={movies}
      />
    </main>
  );
}
