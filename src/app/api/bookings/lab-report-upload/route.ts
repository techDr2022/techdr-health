import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { buildR2PublicUrl, getR2Client, getR2Config } from "@/lib/r2";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function extensionForType(type: string) {
  if (type === "application/pdf") return "pdf";
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return null;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("report");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Report file is required." }, { status: 400 });
    }
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Only PDF, JPG, PNG, and WEBP files are allowed." }, { status: 400 });
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "File must be under 10MB." }, { status: 400 });
    }

    const ext = extensionForType(file.type);
    if (!ext) {
      return NextResponse.json({ error: "Unsupported report file type." }, { status: 400 });
    }

    const objectKey = `lab-reports/${Date.now()}-${randomUUID()}.${ext}`;
    const r2Config = getR2Config();
    const arrayBuffer = await file.arrayBuffer();

    await getR2Client().send(
      new PutObjectCommand({
        Bucket: r2Config.bucketName,
        Key: objectKey,
        Body: Buffer.from(arrayBuffer),
        ContentType: file.type,
        CacheControl: "private, max-age=0, no-cache",
      })
    );

    return NextResponse.json({ url: buildR2PublicUrl(objectKey), key: objectKey });
  } catch (error) {
    console.error("upload lab report error", error);
    return NextResponse.json({ error: "Unable to upload lab report." }, { status: 500 });
  }
}
