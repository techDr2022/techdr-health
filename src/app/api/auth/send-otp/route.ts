import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { saveOTP } from "@/lib/otp";
import { sendMagicLoginEmail, sendOtpEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

const schema = z
  .object({
    channel: z.enum(["email"]).optional().default("email"),
    email: z.string().trim().toLowerCase().email("Enter a valid email address").optional(),
    purpose: z.enum(["LOGIN", "RESET"]),
    method: z.enum(["otp", "magic_link"]).optional().default("otp"),
  })
  .superRefine((data, ctx) => {
    if (data.channel === "email" && !data.email) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["email"], message: "Email is required for email OTP." });
    }
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
    const { email, purpose, method } = schema.parse(body);
    const identifier = email as string;

    if (purpose === "LOGIN") {
      const user = await prisma.user.findUnique({
        where: { email: identifier },
      });
      if (!user) {
        return NextResponse.json({ error: "No account found with this email." }, { status: 404 });
      }
    }

    if (purpose === "RESET") {
      if (method === "magic_link") {
        return NextResponse.json({ error: "Magic link is only available for login." }, { status: 400 });
      }
      const user = await prisma.user.findUnique({
        where: { email: identifier },
      });
      if (!user) {
        return NextResponse.json({ error: "No account found with this email." }, { status: 404 });
      }
    }

    const otp = await saveOTP(identifier, purpose);
    const baseUrl =
      process.env.AUTH_URL ||
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      req.nextUrl.origin;
    const magicLink = `${baseUrl.replace(/\/$/, "")}/login?mode=magic&email=${encodeURIComponent(identifier)}&otp=${encodeURIComponent(otp)}`;

    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV] OTP for ${identifier}: ${otp}`);
      return NextResponse.json({ success: true, devOtp: otp, magicLink: method === "magic_link" ? magicLink : undefined });
    }

    if (method === "magic_link") {
      await sendMagicLoginEmail(identifier, magicLink);
      return NextResponse.json({ success: true });
    }

    await sendOtpEmail(identifier, otp);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid request body" }, { status: 400 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
