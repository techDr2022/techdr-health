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

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid family member details" }, { status: 400 });
    }

    const dob = new Date(`${parsed.data.dob}T00:00:00.000Z`);
    if (Number.isNaN(dob.getTime()) || dob.getTime() > Date.now()) {
      return NextResponse.json({ error: "Invalid date of birth" }, { status: 400 });
    }

    const member = await prisma.familymember.create({
      data: {
        userid: session.user.id,
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
    return NextResponse.json({ error: "Unable to add family member" }, { status: 500 });
  }
}
