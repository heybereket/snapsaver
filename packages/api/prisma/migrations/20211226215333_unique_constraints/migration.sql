/*
  Warnings:

  - A unique constraint covering the columns `[date,type]` on the table `Memory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Memory_date_type_key" ON "Memory"("date", "type");
