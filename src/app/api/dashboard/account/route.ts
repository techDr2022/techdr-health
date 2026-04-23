import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const deleteAccountSchema = z.object({
  confirmationText: z.string(),
  password: z.string().optional(),
});

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = deleteAccountSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const { confirmationText, password } = parsed.data;
    if (confirmationText.trim().toUpperCase() !== "DELETE") {
      return NextResponse.json(
        { error: "Type DELETE to confirm account deletion." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        phone: true,
        passwordHash: true,
        role: true,
        doctorProfile: { select: { id: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (user.passwordHash) {
      if (!password) {
        return NextResponse.json({ error: "Password is required." }, { status: 400 });
      }
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: "Incorrect password." }, { status: 400 });
      }
    }

    const doctorId = user.doctorProfile?.id ?? null;
    const bookingWhere = doctorId
      ? {
          OR: [{ patientId: user.id }, { doctorId }],
        }
      : { patientId: user.id };

    const bookings = await prisma.booking.findMany({
      where: bookingWhere,
      select: { id: true },
    });
    const bookingIds = bookings.map((item) => item.id);

    await prisma.$transaction(async (tx) => {
      if (bookingIds.length) {
        await tx.review.deleteMany({ where: { bookingId: { in: bookingIds } } });
        await tx.platformEarning.deleteMany({ where: { bookingId: { in: bookingIds } } });
        await tx.consultationRoom.deleteMany({ where: { bookingId: { in: bookingIds } } });
        await tx.prescription.deleteMany({ where: { bookingId: { in: bookingIds } } });
        await tx.booking.deleteMany({ where: { id: { in: bookingIds } } });
      }

      if (doctorId) {
        await tx.subscription.deleteMany({ where: { doctorId } });
        await tx.timeSlot.deleteMany({ where: { timing: { doctorId } } });
        await tx.doctorTiming.deleteMany({ where: { doctorId } });
        await tx.review.deleteMany({ where: { doctorId } });
        await tx.doctorProfile.deleteMany({ where: { id: doctorId } });
      }

      await tx.authSession.deleteMany({ where: { userId: user.id } });
      await tx.session.deleteMany({ where: { userId: user.id } });
      if (user.phone) {
        await tx.otpRecord.deleteMany({ where: { phone: user.phone } });
      }
      await tx.user.delete({ where: { id: user.id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("delete account error", error);
    return NextResponse.json({ error: "Unable to delete account." }, { status: 500 });
  }
}
