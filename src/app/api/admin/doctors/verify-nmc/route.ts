import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { revalidateDoctorPublicPages } from "@/lib/revalidate-doctors";
import {
  isPlaceholderMedRegNumber,
  isValidNmcRegNumberFormat,
} from "@/lib/nmc-verification";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  doctorId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { doctorId } = bodySchema.parse(body);

    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
      select: {
        id: true,
        slug: true,
        specialty: true,
        displayName: true,
        medRegNumber: true,
        nmcverified: true,
      },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found." }, { status: 404 });
    }

    if (isPlaceholderMedRegNumber(doctor.medRegNumber)) {
      return NextResponse.json(
        { error: "Enter a valid NMC registration number before marking as verified." },
        { status: 400 }
      );
    }

    if (!isValidNmcRegNumberFormat(doctor.medRegNumber)) {
      return NextResponse.json(
        { error: "NMC registration number format is invalid." },
        { status: 400 }
      );
    }

    const updated = await prisma.doctorProfile.update({
      where: { id: doctorId },
      data: {
        nmcverified: true,
        nmcverifiedat: new Date(),
        nmcverifiedby: session.user.id,
      },
      select: {
        id: true,
        nmcverified: true,
        nmcverifiedat: true,
        medRegNumber: true,
      },
    });

    revalidateDoctorPublicPages(doctor.specialty, doctor.slug);

    return NextResponse.json({
      success: true,
      doctorId: updated.id,
      nmcVerified: updated.nmcverified,
      nmcVerifiedAt: updated.nmcverifiedat?.toISOString() ?? null,
      medRegNumber: updated.medRegNumber,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }
    console.error("verify-nmc error", error);
    return NextResponse.json({ error: "Unable to verify NMC registration." }, { status: 500 });
  }
}
