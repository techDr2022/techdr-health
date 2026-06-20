-- CreateEnum
CREATE TYPE "Bookingqueuestatus" AS ENUM ('WAITING', 'MATCHED', 'EXPIRED', 'CANCELLED');

-- AlterTable
ALTER TABLE "DoctorProfile" ADD COLUMN "acceptinstantconsult" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "instantonline" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "isinstantconsult" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Bookingqueue" (
    "id" TEXT NOT NULL,
    "patientid" TEXT NOT NULL,
    "specialtyslug" TEXT NOT NULL,
    "status" "Bookingqueuestatus" NOT NULL DEFAULT 'WAITING',
    "queuedat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "matchedat" TIMESTAMP(3),
    "doctorid" TEXT,
    "bookingid" TEXT,
    "expiresat" TIMESTAMP(3) NOT NULL,
    "concern" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bookingqueue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bookingqueue_bookingid_key" ON "Bookingqueue"("bookingid");

-- CreateIndex
CREATE INDEX "Bookingqueue_status_specialtyslug_queuedat_idx" ON "Bookingqueue"("status", "specialtyslug", "queuedat");

-- CreateIndex
CREATE INDEX "Bookingqueue_patientid_status_idx" ON "Bookingqueue"("patientid", "status");

-- AddForeignKey
ALTER TABLE "Bookingqueue" ADD CONSTRAINT "Bookingqueue_patientid_fkey" FOREIGN KEY ("patientid") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookingqueue" ADD CONSTRAINT "Bookingqueue_doctorid_fkey" FOREIGN KEY ("doctorid") REFERENCES "DoctorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookingqueue" ADD CONSTRAINT "Bookingqueue_bookingid_fkey" FOREIGN KEY ("bookingid") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
