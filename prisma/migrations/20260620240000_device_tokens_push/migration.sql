-- CreateTable
CREATE TABLE "Devicetoken" (
    "id" TEXT NOT NULL,
    "userid" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Devicetoken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Devicetoken_token_key" ON "Devicetoken"("token");

-- CreateIndex
CREATE INDEX "Devicetoken_userid_idx" ON "Devicetoken"("userid");

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "reminderpushsent" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Devicetoken" ADD CONSTRAINT "Devicetoken_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
