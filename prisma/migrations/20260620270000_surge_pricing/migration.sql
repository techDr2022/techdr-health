-- Additive: dynamic surge pricing opt-in + booking audit
ALTER TABLE "DoctorProfile" ADD COLUMN "surgepricingenabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Booking" ADD COLUMN "surgemultiplier" DOUBLE PRECISION;
