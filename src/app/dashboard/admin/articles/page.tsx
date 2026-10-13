
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ArticleManager from "@/components/admin/articles/ArticleManager";

export default function AdminArticlesPage() {
  return (
    <Suspense fallback={<ArticlesLoading />}>
      <AdminArticlesContent />
    </Suspense>
  );
}

function ArticlesLoading() {
  return (
    <main className="space-y-6 p-5 md:p-8">
      <header>
        <div className="h-8 w-72 animate-pulse rounded bg-white/10" />
        <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-white/10" />
      </header>

      <div className="h-64 animate-pulse rounded-xl border border-white/10 bg-white/5" />
    </main>
  );
}

async function AdminArticlesContent() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/connexion");
  }

  if (session.user.role !== "ADMIN" || session.user.banned) {
    redirect("/");
  }

  const [articles, categories] = await Promise.all([
    prisma.article.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),

    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  return (
    <main className="space-y-6 p-5 md:p-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
          Administration des articles
        </h1>

        <p className="mt-2 text-sm text-gray-400">
          Rédigez, publiez et gérez les actualités de Histyra.
        </p>
      </header>

      <ArticleManager
        articles={articles.map((article) => ({
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content,
          coverImageUrl: article.coverImageUrl,
          authorName: article.authorName,
          status: article.status,
          seoTitle: article.seoTitle,
          seoDescription: article.seoDescription,
          categoryId: article.categoryId,
          categoryName: article.category?.name ?? null,
          publishedAt: article.publishedAt?.toISOString() ?? null,
          updatedAt: article.updatedAt.toISOString(),
        }))}
        categories={categories}
      />
    </main>
  );
}
