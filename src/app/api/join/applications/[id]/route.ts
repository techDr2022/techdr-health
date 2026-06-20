import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  defaultConditionsForSpecialty,
  resolveCanonicalSpecialtyName,
} from "@/lib/doctor-specialty";
import { revalidateDoctorPublicPages } from "@/lib/revalidate-doctors";

export const dynamic = "force-dynamic";

function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v) => typeof v === "string");
  return [];
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const doctorId = id;
    const payload = await req.json();

    if (!doctorId) {
      return NextResponse.json({ error: "Application id is required." }, { status: 400 });
    }

    const profile = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
      include: { user: true, subscription: { select: { status: true } } },
    });

    if (!profile) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    const email = String(payload.email ?? "").toLowerCase().trim();
    const phone = String(payload.phone ?? "").trim();
    const entityName = String(payload.entityName ?? "").trim();

    if (!email || !phone || !entityName) {
      return NextResponse.json({ error: "Missing required account details." }, { status: 400 });
    }

    if (!payload.specialty || !payload.credentials) {
      return NextResponse.json({ error: "Missing required profile details." }, { status: 400 });
    }

    if (!payload.medRegCertUrl || !payload.govIdUrl || !payload.profilePhotoUrl) {
      return NextResponse.json({ error: "Missing required documents." }, { status: 400 });
    }

    const specialty = resolveCanonicalSpecialtyName(String(payload.specialty));
    const medRegNumberRaw = payload.medRegNumber
      ? String(payload.medRegNumber).trim()
      : profile.medRegNumber || `PENDING-${profile.userId.slice(-6)}`;

    await prisma.$transaction(async (tx) => {
      const nextUserData: {
        name: string;
        email: string;
        phone: string;
        passwordHash?: string;
      } = {
        name: entityName,
        email,
        phone,
      };

      const password = String(payload.password ?? "");
      if (password) {
        nextUserData.passwordHash = await bcrypt.hash(password, 10);
      }

      await tx.user.update({
        where: { id: profile.userId },
        data: nextUserData,
      });

      await tx.doctorProfile.update({
        where: { id: doctorId },
        data: {
          displayName: entityName,
          photoUrl: payload.profilePhotoUrl ? String(payload.profilePhotoUrl) : null,
          specialty,
          subSpecialties: parseJsonArray(payload.subSpecialties),
          credentials: String(payload.credentials),
          medRegNumber: medRegNumberRaw,
          experience: Number(payload.experience ?? 0),
          hospitalAffils: [payload.clinicName, payload.hospitalName]
            .filter((v): v is string => Boolean(v))
            .map(String),
          languages: parseJsonArray(payload.languages),
          conditions:
            profile.conditions.length > 0
              ? profile.conditions
              : defaultConditionsForSpecialty(specialty),
          consultFee: Number(payload.consultationFee ?? 500),
          medRegCertUrl: payload.medRegCertUrl ? String(payload.medRegCertUrl) : null,
          degreeDocUrl: payload.degreeDocUrl ? String(payload.degreeDocUrl) : null,
          govIdUrl: payload.govIdUrl ? String(payload.govIdUrl) : null,
          approvalStatus: "PENDING",
          rejectionReason: null,
          isVisible: false,
          ...(medRegNumberRaw !== profile.medRegNumber
            ? { nmcverified: false, nmcverifiedat: null, nmcverifiedby: null }
            : {}),
        },
      });
    });

    revalidateDoctorPublicPages(specialty, profile.slug);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("update application error", error);
    return NextResponse.json({ error: "Unable to update onboarding details." }, { status: 500 });
  }
}
