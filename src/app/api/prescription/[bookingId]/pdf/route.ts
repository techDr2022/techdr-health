import { Readable } from "node:stream";
import { GetObjectCommand, NoSuchKey } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getR2Client, getR2Config } from "@/lib/r2";

function toWebStream(body: unknown): ReadableStream<Uint8Array> | null {
  if (!body || typeof body !== "object") return null;
  if ("transformToWebStream" in body && typeof body.transformToWebStream === "function") {
    return body.transformToWebStream() as ReadableStream<Uint8Array>;
  }
  if (body instanceof Readable) {
    return Readable.toWeb(body) as ReadableStream<Uint8Array>;
  }
  return null;
}

export async function GET(
  _req: Request,
  { params }: { params: { bookingId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.bookingId },
      include: { doctor: true, prescriptionRecord: true },
    });
    if (!booking || !booking.prescriptionRecord?.pdfUrl) {
      return NextResponse.json({ error: "Prescription PDF not found" }, { status: 404 });
    }

    const isPatient = booking.patientId === session.user.id;
    const isDoctor = booking.doctor.userId === session.user.id;
    if (!isPatient && !isDoctor && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const key = booking.prescriptionRecord.pdfUrl.replace(/^\/+/, "");
    if (!key.startsWith("prescriptions/")) {
      return NextResponse.json({ error: "Invalid file key" }, { status: 400 });
    }

    const object = await getR2Client().send(
      new GetObjectCommand({
        Bucket: getR2Config().bucketName,
        Key: key,
      })
    );
    const stream = toWebStream(object.Body);
    if (!stream) {
      return NextResponse.json({ error: "Unable to read file stream" }, { status: 500 });
    }

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="prescription-${params.bookingId}.pdf"`,
        "Cache-Control": "private, max-age=0, no-cache",
      },
    });
  } catch (error) {
    if (error instanceof NoSuchKey) {
      return NextResponse.json({ error: "Prescription PDF not found" }, { status: 404 });
    }
    console.error("[prescription/pdf]", error);
    return NextResponse.json({ error: "Unable to fetch prescription PDF" }, { status: 500 });
  }
}
