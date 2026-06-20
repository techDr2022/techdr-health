import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { createCashfreeOrder, getCashfreeMode } from "@/lib/cashfree";
import {
  HEALTH_PASS_PLANS,
  normalizeHealthPassPlan,
} from "@/lib/patient-health-pass";
import { getActivePatientHealthPass } from "@/lib/patient-health-pass-db";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-config";

const bodySchema = z.object({
  plan: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "PATIENT") {
    return NextResponse.json({ error: "Health Pass is for patient accounts only." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { plan: planRaw } = bodySchema.parse(body);
    const plan = normalizeHealthPassPlan(planRaw);
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan. Choose BASIC or PREMIUM." }, { status: 400 });
    }

    const existing = await getActivePatientHealthPass(session.user.id);
    if (existing) {
      return NextResponse.json(
        { error: "You already have an active Health Pass.", plan: existing.plan },
        { status: 409 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, phone: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const planConfig = HEALTH_PASS_PLANS[plan];
    const orderId = `psub_${user.id.slice(0, 8)}_${Date.now()}`;

    const order = await createCashfreeOrder({
      orderId,
      amount: planConfig.priceINR,
      customerId: user.id,
      customerName: user.name || "Patient",
      customerEmail: user.email,
      customerPhone: user.phone || "9999999999",
      returnUrl: `${getSiteUrl()}/pricing?subscribed=1`,
      notes: {
        plan,
        userId: user.id,
        product: "health_pass",
      },
    });

    await prisma.patientsubscription.upsert({
      where: { userid: user.id },
      update: {
        plan,
        status: "PENDING_PAYMENT",
        cashfreeorderid: order.order_id,
        startdate: null,
        enddate: null,
      },
      create: {
        userid: user.id,
        plan,
        status: "PENDING_PAYMENT",
        cashfreeorderid: order.order_id,
      },
    });

    return NextResponse.json({
      orderId: order.order_id,
      amount: order.order_amount,
      currency: order.order_currency,
      paymentSessionId: order.payment_session_id,
      cashfreeMode: getCashfreeMode(),
      plan,
      planName: planConfig.name,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }
    console.error("patient subscribe error", error);
    return NextResponse.json({ error: "Unable to create Health Pass order." }, { status: 500 });
  }
}
