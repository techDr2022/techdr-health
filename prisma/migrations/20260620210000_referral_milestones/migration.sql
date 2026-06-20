-- AlterTable
ALTER TABLE "DoctorProfile" ADD COLUMN "patientreferralcode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "DoctorProfile_patientreferralcode_key" ON "DoctorProfile"("patientreferralcode");

-- CreateTable
CREATE TABLE "Referralmilestone" (
    "id" TEXT NOT NULL,
    "doctorid" TEXT NOT NULL,
    "milestone" INTEGER NOT NULL,
    "rewardtype" TEXT NOT NULL,
    "rewardvalue" TEXT NOT NULL,
    "awardedat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Referralmilestone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Referralmilestone_doctorid_milestone_key" ON "Referralmilestone"("doctorid", "milestone");

-- CreateIndex
CREATE INDEX "Referralmilestone_doctorid_idx" ON "Referralmilestone"("doctorid");

-- CreateIndex
CREATE INDEX "Referralmilestone_paid_rewardtype_idx" ON "Referralmilestone"("paid", "rewardtype");

-- AddForeignKey
ALTER TABLE "Referralmilestone" ADD CONSTRAINT "Referralmilestone_doctorid_fkey" FOREIGN KEY ("doctorid") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
