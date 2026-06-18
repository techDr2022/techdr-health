import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const updateDoctorSchema = z.object({
  isVisible: z.boolean().optional(),
  approvalStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (session.user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin();
  if (authResult.error) return authResult.error;

  try {
    const payload = updateDoctorSchema.parse(await req.json());
    const doctor = await prisma.doctorProfile.update({
      where: { id: params.id },
      data: {
        ...(payload.isVisible !== undefined ? { isVisible: payload.isVisible } : {}),
        ...(payload.approvalStatus ? { approvalStatus: payload.approvalStatus } : {}),
      },
      select: { id: true, isVisible: true, approvalStatus: true },
    });
    return NextResponse.json(doctor);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid doctor update." }, { status: 400 });
    }
    return NextResponse.json({ error: "Unable to update doctor." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin();
  if (authResult.error) return authResult.error;

  try {
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found." }, { status: 404 });
    }

    await prisma.user.delete({ where: { id: doctor.userId } });
    return NextResponse.json({ ok: true, softDeleted: false });
  } catch (error) {
    console.error("admin delete doctor error", error);
    try {
      const doctor = await prisma.doctorProfile.findUnique({
        where: { id: params.id },
        select: { userId: true },
      });
      if (!doctor) {
        return NextResponse.json({ error: "Doctor not found." }, { status: 404 });
      }

      await prisma.$transaction([
        prisma.doctorProfile.update({
          where: { id: params.id },
          data: { isVisible: false, approvalStatus: "REJECTED" },
        }),
        prisma.user.update({
          where: { id: doctor.userId },
          data: { isActive: false },
        }),
      ]);

      return NextResponse.json({
        ok: true,
        softDeleted: true,
        message: "Doctor has related records and was deactivated instead of deleted.",
      });
    } catch {
      return NextResponse.json({ error: "Unable to delete doctor." }, { status: 500 });
    }
  }
}
