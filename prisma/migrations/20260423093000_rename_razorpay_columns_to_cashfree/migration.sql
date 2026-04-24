ALTER TABLE "public"."Subscription"
  RENAME COLUMN "razorpayOrderId" TO "cashfreeOrderId";

ALTER TABLE "public"."Subscription"
  RENAME COLUMN "razorpayPaymentId" TO "cashfreePaymentId";

ALTER TABLE "public"."Subscription"
  RENAME COLUMN "razorpaySignature" TO "cashfreeSignature";

ALTER TABLE "public"."Booking"
  RENAME COLUMN "razorpayOrderId" TO "cashfreeOrderId";

ALTER TABLE "public"."Booking"
  RENAME COLUMN "razorpayPaymentId" TO "cashfreePaymentId";
