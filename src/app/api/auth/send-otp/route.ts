import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { saveOTP } from "@/lib/otp";
import { sendOTPviaSMS } from "@/lib/sms";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  purpose: z.enum(["LOGIN", "REGISTER", "RESET"]),
  role: z.enum(["PATIENT", "DOCTOR"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const limited = await rateLimit(`otp:${ip}`, 3, 600);
    if (limited) {
      return NextResponse.json(
        { error: "Too many requests. Please wait 10 minutes before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { phone, purpose } = schema.parse(body);

    if (purpose === "LOGIN") {
      const user = await prisma.user.findUnique({ where: { phone } });
      if (!user) {
        return NextResponse.json(
          { error: "No account found with this number. Please register first." },
          { status: 404 }
        );
      }
    }

    if (purpose === "REGISTER") {
      const existing = await prisma.user.findUnique({ where: { phone } });
      if (existing) {
        return NextResponse.json(
          { error: "This number is already registered. Please log in instead." },
          { status: 409 }
        );
      }
    }

    if (purpose === "RESET") {
      const user = await prisma.user.findUnique({ where: { phone } });
      if (!user) {
        return NextResponse.json(
          { error: "No account found with this number." },
          { status: 404 }
        );
      }
    }

    const otp = await saveOTP(phone, purpose);
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV] OTP for ${phone}: ${otp}`);
      return NextResponse.json({ success: true, devOtp: otp });
    }

    const sent = await sendOTPviaSMS(phone, otp);
    if (!sent) {
      const hasMsg91Creds = Boolean(process.env.MSG91_AUTH_KEY && process.env.MSG91_TEMPLATE_ID);
      const hasTwilioCreds = Boolean(
        process.env.TWILIO_ACCOUNT_SID &&
          process.env.TWILIO_AUTH_TOKEN &&
          process.env.TWILIO_PHONE_NUMBER
      );
      const credsConfigured = hasMsg91Creds || hasTwilioCreds;

      return NextResponse.json(
        {
          error: credsConfigured
            ? "Failed to send OTP. Please try again."
            : "SMS provider is not configured. Add MSG91/Twilio credentials in environment variables.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid request body" }, { status: 400 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
