import { NextRequest, NextResponse } from "next/server";
import { PlanType } from "@prisma/client";
import { PLAN_ID_TO_TYPE, SUBSCRIPTION_PLANS, type PlanType as LocalPlanType } from "@/lib/plans";
import { getRazorpayClient } from "@/lib/razorpay";
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
    const razorpay = getRazorpayClient();

    const order = await razorpay.orders.create({
      amount: plan.price * 100,
      currency: "INR",
      receipt: `sub_${doctorId}_${Date.now()}`,
      notes: {
        planType: normalizedPlanType,
        doctorId,
        planName: plan.name,
      },
    });

    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
      select: { id: true, subscription: { select: { status: true, priceINR: true } } },
    });
    if (!doctor) {
      return NextResponse.json({ error: "Doctor profile not found." }, { status: 404 });
    }
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
        razorpayOrderId: order.id,
        status: "PENDING_PAYMENT",
      },
      create: {
        doctorId,
        plan: normalizedPlanType as PlanType,
        priceINR: plan.price,
        razorpayOrderId: order.id,
        status: "PENDING_PAYMENT",
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
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
