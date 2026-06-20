-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "invoicenumber" TEXT,
ADD COLUMN "invoicepdfkey" TEXT,
ADD COLUMN "invoiceissuedat" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PlatformEarning" ADD COLUMN "tdsdeducted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "tdsrate" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
ADD COLUMN "netpayable" INTEGER;
