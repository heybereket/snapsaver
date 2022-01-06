/*
  Warnings:

  - You are about to drop the column `memoriesPending` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "memoriesPending",
ADD COLUMN     "jobId" INTEGER;
