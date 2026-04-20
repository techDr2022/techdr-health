import bcrypt from "bcryptjs";
import { addMinutes, isAfter } from "date-fns";
import { prisma } from "@/lib/prisma";

export type OtpPurpose = "LOGIN" | "REGISTER" | "RESET";

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function saveOTP(phone: string, purpose: OtpPurpose): Promise<string> {
  const otp = generateOTP();
  const hash = await bcrypt.hash(otp, 10);
  const expiresAt = addMinutes(new Date(), parseInt(process.env.OTP_EXPIRY_MINUTES || "10", 10));

  await prisma.otpRecord.updateMany({
    where: { phone, purpose, isUsed: false },
    data: { isUsed: true },
  });

  await prisma.otpRecord.create({
    data: { phone, otp: hash, purpose, expiresAt },
  });

  return otp;
}

export async function verifyOTP(
  phone: string,
  enteredOTP: string,
  purpose: OtpPurpose
): Promise<{ success: boolean; error?: string }> {
  const record = await prisma.otpRecord.findFirst({
    where: { phone, purpose, isUsed: false },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return { success: false, error: "OTP not found. Please request a new one." };
  if (isAfter(new Date(), record.expiresAt)) return { success: false, error: "OTP has expired. Please request a new one." };
  if (record.attempts >= 3) return { success: false, error: "Too many attempts. Please request a new OTP." };

  await prisma.otpRecord.update({
    where: { id: record.id },
    data: { attempts: { increment: 1 } },
  });

  const isMatch = await bcrypt.compare(enteredOTP, record.otp);
  if (!isMatch) {
    const attemptsLeft = Math.max(0, 2 - record.attempts);
    return {
      success: false,
      error: `Incorrect OTP. ${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} remaining.`,
    };
  }

  await prisma.otpRecord.update({
    where: { id: record.id },
    data: { isUsed: true },
  });

  return { success: true };
}
