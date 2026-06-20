import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { registerDeviceTokenFromRequest } from "@/lib/device-token";
import { getBookingBeneficiaryName } from "@/lib/family-members";
import { requireMobileSession } from "@/lib/mobile-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const postSchema = z.object({
  fcmToken: z.string().min(1).optional(),
  platform: z.enum(["ios", "android"]).optional(),
});

function mapBooking(booking: {
  id: string;
  status: string;
  payStatus: string;
  scheduledAt: Date;
  endsAt: Date;
  totalPatientPays: number;
  consultType: string;
  patient: { id: string; name: string; phone: string | null };
  doctor: {
    id: string;
    slug: string;
    displayName: string;
    specialty: string;
    userId: string;
  };
  familymember?: { name: string } | null;
}) {
  return {
    id: booking.id,
    status: booking.status,
    payStatus: booking.payStatus,
    scheduledAt: booking.scheduledAt,
    endsAt: booking.endsAt,
    totalPatientPays: booking.totalPatientPays,
    consultType: booking.consultType,
    beneficiaryName: getBookingBeneficiaryName(booking),
    patient: booking.patient,
    doctor: booking.doctor,
  };
}

async function buildBootstrapPayload(
  user: NonNullable<Awaited<ReturnType<typeof requireMobileSession>>>["user"]
) {
  const now = new Date();
  const isDoctor = user.role === "DOCTOR" && user.doctorProfile;

  const bookings = await prisma.booking.findMany({
    where: isDoctor ? { doctorId: user.doctorProfile!.id } : { patientId: user.id },
    orderBy: [{ scheduledAt: "asc" }],
    take: 40,
    include: {
      patient: { select: { id: true, name: true, phone: true } },
      doctor: {
        select: { id: true, slug: true, displayName: true, specialty: true, userId: true },
      },
      familymember: { select: { name: true } },
    },
  });

  const activeBookings = bookings
    .filter((booking) => booking.status === "UPCOMING" || booking.status === "ONGOING")
    .map(mapBooking);

  const upcomingSlots = bookings
    .filter(
      (booking) =>
        booking.status === "UPCOMING" &&
        booking.payStatus === "CAPTURED" &&
        booking.scheduledAt.getTime() >= now.getTime()
    )
    .slice(0, 8)
    .map(mapBooking);

  const unreadNotifications = isDoctor
    ? 0
    : await prisma.healthNudge.count({
        where: { patientId: user.id, opened: false },
      });

  return {
    user: {
      id: user.id,
      role: user.role,
      name: user.name,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
    },
    doctorProfile: user.doctorProfile,
    activeBookings,
    upcomingSlots,
    unreadNotifications,
    bookings: activeBookings,
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireMobileSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(await buildBootstrapPayload(session.user));
  } catch (error) {
    console.error("mobile bootstrap error", error);
    return NextResponse.json({ error: "Unable to load mobile dashboard." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireMobileSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json().catch(() => ({}));
    const parsed = postSchema.safeParse(json);
    if (parsed.success && parsed.data.fcmToken && parsed.data.platform) {
      await registerDeviceTokenFromRequest(session.user.id, req, {
        fcmToken: parsed.data.fcmToken,
        platform: parsed.data.platform,
      });
    } else {
      await registerDeviceTokenFromRequest(session.user.id, req);
    }

    return NextResponse.json(await buildBootstrapPayload(session.user));
  } catch (error) {
    console.error("mobile bootstrap error", error);
    return NextResponse.json({ error: "Unable to load mobile dashboard." }, { status: 500 });
  }
}
