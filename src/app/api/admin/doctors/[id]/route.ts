import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";
import { adminUpdateDoctorSchema, formatAdminDoctorSchemaError } from "@/lib/admin-doctor-schema";
import { resolveCanonicalSpecialtyName } from "@/lib/doctor-specialty";
import { revalidateDoctorPublicPages } from "@/lib/revalidate-doctors";
import { canApproveDoctorProfile } from "@/lib/nmc-verification";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

const doctorSelect = {
  id: true,
  userId: true,
  slug: true,
  displayName: true,
  photoUrl: true,
  specialty: true,
  subSpecialties: true,
  credentials: true,
  medRegNumber: true,
  nmcverified: true,
  experience: true,
  education: true,
  hospitalAffils: true,
  bio: true,
  languages: true,
  conditions: true,
  consultFee: true,
  followUpFee: true,
  consultDuration: true,
  consultTypes: true,
  approvalStatus: true,
  isVisible: true,
  rejectionReason: true,
  metaTitle: true,
  metaDesc: true,
  user: {
    select: {
      email: true,
      phone: true,
    },
  },
} satisfies Prisma.DoctorProfileSelect;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const authResult = await requireAdmin();
  if (authResult.error) return authResult.error;

  const doctor = await prisma.doctorProfile.findUnique({
    where: { id: id },
    select: doctorSelect,
  });

  if (!doctor) {
    return NextResponse.json({ error: "Doctor not found." }, { status: 404 });
  }

  return NextResponse.json(doctor);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authResult = await requireAdmin();
  if (authResult.error) return authResult.error;

  try {
    const payload = adminUpdateDoctorSchema.parse(await req.json());
    const existing = await prisma.doctorProfile.findUnique({
      where: { id: id },
      select: { id: true, userId: true, medRegNumber: true, nmcverified: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Doctor not found." }, { status: 404 });
    }

    const nextMedRegNumber = payload.medRegNumber?.trim() || existing.medRegNumber;
    const medRegChanged = Boolean(
      payload.medRegNumber?.trim() && payload.medRegNumber.trim() !== existing.medRegNumber
    );

    if (payload.approvalStatus === "APPROVED") {
      const approvalCheck = canApproveDoctorProfile({
        nmcverified: medRegChanged ? false : existing.nmcverified,
        medRegNumber: nextMedRegNumber,
      });
      if (!approvalCheck.ok) {
        return NextResponse.json({ error: approvalCheck.error }, { status: 400 });
      }
    }

    const passwordHash = payload.password ? await bcrypt.hash(payload.password, 12) : undefined;

    const updated = await prisma.$transaction(async (tx) => {
      if (payload.email || payload.phone || payload.password || payload.displayName) {
        await tx.user.update({
          where: { id: existing.userId },
          data: {
            ...(payload.email ? { email: payload.email.toLowerCase() } : {}),
            ...(payload.phone ? { phone: payload.phone.trim() } : {}),
            ...(passwordHash ? { passwordHash } : {}),
            ...(payload.displayName ? { name: payload.displayName.trim() } : {}),
          },
        });
      }

      return tx.doctorProfile.update({
        where: { id: id },
        data: {
          ...(payload.displayName ? { displayName: payload.displayName.trim() } : {}),
          ...(payload.specialty
            ? { specialty: resolveCanonicalSpecialtyName(payload.specialty.trim()) }
            : {}),
          ...(payload.credentials ? { credentials: payload.credentials.trim() } : {}),
          ...(payload.medRegNumber ? { medRegNumber: payload.medRegNumber.trim() } : {}),
          ...(medRegChanged
            ? { nmcverified: false, nmcverifiedat: null, nmcverifiedby: null }
            : {}),
          ...(payload.experience !== undefined ? { experience: payload.experience } : {}),
          ...(payload.bio !== undefined ? { bio: payload.bio?.trim() || null } : {}),
          ...(payload.languages ? { languages: payload.languages.map((v) => v.trim()).filter(Boolean) } : {}),
          ...(payload.subSpecialties
            ? { subSpecialties: payload.subSpecialties.map((v) => v.trim()).filter(Boolean) }
            : {}),
          ...(payload.hospitalAffils
            ? { hospitalAffils: payload.hospitalAffils.map((v) => v.trim()).filter(Boolean) }
            : {}),
          ...(payload.conditions
            ? { conditions: payload.conditions.map((v) => v.trim()).filter(Boolean) }
            : {}),
          ...(payload.education ? { education: payload.education } : {}),
          ...(payload.consultFee !== undefined ? { consultFee: payload.consultFee } : {}),
          ...(payload.followUpFee !== undefined ? { followUpFee: payload.followUpFee } : {}),
          ...(payload.consultDuration !== undefined ? { consultDuration: payload.consultDuration } : {}),
          ...(payload.consultTypes ? { consultTypes: payload.consultTypes } : {}),
          ...(payload.approvalStatus ? { approvalStatus: payload.approvalStatus } : {}),
          ...(payload.isVisible !== undefined ? { isVisible: payload.isVisible } : {}),
          ...(payload.rejectionReason !== undefined
            ? { rejectionReason: payload.rejectionReason?.trim() || null }
            : {}),
          ...(payload.metaTitle !== undefined ? { metaTitle: payload.metaTitle?.trim() || null } : {}),
          ...(payload.metaDesc !== undefined ? { metaDesc: payload.metaDesc?.trim() || null } : {}),
        },
        select: doctorSelect,
      });
    });

    revalidateDoctorPublicPages(updated.specialty, updated.slug);

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: formatAdminDoctorSchemaError(error) },
        { status: 400 }
      );
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Email or phone is already registered." }, { status: 409 });
    }
    console.error("admin update doctor error", error);
    return NextResponse.json({ error: "Unable to update doctor." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authResult = await requireAdmin();
  if (authResult.error) return authResult.error;

  try {
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: id },
      select: { userId: true, slug: true, specialty: true },
    });
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found." }, { status: 404 });
    }

    await prisma.user.delete({ where: { id: doctor.userId } });
    revalidateDoctorPublicPages(doctor.specialty, doctor.slug);
    return NextResponse.json({ ok: true, softDeleted: false });
  } catch (error) {
    console.error("admin delete doctor error", error);
    try {
      const doctor = await prisma.doctorProfile.findUnique({
        where: { id: id },
        select: { userId: true, slug: true, specialty: true },
      });
      if (!doctor) {
        return NextResponse.json({ error: "Doctor not found." }, { status: 404 });
      }

      await prisma.$transaction([
        prisma.doctorProfile.update({
          where: { id: id },
          data: { isVisible: false, approvalStatus: "REJECTED" },
        }),
        prisma.user.update({
          where: { id: doctor.userId },
          data: { isActive: false },
        }),
      ]);

      revalidateDoctorPublicPages(doctor.specialty, doctor.slug);

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
