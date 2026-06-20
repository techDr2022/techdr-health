import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { activatePatientHealthPassPayment } from "@/lib/payment-capture";

const bodySchema = z.object({
  orderId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { orderId } = bodySchema.parse(body);
    const result = await activatePatientHealthPassPayment(orderId, session.user.id);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      alreadyActive: result.alreadyActive,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }
    console.error("patient subscribe verify error", error);
    return NextResponse.json({ error: "Unable to verify payment." }, { status: 500 });
  }
}
