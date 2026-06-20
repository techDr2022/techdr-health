import { NextRequest, NextResponse } from "next/server";
import { getDoctorSlots } from "@/lib/doctor-slots";
import { parseConsultType } from "@/lib/consult-fee";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const weekStart = req.nextUrl.searchParams.get("weekStart") ?? undefined;
    const consultType = parseConsultType(req.nextUrl.searchParams.get("consultType"));

    const slots = await getDoctorSlots(id, { weekStart, consultType });
    if (!slots) {
      return NextResponse.json({ error: "Doctor not found." }, { status: 404 });
    }

    return NextResponse.json(slots);
  } catch (error) {
    console.error("doctor slots error", error);
    return NextResponse.json({ error: "Unable to load availability." }, { status: 500 });
  }
}
