
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const article = await prisma.article.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
    },
    select: {
      title: true,
      excerpt: true,
      coverImageUrl: true,
      seoTitle: true,
      seoDescription: true,
    },
  });

  if (!article) {
    return { title: "Article introuvable | Histyra" };
  }

  return {
    title: article.seoTitle || article.title,
    description:
      article.seoDescription ||
      article.excerpt ||
      `Lisez cet article sur Histyra : ${article.title}`,
    openGraph: {
      title: article.seoTitle || article.title,
      description:
        article.seoDescription || article.excerpt || article.title,
      images: article.coverImageUrl
        ? [article.coverImageUrl]
        : [],
      type: "article",
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;

  const article = await prisma.article.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
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

  if (!article) notFound();

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
          {article.authorName && (
            <span>Par {article.authorName}</span>
          )}
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
