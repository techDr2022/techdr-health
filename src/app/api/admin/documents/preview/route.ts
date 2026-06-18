import { Readable } from "node:stream";
import { GetObjectCommand, NoSuchKey } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getR2Client, getR2Config } from "@/lib/r2";
import { isAllowedStorageKey } from "@/lib/storage-documents";

export const dynamic = "force-dynamic";

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

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const key = (url.searchParams.get("key") || "").trim().replace(/^\/+/, "");
    if (!key || !isAllowedStorageKey(key)) {
      return NextResponse.json({ error: "Invalid document key." }, { status: 400 });
    }

    const config = getR2Config();
    const object = await getR2Client().send(
      new GetObjectCommand({
        Bucket: config.bucketName,
        Key: key,
      })
    );

    const stream = toWebStream(object.Body);
    if (!stream) {
      return NextResponse.json({ error: "Unable to read document stream." }, { status: 500 });
    }

    return new NextResponse(stream, {
      headers: {
        "Content-Type": object.ContentType || "application/octet-stream",
        "Cache-Control": "private, no-store",
        "Content-Disposition": "inline",
      },
    });
  } catch (error) {
    if (error instanceof NoSuchKey) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }
    console.error("admin document preview failed", error);
    return NextResponse.json({ error: "Unable to fetch document." }, { status: 500 });
  }
}
