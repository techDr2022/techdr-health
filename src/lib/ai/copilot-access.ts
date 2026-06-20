import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type CopilotDoctorContext = {
  doctorUserId: string;
  bookingId: string | null;
};

export async function requireDoctorCopilotAccess(bookingId?: string | null) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (session.user.role !== "DOCTOR") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  if (bookingId?.trim()) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId.trim() },
      select: { doctor: { select: { userId: true } } },
    });
    if (!booking) {
      return { error: NextResponse.json({ error: "Booking not found" }, { status: 404 }) };
    }
    if (booking.doctor.userId !== session.user.id) {
      return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }
  }

  return {
    context: {
      doctorUserId: session.user.id,
      bookingId: bookingId?.trim() || null,
    } satisfies CopilotDoctorContext,
  };
}
