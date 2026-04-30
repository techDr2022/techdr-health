import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyOTP } from "@/lib/otp";

const schema = z.object({
  channel: z.enum(["email"]).optional().default("email"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address").optional(),
  otp: z.string().length(6),
  purpose: z.enum(["LOGIN"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp, purpose } = schema.parse(body);
    const identifier = email;
    if (!identifier) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const result = await verifyOTP(identifier, otp, purpose);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: identifier } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({
      success: true,
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid request body" }, { status: 400 });
    }
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
