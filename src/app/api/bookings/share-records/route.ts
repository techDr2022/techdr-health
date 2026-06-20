import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  bookingId: z.string().min(1),
  recordIds: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "PATIENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { bookingId, recordIds } = parsed.data;

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        patientId: session.user.id,
        issecondopinion: true,
        secondopinionforbookingid: { not: null },
      },
      include: {
        doctor: { select: { userId: true, displayName: true } },
        originalbooking: { include: { soapnote: true } },
      },
    });

    if (!booking?.originalbooking) {
      return NextResponse.json({ error: "Second opinion booking not found." }, { status: 404 });
    }

    const doctorUserId = booking.doctor.userId;
    const records = await prisma.healthrecord.findMany({
      where: {
        userid: session.user.id,
        ...(recordIds?.length ? { id: { in: recordIds } } : {}),
      },
      select: { id: true, sharedwith: true },
    });

    await prisma.$transaction([
      ...records.map((record) =>
        prisma.healthrecord.update({
          where: { id: record.id },
          data: {
            sharedwith: record.sharedwith.includes(doctorUserId)
              ? record.sharedwith
              : { push: doctorUserId },
          },
        })
      ),
      ...(booking.originalbooking.soapnote
        ? [
            prisma.soapnote.update({
              where: { bookingid: booking.originalbooking.id },
              data: {
                sharedwithdoctorids: booking.originalbooking.soapnote.sharedwithdoctorids.includes(
                  doctorUserId
                )
                  ? booking.originalbooking.soapnote.sharedwithdoctorids
                  : { push: doctorUserId },
              },
            }),
          ]
        : []),
      prisma.booking.update({
        where: { id: booking.id },
        data: { secondopinionshareconsent: true },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      sharedRecords: records.length,
      doctorName: booking.doctor.displayName,
      soapShared: Boolean(booking.originalbooking.soapnote),
    });
  } catch (error) {
    console.error("[bookings/share-records]", error);
    return NextResponse.json({ error: "Unable to share records." }, { status: 500 });
  }
}
