import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v) => typeof v === "string");
  return [];
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const doctorId = params.id;
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

    if (!payload.specialty || !payload.credentials || !payload.medRegNumber) {
      return NextResponse.json({ error: "Missing required profile details." }, { status: 400 });
    }

    if (!payload.medRegCertUrl || !payload.degreeDocUrl || !payload.govIdUrl) {
      return NextResponse.json({ error: "Missing required documents." }, { status: 400 });
    }

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
          specialty: String(payload.specialty),
          subSpecialties: parseJsonArray(payload.subSpecialties),
          credentials: String(payload.credentials),
          medRegNumber: String(payload.medRegNumber),
          experience: Number(payload.experience ?? 0),
          hospitalAffils: [payload.clinicName, payload.hospitalName]
            .filter((v): v is string => Boolean(v))
            .map(String),
          languages: parseJsonArray(payload.languages),
          consultFee: Number(payload.consultationFee ?? 500),
          medRegCertUrl: payload.medRegCertUrl ? String(payload.medRegCertUrl) : null,
          degreeDocUrl: payload.degreeDocUrl ? String(payload.degreeDocUrl) : null,
          govIdUrl: payload.govIdUrl ? String(payload.govIdUrl) : null,
          approvalStatus: "APPROVED",
          rejectionReason: null,
          isVisible: profile.subscription?.status === "ACTIVE",
        },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("update application error", error);
    return NextResponse.json({ error: "Unable to update onboarding details." }, { status: 500 });
  }
}
