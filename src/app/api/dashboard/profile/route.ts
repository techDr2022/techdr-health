import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function isValidPhotoUrl(value: string) {
  if (!value) return true;
  if (value.startsWith("/api/storage/r2-object")) return true;
  if (value.startsWith("profile-photos/")) return true;
  if (value.startsWith("onboarding-docs/") && /\/profile-photo-/.test(value)) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(120),
  specialty: z.string().min(2).max(120),
  languages: z.array(z.string().min(1)).max(20),
  photoUrl: z
    .string()
    .trim()
    .refine(isValidPhotoUrl, "Photo URL must be a valid URL."),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "DOCTOR") {
    return NextResponse.json({ error: "Only doctors can update this profile." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid profile data." }, { status: 400 });
    }

    const data = parsed.data;
    const updated = await prisma.$transaction(async (tx) => {
      const doctor = await tx.doctorProfile.update({
        where: { userId: session.user!.id },
        data: {
          displayName: data.displayName.trim(),
          specialty: data.specialty.trim(),
          languages: data.languages.map((value) => value.trim()).filter(Boolean),
          photoUrl: data.photoUrl.trim() ? data.photoUrl.trim() : null,
        },
        select: {
          displayName: true,
          specialty: true,
          languages: true,
          photoUrl: true,
        },
      });

      await tx.user.update({
        where: { id: session.user!.id },
        data: {
          name: doctor.displayName,
          avatarUrl: doctor.photoUrl,
        },
      });

      return doctor;
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("update doctor profile error", error);
    return NextResponse.json({ error: "Unable to update profile." }, { status: 500 });
  }
}
