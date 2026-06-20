import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildR2PublicUrl, getR2Client, getR2Config } from "@/lib/r2";
import {
  ONBOARDING_DOC_PREFIX,
  extensionForDocumentType,
} from "@/lib/storage-documents";

export const dynamic = "force-dynamic";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const DOCUMENT_TYPES = new Set([
  "med-reg-cert",
  "gov-id",
  "profile-photo",
  "degree",
  "logo",
]);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const applicationId = id?.trim();
    if (!applicationId) {
      return NextResponse.json({ error: "Application id is required." }, { status: 400 });
    }

    const profile = await prisma.doctorProfile.findUnique({
      where: { id: applicationId },
      select: { id: true },
    });
    if (!profile) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const documentType = String(formData.get("documentType") ?? "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Document file is required." }, { status: 400 });
    }
    if (!DOCUMENT_TYPES.has(documentType)) {
      return NextResponse.json({ error: "Invalid document type." }, { status: 400 });
    }
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Only PDF, JPG, PNG, and WEBP files are allowed." }, { status: 400 });
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "File must be under 10MB." }, { status: 400 });
    }

    const ext = extensionForDocumentType(file.type);
    if (!ext) {
      return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
    }

    const objectKey = `${ONBOARDING_DOC_PREFIX}${applicationId}/${documentType}-${randomUUID()}.${ext}`;
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
    console.error("upload onboarding document error", error);
    return NextResponse.json({ error: "Unable to upload document." }, { status: 500 });
  }
}
