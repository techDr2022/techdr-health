import { Readable } from "node:stream";
import { GetObjectCommand, NoSuchKey } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { canAccessHealthRecord } from "@/lib/health-records";
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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const record = await prisma.healthrecord.findUnique({
      where: { id: id },
    });

    if (!record) {
      return NextResponse.json({ error: "Record not found." }, { status: 404 });
    }

    const allowed = canAccessHealthRecord({
      recordUserId: record.userid,
      viewerUserId: session.user.id,
      viewerRole: session.user.role ?? "PATIENT",
      sharedWith: record.sharedwith,
    });

    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const key = record.r2key.replace(/^\/+/, "");
    if (!key.startsWith("health-records/")) {
      return NextResponse.json({ error: "Invalid file key." }, { status: 400 });
    }

    const object = await getR2Client().send(
      new GetObjectCommand({
        Bucket: getR2Config().bucketName,
        Key: key,
      })
    );
    const stream = toWebStream(object.Body);
    if (!stream) {
      return NextResponse.json({ error: "Unable to read file stream." }, { status: 500 });
    }

    const safeName = record.name.replace(/[^\w\s.-]/g, "").trim() || "health-record";
    const ext = key.split(".").pop() ?? "bin";

    return new NextResponse(stream, {
      headers: {
        "Content-Type": record.mimetype,
        "Content-Disposition": `inline; filename="${safeName}.${ext}"`,
        "Cache-Control": "private, max-age=900, no-store",
      },
    });
  } catch (error) {
    if (error instanceof NoSuchKey) {
      return NextResponse.json({ error: "File not found in storage." }, { status: 404 });
    }
    console.error("[health-records/download]", error);
    return NextResponse.json({ error: "Unable to download health record." }, { status: 500 });
  }
}
