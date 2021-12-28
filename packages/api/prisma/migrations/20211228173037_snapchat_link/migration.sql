/*
  Warnings:

  - Added the required column `snapchatLink` to the `Memory` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Memory_email_key";

-- AlterTable
ALTER TABLE "Memory" ADD COLUMN     "snapchatLink" TEXT NOT NULL;
