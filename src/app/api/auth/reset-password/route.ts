import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyOTP } from "@/lib/otp";

const schema = z
  .object({
    channel: z.enum(["email"]).optional().default("email"),
    email: z.string().trim().toLowerCase().email("Enter a valid email address").optional(),
    otp: z.string().length(6),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request body." },
        { status: 400 }
      );
    }

    const { email, otp, newPassword } = parsed.data;
    const identifier = email;
    if (!identifier) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const otpResult = await verifyOTP(identifier, otp, "RESET");
    if (!otpResult.success) {
      return NextResponse.json({ error: otpResult.error ?? "Invalid OTP." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: identifier } });
    if (!user) {
      return NextResponse.json({ error: "No account found with this email." }, { status: 404 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, authProvider: "email" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("reset password error", error);
    return NextResponse.json({ error: "Unable to reset password." }, { status: 500 });
  }
}
