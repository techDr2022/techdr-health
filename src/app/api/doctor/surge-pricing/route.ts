import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  enabled: z.boolean(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "DOCTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const doctor = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
    select: { surgepricingenabled: true },
  });
  if (!doctor) {
    return NextResponse.json({ error: "Doctor profile not found." }, { status: 404 });
  }

  return NextResponse.json({ surgePricingEnabled: doctor.surgepricingenabled });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "DOCTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const doctor = await prisma.doctorProfile.update({
      where: { userId: session.user.id },
      data: { surgepricingenabled: parsed.data.enabled },
      select: { surgepricingenabled: true },
    });

    return NextResponse.json({ surgePricingEnabled: doctor.surgepricingenabled });
  } catch {
    return NextResponse.json({ error: "Unable to update surge pricing." }, { status: 500 });
  }
}
