-- CreateEnum
CREATE TYPE "VideoProvider" AS ENUM ('OWN_HOSTING', 'EXTERNAL');

-- CreateTable
CREATE TABLE "VideoSource" (
    "id" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT 'Source vidéo',
    "url" TEXT NOT NULL,
    "provider" "VideoProvider" NOT NULL DEFAULT 'EXTERNAL',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VideoSource_movieId_sortOrder_idx" ON "VideoSource"("movieId", "sortOrder");

-- CreateIndex
CREATE INDEX "VideoSource_movieId_isPrimary_idx" ON "VideoSource"("movieId", "isPrimary");

-- AddForeignKey
ALTER TABLE "VideoSource" ADD CONSTRAINT "VideoSource_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
