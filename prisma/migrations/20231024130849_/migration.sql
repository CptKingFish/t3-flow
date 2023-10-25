/*
  Warnings:

  - You are about to alter the column `id` on the `Flowchart` table. The data in that column will be cast from `Uuid` to `String`. This cast may fail. Please make sure the data in the column can be cast.

*/
-- RedefineTables
CREATE TABLE "_prisma_new_Flowchart" (
    "id" STRING NOT NULL,
    "title" STRING NOT NULL,
    "state" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Flowchart_pkey" PRIMARY KEY ("id")
);
DROP INDEX "Flowchart_id_idx";
INSERT INTO "_prisma_new_Flowchart" ("createdAt","id","state","title","updatedAt") SELECT "createdAt","id","state","title","updatedAt" FROM "Flowchart";
DROP TABLE "Flowchart" CASCADE;
ALTER TABLE "_prisma_new_Flowchart" RENAME TO "Flowchart";
CREATE INDEX "Flowchart_id_idx" ON "Flowchart"("id");
