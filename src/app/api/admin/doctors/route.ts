import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PlanType, Prisma } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CONSULTATION_SLOT_MINUTES } from "@/lib/consultation";
import {
  defaultConditionsForSpecialty,
  resolveCanonicalSpecialtyName,
} from "@/lib/doctor-specialty";
import { adminCreateDoctorSchema, formatAdminDoctorSchemaError } from "@/lib/admin-doctor-schema";
import { revalidateDoctorPublicPages } from "@/lib/revalidate-doctors";

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

export async function POST(req: NextRequest) {
  const authResult = await requireAdmin();
  if (authResult.error) return authResult.error;

  try {
    const payload = adminCreateDoctorSchema.parse(await req.json());
    const email = payload.email.toLowerCase();
    const phone = payload.phone.trim();
    const specialty = resolveCanonicalSpecialtyName(payload.specialty);
    const slugBase = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const slug = `dr-${slugBase}-${Date.now().toString().slice(-6)}`;
    const passwordHash = await bcrypt.hash(payload.password, 12);

    const created = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          phone,
          passwordHash,
          role: "DOCTOR",
          name: payload.name,
          isVerified: true,
          emailVerified: true,
          authProvider: "email",
        },
      });

      const profile = await tx.doctorProfile.create({
        data: {
          userId: user.id,
          slug,
          displayName: payload.name,
          specialty,
          subSpecialties: payload.subSpecialties ?? [],
          credentials: payload.credentials,
          medRegNumber: payload.medRegNumber?.trim() || `ADMIN-${user.id.slice(-6)}`,
          experience: payload.experience ?? 0,
          education: payload.education ?? [],
          hospitalAffils: payload.hospitalAffils ?? [],
          bio: payload.bio ?? null,
          languages: payload.languages?.length ? payload.languages : ["English"],
          conditions: defaultConditionsForSpecialty(specialty),
          consultFee: payload.consultFee,
          followUpFee: 0,
          consultDuration: CONSULTATION_SLOT_MINUTES,
          consultTypes: ["VIDEO"],
          approvalStatus: "APPROVED",
          isVisible: payload.isVisible ?? true,
          nmcverified: true,
        },
      });

      await tx.subscription.create({
        data: {
          doctorId: profile.id,
          plan: PlanType.INDIVIDUAL,
          status: "ACTIVE",
          priceINR: 0,
          purchasedAt: new Date(),
          activatedAt: new Date(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });

      return { profileId: profile.id, userId: user.id, slug: profile.slug };
    });

    revalidateDoctorPublicPages(specialty, created.slug);

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: formatAdminDoctorSchemaError(error) }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Email or phone is already registered." }, { status: 409 });
    }
    console.error("admin create doctor error", error);
    return NextResponse.json({ error: "Unable to create doctor." }, { status: 500 });
  }
}
