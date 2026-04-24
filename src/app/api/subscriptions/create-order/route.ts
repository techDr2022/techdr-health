import { NextRequest, NextResponse } from "next/server";
import { PlanType } from "@prisma/client";
import { PLAN_ID_TO_TYPE, SUBSCRIPTION_PLANS, type PlanType as LocalPlanType } from "@/lib/plans";
import { createCashfreeOrder, getCashfreeMode } from "@/lib/cashfree";
import { prisma } from "@/lib/prisma";

function normalizePlanType(input: string): LocalPlanType | null {
  const upper = input.toUpperCase();
  if (upper in SUBSCRIPTION_PLANS) return upper as LocalPlanType;
  if (input in PLAN_ID_TO_TYPE) return PLAN_ID_TO_TYPE[input];
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const doctorId = String(body.applicationId ?? body.doctorId ?? "");
    const requested = String(body.planType ?? "");

    if (!doctorId || !requested) {
      return NextResponse.json(
        { error: "planType and doctorId are required." },
        { status: 400 }
      );
    }

    const normalizedPlanType = normalizePlanType(requested);
    if (!normalizedPlanType) {
      return NextResponse.json({ error: "Invalid plan type." }, { status: 400 });
    }

    const plan = SUBSCRIPTION_PLANS[normalizedPlanType];
    const doctorForPayment = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
      include: {
        user: { select: { email: true, phone: true, name: true } },
        subscription: { select: { status: true, priceINR: true } },
      },
    });
    if (!doctorForPayment) {
      return NextResponse.json({ error: "Doctor profile not found." }, { status: 404 });
    }
    const order = await createCashfreeOrder({
      orderId: `sub_${doctorId}_${Date.now()}`,
      amount: plan.price,
      customerId: doctorId,
      customerName: doctorForPayment.displayName || doctorForPayment.user.name || "Doctor",
      customerEmail: doctorForPayment.user.email,
      customerPhone: doctorForPayment.user.phone || "9999999999",
      returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/join/register`,
      notes: {
        planType: normalizedPlanType,
        doctorId,
        planName: plan.name,
      },
    });
    const doctor = doctorForPayment;
    if (doctor.subscription?.status === "ACTIVE" && doctor.subscription.priceINR === 0) {
      return NextResponse.json(
        { error: "Free listing already activated for this account.", freeListing: true },
        { status: 409 }
      );
    }

    const subscription = await prisma.subscription.upsert({
      where: { doctorId },
      update: {
        plan: normalizedPlanType as PlanType,
        priceINR: plan.price,
        cashfreeOrderId: order.order_id,
        status: "PENDING_PAYMENT",
      },
      create: {
        doctorId,
        plan: normalizedPlanType as PlanType,
        priceINR: plan.price,
        cashfreeOrderId: order.order_id,
        status: "PENDING_PAYMENT",
      },
    });

    return NextResponse.json({
      orderId: order.order_id,
      amount: order.order_amount,
      currency: order.order_currency,
      paymentSessionId: order.payment_session_id,
      cashfreeMode: getCashfreeMode(),
      subscriptionId: subscription.id,
    });
  } catch (error) {
    console.error("create subscription order error", error);
    return NextResponse.json(
      { error: "Unable to create payment order." },
      { status: 500 }
    );
  }
}
