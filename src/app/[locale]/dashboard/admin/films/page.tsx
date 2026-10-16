
import { Suspense } from "react";
import { connection } from "next/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import FilmsManager from "./FilmsManager";

export const metadata = {
  title: "Films et séries | Administration Histyra",
};

function FilmsLoading() {
  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="animate-pulse">
        <div className="h-4 w-36 rounded bg-base-300" />
        <div className="mt-3 h-9 w-64 max-w-full rounded bg-base-300" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-base-300" />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-2xl border border-base-300 bg-base-100 p-4"
          />
        ))}
      </div>

      <div className="h-80 animate-pulse rounded-2xl border border-base-300 bg-base-100" />
    </main>
  );
}

export default function AdminFilmsPage() {
  return (
    <Suspense fallback={<FilmsLoading />}>
      <AdminFilmsContent />
    </Suspense>
  );
}

async function AdminFilmsContent() {
  await connection();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/connexion");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      role: true,
      banned: true,
    },
  });

  if (!user || user.banned) {
    redirect("/connexion");
  }

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [
    movies,
    categories,
    total,
    published,
    drafts,
    archived,
  ] = await Promise.all([
    prisma.movie.findMany({
      include: {
        category: {
          select: {
            name: true,
          },
        },
        videoSources: true,
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: [
        { featured: "desc" },
        { updatedAt: "desc" },
      ],
      take: 100,
    }),

    prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),

    prisma.movie.count(),

    prisma.movie.count({
      where: {
        status: "PUBLISHED",
      },
    }),

    prisma.movie.count({
      where: {
        status: "DRAFT",
      },
    }),

    prisma.movie.count({
      where: {
        status: "ARCHIVED",
      },
    }),
  ]);

  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">
            Histyra / ADMIN
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Films et séries
          </h1>

          <p className="mt-2 text-sm text-base-content/65">
            Gérez votre catalogue, les publications et les contenus mis en avant.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Tous les contenus", value: total },
          { label: "Publiés", value: published },
          { label: "Brouillons", value: drafts },
          { label: "Archivés", value: archived },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm"
          >
            <p className="text-sm text-base-content/65">
              {item.label}
            </p>

            <p className="mt-2 text-2xl font-bold tabular-nums">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <FilmsManager
        initialMovies={movies}
        categories={categories}
      />
    </main>
  );
}
