import { Readable } from "node:stream";
import { GetObjectCommand, NoSuchKey } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
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

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const key = (url.searchParams.get("key") || "").trim().replace(/^\/+/, "");
    if (!key) {
      return NextResponse.json({ error: "Missing key." }, { status: 400 });
    }

    // Restrict to profile image objects only.
    if (!key.startsWith("profile-photos/")) {
      return NextResponse.json({ error: "Invalid key." }, { status: 400 });
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
      return NextResponse.json({ error: "Unable to read object stream." }, { status: 500 });
    }

    return new NextResponse(stream, {
      headers: {
        "Content-Type": object.ContentType || "application/octet-stream",
        "Cache-Control": object.CacheControl || "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    if (error instanceof NoSuchKey) {
      return NextResponse.json({ error: "Image not found." }, { status: 404 });
    }
    console.error("r2 object fetch failed", error);
    return NextResponse.json({ error: "Unable to fetch image." }, { status: 500 });
  }
}
