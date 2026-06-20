-- CreateTable
CREATE TABLE "Familymember" (
    "id" TEXT NOT NULL,
    "userid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Familymember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Familymember_userid_idx" ON "Familymember"("userid");

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "familymemberid" TEXT;

-- AddForeignKey
ALTER TABLE "Familymember" ADD CONSTRAINT "Familymember_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_familymemberid_fkey" FOREIGN KEY ("familymemberid") REFERENCES "Familymember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
