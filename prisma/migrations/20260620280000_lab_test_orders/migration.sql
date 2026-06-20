-- Additive: patient lab test booking requests (affiliate handoff)
CREATE TABLE "Labtestorder" (
    "id" TEXT NOT NULL,
    "userid" TEXT NOT NULL,
    "panelname" TEXT NOT NULL,
    "testnames" TEXT[],
    "city" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "affiliateurl" TEXT,
    "bookingid" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Labtestorder_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Labtestorder_userid_createdAt_idx" ON "Labtestorder"("userid", "createdAt");

ALTER TABLE "Labtestorder" ADD CONSTRAINT "Labtestorder_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
