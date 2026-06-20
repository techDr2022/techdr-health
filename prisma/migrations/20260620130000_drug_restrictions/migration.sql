-- TPG compliance: flag first consult with a doctor for scheduled drug rules
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "isfirstconsult" BOOLEAN NOT NULL DEFAULT true;
