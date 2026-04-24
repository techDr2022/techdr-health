import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSubscriptionConfirmationEmail } from "@/lib/email";
import { fetchCashfreeOrder } from "@/lib/cashfree";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = String(body.orderId ?? "");
    const doctorId = String(body.applicationId ?? body.doctorId ?? "");

    if (!orderId || !doctorId) {
      return NextResponse.json(
        { error: "Missing payment verification payload." },
        { status: 400 }
      );
    }

    const order = await fetchCashfreeOrder(orderId);
    if (order.order_status !== "PAID") {
      return NextResponse.json({ error: "Payment is not completed yet." }, { status: 400 });
    }

    const subscription = await prisma.subscription.updateMany({
      where: { cashfreeOrderId: orderId, doctorId },
      data: {
        status: "ACTIVE",
        cashfreePaymentId: order.order_id,
        cashfreeSignature: "cashfree-verified",
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
