-- CreateTable: ContentSlot
CREATE TABLE "ContentSlot" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentSlot_pkey" PRIMARY KEY ("id")
);

-- Unique subject per slot
CREATE UNIQUE INDEX "ContentSlot_subject_key" ON "ContentSlot"("subject");

-- Drop old ContentSchedule if exists and recreate with slotId
DROP TABLE IF EXISTS "ContentSchedule";

CREATE TABLE "ContentSchedule" (
    "id" TEXT NOT NULL,
    "rotationOrder" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contentId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,

    CONSTRAINT "ContentSchedule_pkey" PRIMARY KEY ("id")
);

-- One schedule per content
CREATE UNIQUE INDEX "ContentSchedule_contentId_key" ON "ContentSchedule"("contentId");

-- Remove duration column from Content if it exists
ALTER TABLE "Content" DROP COLUMN IF EXISTS "duration";

-- Foreign keys
ALTER TABLE "ContentSchedule" ADD CONSTRAINT "ContentSchedule_contentId_fkey"
    FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ContentSchedule" ADD CONSTRAINT "ContentSchedule_slotId_fkey"
    FOREIGN KEY ("slotId") REFERENCES "ContentSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
