import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadDoctorProfilePhotoToR2 } from "@/lib/doctor-profile-photo-upload";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin();
  if (authResult.error) return authResult.error;

  try {
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: params.id },
      select: { id: true, userId: true },
    });
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found." }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("photo");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Photo file is required." }, { status: 400 });
    }

    const uploaded = await uploadDoctorProfilePhotoToR2(file, doctor.userId);

    await prisma.$transaction([
      prisma.doctorProfile.update({
        where: { id: doctor.id },
        data: { photoUrl: uploaded.key },
      }),
      prisma.user.update({
        where: { id: doctor.userId },
        data: { avatarUrl: uploaded.key },
      }),
    ]);

    return NextResponse.json({
      photoUrl: uploaded.key,
      url: uploaded.url,
    });
  } catch (error) {
    if (error instanceof Error && error.message) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("admin upload doctor photo error", error);
    return NextResponse.json({ error: "Unable to upload photo." }, { status: 500 });
  }
}
