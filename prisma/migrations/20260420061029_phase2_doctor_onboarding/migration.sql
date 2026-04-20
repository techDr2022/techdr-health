-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('INDIVIDUAL', 'CLINIC', 'HOSPITAL');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('PENDING_PAYMENT', 'ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'CAPTURED', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "Doctor" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "password" TEXT,
    "credentials" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "subSpecialties" TEXT[],
    "experience" INTEGER NOT NULL,
    "bio" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "languages" TEXT[],
    "consultFee" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "conditions" TEXT[],
    "education" JSONB NOT NULL,
    "hospitalAffils" TEXT[],
    "onboardingStatus" "OnboardingStatus" NOT NULL DEFAULT 'APPROVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Availability" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Specialty" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT NOT NULL,
    "conditions" TEXT[],
    "faq" JSONB NOT NULL,

    CONSTRAINT "Specialty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "plan" "PlanType" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "priceINR" INTEGER NOT NULL,
    "startsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "renewalReminder" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoctorApplication" (
    "id" TEXT NOT NULL,
    "plan" "PlanType" NOT NULL,
    "status" "OnboardingStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "entityName" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "specialty" TEXT,
    "subSpecialties" TEXT[],
    "experience" INTEGER,
    "credentials" TEXT,
    "medRegNumber" TEXT,
    "languages" TEXT[],
    "consultationFee" INTEGER,
    "clinicName" TEXT,
    "hospitalName" TEXT,
    "address" TEXT,
    "city" TEXT,
    "pincode" TEXT,
    "medRegCertUrl" TEXT,
    "degreeDocUrl" TEXT,
    "govIdUrl" TEXT,
    "clinicRegUrl" TEXT,
    "profilePhotoUrl" TEXT,
    "logoUrl" TEXT,
    "subscriptionId" TEXT,
    "rejectionReason" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "consultationType" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 15,
    "consultationFee" INTEGER NOT NULL,
    "platformFeeINR" INTEGER NOT NULL,
    "doctorPayoutINR" INTEGER NOT NULL,
    "gstINR" INTEGER NOT NULL,
    "totalPatientPays" INTEGER NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "payoutStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "payoutDate" TIMESTAMP(3),
    "payoutReference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UPCOMING',
    "cancellationReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformEarning" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "platformFeeINR" INTEGER NOT NULL,
    "gstINR" INTEGER NOT NULL,
    "totalEarned" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformEarning_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_slug_key" ON "Doctor"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_email_key" ON "Doctor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Specialty_slug_key" ON "Specialty"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorApplication_email_key" ON "DoctorApplication"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorApplication_subscriptionId_key" ON "DoctorApplication"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformEarning_bookingId_key" ON "PlatformEarning"("bookingId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorApplication" ADD CONSTRAINT "DoctorApplication_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformEarning" ADD CONSTRAINT "PlatformEarning_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
