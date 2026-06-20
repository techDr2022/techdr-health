import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { resolveSoapNoteAccess, toSoapNoteClient } from "@/lib/soap-notes";

const bodySchema = z.object({
  joinToken: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params;

  try {
    const json = await req.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(json);
    const joinToken = parsed.success ? parsed.data.joinToken : undefined;

    const access = await resolveSoapNoteAccess(bookingId, joinToken);
    if (!access) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (!access.isDoctor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!access.record) {
      return NextResponse.json({ error: "No SOAP note to finalize" }, { status: 400 });
    }
    if (access.record.finalized) {
      return NextResponse.json({ note: toSoapNoteClient(access.record) });
    }

    const record = await prisma.soapnote.update({
      where: { bookingid: bookingId },
      data: {
        finalized: true,
        finalizedat: new Date(),
      },
    });

    const client = toSoapNoteClient(record);
    return NextResponse.json({ note: client });
  } catch {
    return NextResponse.json({ error: "Unable to finalize SOAP note" }, { status: 500 });
  }
}
