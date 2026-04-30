import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyOTP } from "@/lib/otp";
import { createMobileSession } from "@/lib/mobile-session";

const schema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  otp: z.string().length(6),
  purpose: z.enum(["LOGIN", "REGISTER"]),
  name: z.string().optional(),
  role: z.enum(["PATIENT", "DOCTOR"]).optional(),
  client: z.enum(["web", "mobile"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, otp, purpose, name, role, client } = schema.parse(body);

    const result = await verifyOTP(phone, otp, purpose);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    let user;

    if (purpose === "LOGIN") {
      user = await prisma.user.findUnique({ where: { phone } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    } else {
      user = await prisma.user.create({
        data: {
          phone,
          email: `${phone}@phone.techdrhealth.local`,
          name: name || `User ${phone.slice(-4)}`,
          role: role || "PATIENT",
          passwordHash: "",
          phoneVerified: true,
          isVerified: true,
          authProvider: "phone",
        },
      });
    }

    let mobileSessionToken: string | undefined;
    let mobileSessionExpiresAt: Date | undefined;
    if (client === "mobile") {
      const session = await createMobileSession(user.id, req);
      mobileSessionToken = session.sessionToken;
      mobileSessionExpiresAt = session.expiresAt;
    }

    return NextResponse.json({
      success: true,
      userId: user.id,
      role: user.role,
      name: user.name,
      phone: user.phone,
      mobileSessionToken,
      mobileSessionExpiresAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid request body" }, { status: 400 });
    }
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
