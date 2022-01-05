/*
  Warnings:

  - You are about to drop the column `numMemories` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "numMemories",
ADD COLUMN     "memoriesFailed" INTEGER,
ADD COLUMN     "memoriesTotal" INTEGER;
