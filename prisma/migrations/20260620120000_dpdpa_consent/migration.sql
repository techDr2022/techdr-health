-- DPDPA compliance: marketing consent on User, telemedicine consent audit on Booking
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "marketingconsent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "marketingconsentat" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "datadeleterequested" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "datadeleterequestedat" TIMESTAMP(3);

ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "consentgiven" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "consenttimestamp" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "consentip" TEXT;
