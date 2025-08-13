/*
  Warnings:

  - You are about to drop the column `slide` on the `fragments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."fragments" DROP COLUMN "slide";

-- CreateTable
CREATE TABLE "public"."slides" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fragmentId" TEXT NOT NULL,

    CONSTRAINT "slides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."videos" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fragmentId" TEXT NOT NULL,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "slides_fragmentId_order_key" ON "public"."slides"("fragmentId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "videos_fragmentId_order_key" ON "public"."videos"("fragmentId", "order");

-- AddForeignKey
ALTER TABLE "public"."slides" ADD CONSTRAINT "slides_fragmentId_fkey" FOREIGN KEY ("fragmentId") REFERENCES "public"."fragments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."videos" ADD CONSTRAINT "videos_fragmentId_fkey" FOREIGN KEY ("fragmentId") REFERENCES "public"."fragments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
