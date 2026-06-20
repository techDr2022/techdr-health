-- NMC registration verification audit fields on DoctorProfile
ALTER TABLE "DoctorProfile" ADD COLUMN IF NOT EXISTS "nmcverified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "DoctorProfile" ADD COLUMN IF NOT EXISTS "nmcverifiedat" TIMESTAMP(3);
ALTER TABLE "DoctorProfile" ADD COLUMN IF NOT EXISTS "nmcverifiedby" TEXT;
