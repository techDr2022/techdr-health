import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateDoctorInstantConsultSettings } from "@/lib/instant-consult";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "DOCTOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const doctor = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, acceptinstantconsult: true, instantonline: true },
  });
  if (!doctor) {
    return NextResponse.json({ error: "Doctor profile not found." }, { status: 404 });
  }

  return NextResponse.json({
    doctorId: doctor.id,
    acceptInstantConsult: doctor.acceptinstantconsult,
    instantOnline: doctor.instantonline,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "DOCTOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await req.json()) as {
      acceptInstantConsult?: boolean;
      instantOnline?: boolean;
    };

    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!doctor) {
      return NextResponse.json({ error: "Doctor profile not found." }, { status: 404 });
    }

    const updated = await updateDoctorInstantConsultSettings({
      doctorId: doctor.id,
      acceptInstantConsult: body.acceptInstantConsult,
      instantOnline: body.instantOnline,
    });

    return NextResponse.json({
      acceptInstantConsult: updated.acceptinstantconsult,
      instantOnline: updated.instantonline,
    });
  } catch (error) {
    console.error("doctor instant-consult settings error", error);
    return NextResponse.json({ error: "Unable to update instant consult settings." }, { status: 500 });
  }
}
