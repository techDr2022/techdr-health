-- CreateEnum
CREATE TYPE "Healthrecordtype" AS ENUM ('LAB_REPORT', 'PRESCRIPTION', 'SCAN', 'OTHER');

-- CreateTable
CREATE TABLE "Healthrecord" (
    "id" TEXT NOT NULL,
    "userid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "Healthrecordtype" NOT NULL DEFAULT 'OTHER',
    "r2key" TEXT NOT NULL,
    "filesize" INTEGER NOT NULL,
    "mimetype" TEXT NOT NULL,
    "sharedwith" TEXT[],
    "uploadedat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Healthrecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Healthrecord_userid_uploadedat_idx" ON "Healthrecord"("userid", "uploadedat");

-- AddForeignKey
ALTER TABLE "Healthrecord" ADD CONSTRAINT "Healthrecord_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
