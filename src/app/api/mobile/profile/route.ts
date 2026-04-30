import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireMobileSession } from "@/lib/mobile-session";

const schema = z.object({
  name: z.string().min(2).max(120).optional(),
  avatarUrl: z.string().trim().url().or(z.literal("")).optional(),
  displayName: z.string().min(2).max(120).optional(),
  specialty: z.string().min(2).max(120).optional(),
  languages: z.array(z.string().min(1)).max(20).optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireMobileSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = schema.parse(await req.json());
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { doctorProfile: { select: { id: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          ...(payload.name ? { name: payload.name.trim() } : {}),
          ...(payload.avatarUrl !== undefined
            ? { avatarUrl: payload.avatarUrl.trim() ? payload.avatarUrl.trim() : null }
            : {}),
        },
        select: { id: true, name: true, avatarUrl: true, role: true },
      });

      let doctorProfile = null;
      if (
        updatedUser.role === "DOCTOR" &&
        user.doctorProfile &&
        (payload.displayName || payload.specialty || payload.languages)
      ) {
        doctorProfile = await tx.doctorProfile.update({
          where: { userId: user.id },
          data: {
            ...(payload.displayName ? { displayName: payload.displayName.trim() } : {}),
            ...(payload.specialty ? { specialty: payload.specialty.trim() } : {}),
            ...(payload.languages
              ? { languages: payload.languages.map((value) => value.trim()).filter(Boolean) }
              : {}),
          },
          select: {
            displayName: true,
            specialty: true,
            languages: true,
            photoUrl: true,
          },
        });
      }

      return { user: updatedUser, doctorProfile };
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid profile input." }, { status: 400 });
    }
    console.error("mobile profile update error", error);
    return NextResponse.json({ error: "Unable to update profile." }, { status: 500 });
  }
}
