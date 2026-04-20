import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Webhook secret missing." },
        { status: 500 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (!signature || signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
    }

    const event = JSON.parse(body) as {
      event: string;
      payload?: {
        payment?: {
          entity?: {
            id?: string;
            order_id?: string;
          };
        };
      };
    };

    if (event.event === "payment.captured") {
      const payment = event.payload?.payment?.entity;
      const orderId = payment?.order_id;
      const paymentId = payment?.id;

      if (orderId && paymentId) {
        await prisma.subscription.updateMany({
          where: { razorpayOrderId: orderId },
          data: {
            status: "ACTIVE",
            razorpayPaymentId: paymentId,
            purchasedAt: new Date(),
            activatedAt: new Date(),
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            renewalReminderSent: false,
            expiredEmailSent: false,
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("razorpay webhook error", error);
    return NextResponse.json({ error: "Webhook failed." }, { status: 500 });
  }
}
