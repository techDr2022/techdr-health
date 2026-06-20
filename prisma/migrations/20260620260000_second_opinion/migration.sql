-- Additive: second opinion booking workflow
ALTER TABLE "Booking" ADD COLUMN "secondopinionforbookingid" TEXT;
ALTER TABLE "Booking" ADD COLUMN "issecondopinion" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Booking" ADD COLUMN "secondopinionshareconsent" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Soapnote" ADD COLUMN "sharedwithdoctorids" TEXT[] DEFAULT ARRAY[]::TEXT[];

CREATE INDEX "Booking_secondopinionforbookingid_idx" ON "Booking"("secondopinionforbookingid");

ALTER TABLE "Booking" ADD CONSTRAINT "Booking_secondopinionforbookingid_fkey"
  FOREIGN KEY ("secondopinionforbookingid") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
