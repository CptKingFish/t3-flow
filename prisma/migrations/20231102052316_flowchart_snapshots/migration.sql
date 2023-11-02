-- CreateTable
CREATE TABLE "Flowchart" (
    "id" STRING NOT NULL,
    "title" STRING NOT NULL,
    "state" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Flowchart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlowchartSnapshots" (
    "id" STRING NOT NULL,
    "flowchartId" STRING NOT NULL,
    "state" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlowchartSnapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Flowchart_id_idx" ON "Flowchart"("id");

-- CreateIndex
CREATE INDEX "FlowchartSnapshots_id_idx" ON "FlowchartSnapshots"("id");

-- CreateIndex
CREATE INDEX "FlowchartSnapshots_flowchartId_idx" ON "FlowchartSnapshots"("flowchartId");

-- AddForeignKey
ALTER TABLE "FlowchartSnapshots" ADD CONSTRAINT "FlowchartSnapshots_flowchartId_fkey" FOREIGN KEY ("flowchartId") REFERENCES "Flowchart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
