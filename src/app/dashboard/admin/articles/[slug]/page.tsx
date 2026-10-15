
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const metadata: Metadata = {
  title: "Actualités | Histyra",
  description: "Découvrez les actualités et articles publiés sur Histyra.",
};

async function getArticle(slug: string) {
  return prisma.article.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
      publishedAt: {
        lte: new Date(),
      },
    },
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });
}

function ArticleLoading() {
  return (
    <main className="min-h-screen bg-base-100">
      <div className="mx-auto max-w-4xl animate-pulse px-4 py-10 sm:px-6 lg:py-16">
        <div className="mb-8 h-4 w-40 rounded bg-base-300" />
        <div className="h-12 w-4/5 rounded bg-base-300" />
        <div className="mt-5 h-5 w-full rounded bg-base-200" />
        <div className="mt-8 aspect-video rounded-2xl bg-base-200" />

        <div className="mt-10 space-y-3">
          <div className="h-4 rounded bg-base-200" />
          <div className="h-4 rounded bg-base-200" />
          <div className="h-4 w-3/4 rounded bg-base-200" />
        </div>
      </div>
    </main>
  );
}

async function ArticleContent({ slug }: { slug: string }) {
  // Les données dépendantes de la requête sont chargées à l'exécution.
  await connection();

  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const date = article.publishedAt
    ? new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(article.publishedAt)
    : null;

  return (
    <main className="min-h-screen bg-base-100">
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:py-16">
        <nav
          aria-label="Fil d’Ariane"
          className="mb-8 text-sm text-base-content/60"
        >
          <Link href="/" className="hover:text-primary">
            Accueil
          </Link>

          <span className="mx-2">/</span>

          <Link href="/actualites" className="hover:text-primary">
            Actualités
          </Link>

          {article.category && (
            <>
              <span className="mx-2">/</span>
              <span>{article.category.name}</span>
            </>
          )}
        </nav>

        {article.category && (
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            {article.category.name}
          </p>
        )}

        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="mt-5 text-lg leading-8 text-base-content/70">
            {article.excerpt}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-base-content/60">
          {article.authorName && <span>Par {article.authorName}</span>}

          {date && <time>{date}</time>}
        </div>

        {article.coverImageUrl && (
          <div className="relative mt-9 aspect-video overflow-hidden rounded-2xl bg-base-200">
            <Image
              src={article.coverImageUrl}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 896px"
              className="object-cover"
            />
          </div>
        )}

        <article className="prose prose-lg mt-10 max-w-none break-words dark:prose-invert">
          {article.content.split(/\r?\n/).map((paragraph, index) =>
            paragraph.trim() ? (
              <p key={index} className="whitespace-pre-wrap">
                {paragraph}
              </p>
            ) : null
          )}
        </article>

        <div className="mt-12 border-t border-base-300 pt-6">
          <Link
            href="/actualites"
            className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
          >
            <span aria-hidden="true">←</span>
            Retour aux actualités
          </Link>
        </div>
      </div>
    </main>
  );
}

async function ArticlePageContent({ params }: PageProps) {
  // Important : params est résolu à l'intérieur de Suspense.
  const { slug } = await params;

  return <ArticleContent slug={slug} />;
}

export default function ArticlePage({ params }: PageProps) {
  return (
    <Suspense fallback={<ArticleLoading />}>
      <ArticlePageContent params={params} />
    </Suspense>
  );
}
