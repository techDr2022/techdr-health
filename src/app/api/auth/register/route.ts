import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
  role: z.enum(["PATIENT", "DOCTOR"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone, role } = schema.parse(body);

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, ...(phone ? [{ phone }] : [])] },
    });

    if (existing) {
      return NextResponse.json(
        { error: existing.email === email ? "Email already registered" : "Phone already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role,
        authProvider: "email",
      },
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid request body" }, { status: 400 });
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
