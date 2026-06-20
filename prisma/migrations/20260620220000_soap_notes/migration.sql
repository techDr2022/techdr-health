-- CreateTable
CREATE TABLE "Soapnote" (
    "id" TEXT NOT NULL,
    "bookingid" TEXT NOT NULL,
    "subjective" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "assessment" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "aidraftused" BOOLEAN NOT NULL DEFAULT false,
    "finalized" BOOLEAN NOT NULL DEFAULT false,
    "finalizedat" TIMESTAMP(3),
    "patientshared" BOOLEAN NOT NULL DEFAULT false,
    "sharedat" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Soapnote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Soapnote_bookingid_key" ON "Soapnote"("bookingid");

-- AddForeignKey
ALTER TABLE "Soapnote" ADD CONSTRAINT "Soapnote_bookingid_fkey" FOREIGN KEY ("bookingid") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
