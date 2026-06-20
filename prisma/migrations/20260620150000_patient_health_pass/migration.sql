-- TechDr Health Pass patient subscription
CREATE TABLE IF NOT EXISTS "Patientsubscription" (
  "id" TEXT NOT NULL,
  "userid" TEXT NOT NULL,
  "plan" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
  "startdate" TIMESTAMP(3),
  "enddate" TIMESTAMP(3),
  "cashfreeorderid" TEXT,
  "videoconsultsused" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Patientsubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Patientsubscription_userid_key" ON "Patientsubscription"("userid");
CREATE UNIQUE INDEX IF NOT EXISTS "Patientsubscription_cashfreeorderid_key" ON "Patientsubscription"("cashfreeorderid");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Patientsubscription_userid_fkey'
  ) THEN
    ALTER TABLE "Patientsubscription"
      ADD CONSTRAINT "Patientsubscription_userid_fkey"
      FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "healthpassapplied" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "healthpassdiscountinr" INTEGER NOT NULL DEFAULT 0;
