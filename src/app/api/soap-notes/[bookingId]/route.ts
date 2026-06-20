import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  encryptSoapFields,
  resolveSoapNoteAccess,
  toSoapNoteClient,
} from "@/lib/soap-notes";

const updateSchema = z.object({
  subjective: z.string(),
  objective: z.string(),
  assessment: z.string(),
  plan: z.string(),
  joinToken: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params;

  const joinToken = req.nextUrl.searchParams.get("joinToken");
  const access = await resolveSoapNoteAccess(bookingId, joinToken);
  if (!access) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (!access.canRead) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!access.record) {
    return NextResponse.json({ note: null });
  }
  return NextResponse.json({ note: toSoapNoteClient(access.record) });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params;
  try {
    const json = await req.json();
    const parsed = updateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { joinToken, ...content } = parsed.data;
    const access = await resolveSoapNoteAccess(bookingId, joinToken);
    if (!access) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (!access.canEdit) {
      return NextResponse.json(
        { error: access.record?.finalized ? "Note is finalized" : "Unauthorized" },
        { status: access.record?.finalized ? 409 : 401 }
      );
    }

    const encrypted = encryptSoapFields(content);
    const record = await prisma.soapnote.upsert({
      where: { bookingid: bookingId },
      update: encrypted,
      create: {
        bookingid: bookingId,
        ...encrypted,
      },
    });

    return NextResponse.json({ note: toSoapNoteClient(record) });
  } catch {
    return NextResponse.json({ error: "Unable to save SOAP note" }, { status: 500 });
  }
}
