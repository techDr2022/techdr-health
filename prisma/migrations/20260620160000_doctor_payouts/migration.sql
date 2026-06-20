-- CreateEnum
CREATE TYPE "Payoutrecordstatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "Doctorbankaccount" (
    "id" TEXT NOT NULL,
    "doctorid" TEXT NOT NULL,
    "accountname" TEXT NOT NULL,
    "accountnumber" TEXT NOT NULL,
    "ifsc" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "cashfreebeneficiaryid" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Doctorbankaccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payoutrecord" (
    "id" TEXT NOT NULL,
    "doctorid" TEXT NOT NULL,
    "amountinr" INTEGER NOT NULL,
    "tdsinr" INTEGER NOT NULL DEFAULT 0,
    "bookingcount" INTEGER NOT NULL,
    "bookingids" TEXT[],
    "cashfreetransferid" TEXT,
    "reference" TEXT NOT NULL,
    "status" "Payoutrecordstatus" NOT NULL DEFAULT 'PENDING',
    "errormessage" TEXT,
    "processedat" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payoutrecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Doctorbankaccount_doctorid_key" ON "Doctorbankaccount"("doctorid");

-- CreateIndex
CREATE UNIQUE INDEX "Payoutrecord_reference_key" ON "Payoutrecord"("reference");

-- CreateIndex
CREATE INDEX "Payoutrecord_doctorid_createdAt_idx" ON "Payoutrecord"("doctorid", "createdAt");

-- CreateIndex
CREATE INDEX "Payoutrecord_status_idx" ON "Payoutrecord"("status");

-- AddForeignKey
ALTER TABLE "Doctorbankaccount" ADD CONSTRAINT "Doctorbankaccount_doctorid_fkey" FOREIGN KEY ("doctorid") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payoutrecord" ADD CONSTRAINT "Payoutrecord_doctorid_fkey" FOREIGN KEY ("doctorid") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
