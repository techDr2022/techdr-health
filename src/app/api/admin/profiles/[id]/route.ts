import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  name: z.string().min(2),
  role: z.enum(["ADMIN", "DOCTOR", "PATIENT"]),
  isActive: z.boolean(),
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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin();
  if (authResult.error) return authResult.error;

  try {
    const payload = updateSchema.parse(await request.json());
    const updated = await prisma.user.update({
      where: { id: params.id },
      data: {
        name: payload.name,
        role: payload.role,
        isActive: payload.isActive,
      },
      select: { id: true },
    });
    return NextResponse.json({ ok: true, id: updated.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid profile update payload." }, { status: 400 });
    }
    return NextResponse.json({ error: "Unable to update profile." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin();
  if (authResult.error) return authResult.error;
  if (authResult.session.user.id === params.id) {
    return NextResponse.json({ error: "Cannot delete your own profile." }, { status: 400 });
  }

  try {
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true, softDeleted: false });
  } catch {
    await prisma.user.update({
      where: { id: params.id },
      data: { isActive: false },
    });
    return NextResponse.json({ ok: true, softDeleted: true });
  }
}
