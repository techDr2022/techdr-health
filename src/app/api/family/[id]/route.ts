import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { FAMILY_GENDERS, FAMILY_RELATIONS } from "@/lib/family-members";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  relation: z.enum(FAMILY_RELATIONS),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(FAMILY_GENDERS),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existing = await prisma.familymember.findFirst({
      where: { id: id, userid: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Family member not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid family member details" }, { status: 400 });
    }

    const dob = new Date(`${parsed.data.dob}T00:00:00.000Z`);
    if (Number.isNaN(dob.getTime()) || dob.getTime() > Date.now()) {
      return NextResponse.json({ error: "Invalid date of birth" }, { status: 400 });
    }

    const member = await prisma.familymember.update({
      where: { id: id },
      data: {
        name: parsed.data.name,
        relation: parsed.data.relation,
        dob,
        gender: parsed.data.gender,
      },
    });

    return NextResponse.json({
      member: {
        id: member.id,
        name: member.name,
        relation: member.relation,
        dob: member.dob.toISOString().slice(0, 10),
        gender: member.gender,
        createdAt: member.createdAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "Unable to update family member" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.familymember.findFirst({
    where: { id: id, userid: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Family member not found" }, { status: 404 });
  }

  const activeBooking = await prisma.booking.findFirst({
    where: {
      familymemberid: id,
      status: { in: ["UPCOMING", "ONGOING"] },
    },
    select: { id: true },
  });
  if (activeBooking) {
    return NextResponse.json(
      { error: "Cannot remove a family member with an active consultation booking." },
      { status: 409 }
    );
  }

  await prisma.familymember.delete({ where: { id: id } });
  return NextResponse.json({ ok: true });
}
