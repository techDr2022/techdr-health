import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSubscriptionConfirmationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = String(body.razorpay_order_id ?? "");
    const paymentId = String(body.razorpay_payment_id ?? "");
    const signature = String(body.razorpay_signature ?? "");
    const doctorId = String(body.applicationId ?? body.doctorId ?? "");

    if (!orderId || !paymentId || !signature || !doctorId) {
      return NextResponse.json(
        { error: "Missing payment verification payload." },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Razorpay secret is not configured." },
        { status: 500 }
      );
    }

    const generated = crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (generated !== signature) {
      return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
    }

    const subscription = await prisma.subscription.updateMany({
      where: { razorpayOrderId: orderId, doctorId },
      data: {
        status: "ACTIVE",
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        purchasedAt: new Date(),
        activatedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        renewalReminderSent: false,
        expiredEmailSent: false,
      },
    });

    if (!subscription.count) {
      return NextResponse.json({ error: "Subscription not found." }, { status: 404 });
    }

    // Keep profile hidden until onboarding details/documents are completed.
    await prisma.doctorProfile.update({
      where: { id: doctorId },
      data: { isVisible: false },
    });

    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
      include: { user: { select: { email: true } } },
    });
    if (doctor?.user.email) {
      await sendSubscriptionConfirmationEmail(
        doctor.user.email,
        doctor.displayName
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("verify payment error", error);
    return NextResponse.json(
      { error: "Unable to verify payment." },
      { status: 500 }
    );
  }
}
