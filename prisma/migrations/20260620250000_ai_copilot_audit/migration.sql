-- Additive: AI copilot audit log for doctor in-room clinical decision support
CREATE TABLE "Aicalllog" (
    "id" TEXT NOT NULL,
    "doctoruserid" TEXT NOT NULL,
    "bookingid" TEXT,
    "endpoint" TEXT NOT NULL,
    "inputsummary" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Aicalllog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Aicalllog_doctoruserid_createdAt_idx" ON "Aicalllog"("doctoruserid", "createdAt");

ALTER TABLE "Aicalllog" ADD CONSTRAINT "Aicalllog_doctoruserid_fkey" FOREIGN KEY ("doctoruserid") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
