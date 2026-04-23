import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PlanType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { FREE_LISTING_LIMIT, SUBSCRIPTION_PLANS } from "@/lib/plans";

function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v) => typeof v === "string");
  return [];
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    if (!payload.email || !payload.password || !payload.phone || !payload.entityName) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const normalizedPlan = String(payload.planType ?? "INDIVIDUAL").toUpperCase();
    if (!["INDIVIDUAL", "CLINIC", "HOSPITAL"].includes(normalizedPlan)) {
      return NextResponse.json({ error: "Invalid plan type." }, { status: 400 });
    }

    const email = String(payload.email).toLowerCase().trim();
    const phone = String(payload.phone).trim();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email is already registered." }, { status: 409 });
    }

    const existingPhone = await prisma.user.findUnique({ where: { phone } });
    if (existingPhone) {
      return NextResponse.json({ error: "Phone number is already registered." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(String(payload.password), 10);
    const entityName = String(payload.entityName).trim();
    const slugBase = entityName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const slug = `dr-${slugBase}-${Date.now().toString().slice(-6)}`;

    const created = await prisma.$transaction(async (tx) => {
      const freeSlotsClaimed = await tx.subscription.count({
        where: { priceINR: 0, status: "ACTIVE" },
      });
      const isFreeListingGranted = freeSlotsClaimed < FREE_LISTING_LIMIT;

      const user = await tx.user.create({
        data: {
          email,
          phone,
          passwordHash: hashedPassword,
          role: "DOCTOR",
          name: entityName,
          isVerified: false,
          authProvider: "email",
        },
      });

      const profile = await tx.doctorProfile.create({
        data: {
          userId: user.id,
          slug,
          displayName: entityName,
          photoUrl: payload.profilePhotoUrl ? String(payload.profilePhotoUrl) : null,
          specialty: payload.specialty ? String(payload.specialty) : "General Medicine",
          subSpecialties: parseJsonArray(payload.subSpecialties),
          credentials: payload.credentials ? String(payload.credentials) : "MBBS",
          medRegNumber: payload.medRegNumber ? String(payload.medRegNumber) : `PENDING-${user.id.slice(-6)}`,
          experience: payload.experience ? Number(payload.experience) : 0,
          education: payload.education && typeof payload.education === "object" ? payload.education : [],
          hospitalAffils: [payload.clinicName, payload.hospitalName].filter((v): v is string => Boolean(v)).map(String),
          bio: payload.bio ? String(payload.bio) : null,
          languages: parseJsonArray(payload.languages),
          conditions: [],
          consultFee: payload.consultationFee ? Number(payload.consultationFee) : 500,
          followUpFee: payload.followUpFee ? Number(payload.followUpFee) : 0,
          consultDuration: payload.consultDuration ? Number(payload.consultDuration) : 15,
          consultTypes: ["VIDEO"],
          approvalStatus: "APPROVED",
          isVisible: false,
          medRegCertUrl: payload.medRegCertUrl ? String(payload.medRegCertUrl) : null,
          degreeDocUrl: payload.degreeDocUrl ? String(payload.degreeDocUrl) : null,
          govIdUrl: payload.govIdUrl ? String(payload.govIdUrl) : null,
        },
        select: { id: true, displayName: true, approvalStatus: true },
      });

      await tx.subscription.create({
        data: {
          doctorId: profile.id,
          plan: normalizedPlan as PlanType,
          status: isFreeListingGranted ? "ACTIVE" : "PENDING_PAYMENT",
          priceINR: isFreeListingGranted ? 0 : SUBSCRIPTION_PLANS[normalizedPlan as keyof typeof SUBSCRIPTION_PLANS].price,
          purchasedAt: isFreeListingGranted ? new Date() : null,
          activatedAt: isFreeListingGranted ? new Date() : null,
          expiresAt: isFreeListingGranted ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null,
        },
      });

      return { profile, userEmail: user.email, isFreeListingGranted, freeSlotsClaimed };
    });

    return NextResponse.json(
      {
        id: created.profile.id,
        email: created.userEmail,
        status: created.profile.approvalStatus,
        isFreeListingGranted: created.isFreeListingGranted,
        freeSlotsRemaining: Math.max(FREE_LISTING_LIMIT - (created.freeSlotsClaimed + (created.isFreeListingGranted ? 1 : 0)), 0),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("create application error", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const targets = Array.isArray(error.meta?.target)
        ? error.meta.target.map((value) => String(value))
        : [];

      if (targets.includes("email")) {
        return NextResponse.json({ error: "Email is already registered." }, { status: 409 });
      }
      if (targets.includes("phone")) {
        return NextResponse.json({ error: "Phone number is already registered." }, { status: 409 });
      }

      return NextResponse.json({ error: "Duplicate data found. Please check your details." }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return NextResponse.json(
        { error: "Database is not initialized. Run Prisma migrations (or prisma db push) and try again." },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Unable to create application." },
      { status: 500 }
    );
  }
}
