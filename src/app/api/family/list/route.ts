import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { FamilyMemberRecord } from "@/lib/family-members";

function toClient(record: {
  id: string;
  name: string;
  relation: string;
  dob: Date;
  gender: string;
  createdAt: Date;
}): FamilyMemberRecord {
  return {
    id: record.id,
    name: record.name,
    relation: record.relation,
    dob: record.dob.toISOString().slice(0, 10),
    gender: record.gender,
    createdAt: record.createdAt.toISOString(),
  };
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const members = await prisma.familymember.findMany({
    where: { userid: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ members: members.map(toClient) });
}
