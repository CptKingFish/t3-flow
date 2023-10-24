-- CreateTable
CREATE TABLE "Flowchart" (
    "id" UUID NOT NULL,
    "title" STRING NOT NULL,
    "state" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Flowchart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Flowchart_id_idx" ON "Flowchart"("id");
