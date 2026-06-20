import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { joinInstantConsultQueue } from "@/lib/instant-consult";
import { getSpecialtyBySlug } from "@/data/specialties";
import { resolveSpecialtySlug } from "@/lib/doctor-specialty";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "PATIENT") {
    return NextResponse.json({ error: "Only patients can join instant consult." }, { status: 403 });
  }

  try {
    const body = (await req.json()) as { specialtySlug?: string; concern?: string };
    const specialtySlug = resolveSpecialtySlug(String(body.specialtySlug ?? ""));
    if (!getSpecialtyBySlug(specialtySlug)) {
      return NextResponse.json({ error: "Select a valid specialty." }, { status: 400 });
    }

    const result = await joinInstantConsultQueue({
      patientId: session.user.id,
      specialtySlug,
      concern: body.concern,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("instant-consult join error", error);
    return NextResponse.json({ error: "Unable to join instant consult queue." }, { status: 500 });
  }
}
