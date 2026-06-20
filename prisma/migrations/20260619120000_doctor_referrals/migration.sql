-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('PENDING', 'JOINED', 'REWARDED');

-- AlterTable
ALTER TABLE "DoctorProfile" ADD COLUMN "referralcode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "DoctorProfile_referralcode_key" ON "DoctorProfile"("referralcode");

-- CreateTable
CREATE TABLE "DoctorReferral" (
    "id" TEXT NOT NULL,
    "referrerdoctorid" TEXT NOT NULL,
    "referreddoctorid" TEXT NOT NULL,
    "status" "ReferralStatus" NOT NULL DEFAULT 'PENDING',
    "joinedat" TIMESTAMP(3),
    "rewardgrantedat" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorReferral_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DoctorReferral_referreddoctorid_key" ON "DoctorReferral"("referreddoctorid");

-- CreateIndex
CREATE INDEX "DoctorReferral_referrerdoctorid_idx" ON "DoctorReferral"("referrerdoctorid");

-- AddForeignKey
ALTER TABLE "DoctorReferral" ADD CONSTRAINT "DoctorReferral_referrerdoctorid_fkey" FOREIGN KEY ("referrerdoctorid") REFERENCES "DoctorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorReferral" ADD CONSTRAINT "DoctorReferral_referreddoctorid_fkey" FOREIGN KEY ("referreddoctorid") REFERENCES "DoctorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
