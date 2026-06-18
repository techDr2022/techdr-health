import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PlanType, Prisma } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CONSULTATION_SLOT_MINUTES } from "@/lib/consultation";

export const dynamic = "force-dynamic";

const createDoctorSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().min(10).max(15),
  password: z.string().min(6).max(120),
  specialty: z.string().trim().min(2).max(120),
  credentials: z.string().trim().min(2).max(120),
  consultFee: z.number().int().min(0).max(100000),
  isVisible: z.boolean().optional(),
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

export async function POST(req: NextRequest) {
  const authResult = await requireAdmin();
  if (authResult.error) return authResult.error;

  try {
    const payload = createDoctorSchema.parse(await req.json());
    const email = payload.email.toLowerCase();
    const phone = payload.phone.trim();
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
          specialty: payload.specialty,
          subSpecialties: [],
          credentials: payload.credentials,
          medRegNumber: `ADMIN-${user.id.slice(-6)}`,
          experience: 0,
          education: [],
          hospitalAffils: [],
          languages: ["English"],
          conditions: [],
          consultFee: payload.consultFee,
          followUpFee: 0,
          consultDuration: CONSULTATION_SLOT_MINUTES,
          consultTypes: ["VIDEO"],
          approvalStatus: "APPROVED",
          isVisible: payload.isVisible ?? true,
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

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid doctor data." }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Email or phone is already registered." }, { status: 409 });
    }
    console.error("admin create doctor error", error);
    return NextResponse.json({ error: "Unable to create doctor." }, { status: 500 });
  }
}
