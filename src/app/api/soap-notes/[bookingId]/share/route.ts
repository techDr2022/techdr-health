import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { resolveSoapNoteAccess, toSoapNoteClient } from "@/lib/soap-notes";

const bodySchema = z.object({
  share: z.boolean(),
  joinToken: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params;

  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { share, joinToken } = parsed.data;
    const access = await resolveSoapNoteAccess(bookingId, joinToken);
    if (!access) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (!access.isDoctor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!access.record?.finalized) {
      return NextResponse.json({ error: "Finalize the note before sharing" }, { status: 400 });
    }

    const record = await prisma.soapnote.update({
      where: { bookingid: bookingId },
      data: {
        patientshared: share,
        sharedat: share ? new Date() : null,
      },
    });

    return NextResponse.json({ note: toSoapNoteClient(record) });
  } catch {
    return NextResponse.json({ error: "Unable to update sharing" }, { status: 500 });
  }
}
