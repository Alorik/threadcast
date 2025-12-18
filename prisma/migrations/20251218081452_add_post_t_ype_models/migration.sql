/*
  Warnings:

  - The values [CHAT,MICRO] on the enum `PostType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `mediaUrl` on the `Post` table. All the data in the column will be lost.
  - Added the required column `type` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'GIF');

-- AlterEnum
BEGIN;
CREATE TYPE "PostType_new" AS ENUM ('THREAD', 'POST');
ALTER TABLE "public"."Post" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Post" ALTER COLUMN "type" TYPE "PostType_new" USING ("type"::text::"PostType_new");
ALTER TYPE "PostType" RENAME TO "PostType_old";
ALTER TYPE "PostType_new" RENAME TO "PostType";
DROP TYPE "public"."PostType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "type" "MediaType" NOT NULL;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "mediaUrl",
ALTER COLUMN "content" DROP NOT NULL,
ALTER COLUMN "type" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Post_type_createdAt_idx" ON "Post"("type", "createdAt");
