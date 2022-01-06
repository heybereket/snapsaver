-- AlterTable
ALTER TABLE "User" ADD COLUMN     "activeDownload" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "betaUser" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "numMemories" DROP NOT NULL;
