import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Healthrecordtype } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  ALLOWED_HEALTH_RECORD_MIME_TYPES,
  HEALTH_RECORD_MAX_FILE_BYTES,
  assertHealthRecordQuota,
  extensionForMimeType,
  inferHealthRecordType,
} from "@/lib/health-records";
import { prisma } from "@/lib/prisma";
import { getR2Client, getR2Config } from "@/lib/r2";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "PATIENT" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only patients can upload health records." }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const nameInput = String(formData.get("name") ?? "").trim();
    const typeInput = String(formData.get("type") ?? "").trim().toUpperCase();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }
    if (!ALLOWED_HEALTH_RECORD_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only PDF, JPG, PNG, and WEBP files are allowed." },
        { status: 400 }
      );
    }
    if (file.size > HEALTH_RECORD_MAX_FILE_BYTES) {
      return NextResponse.json({ error: "File must be under 10MB." }, { status: 400 });
    }

    const ext = extensionForMimeType(file.type);
    if (!ext) {
      return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
    }

    await assertHealthRecordQuota(session.user.id, file.size);

    const recordName = nameInput || file.name.replace(/\.[^.]+$/, "") || "Health record";
    const recordType =
      typeInput && Object.values(Healthrecordtype).includes(typeInput as Healthrecordtype)
        ? (typeInput as Healthrecordtype)
        : inferHealthRecordType(file.type, file.name);

    const objectKey = `health-records/${session.user.id}/${Date.now()}-${randomUUID()}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();
    const r2Config = getR2Config();

    await getR2Client().send(
      new PutObjectCommand({
        Bucket: r2Config.bucketName,
        Key: objectKey,
        Body: Buffer.from(arrayBuffer),
        ContentType: file.type,
        CacheControl: "private, max-age=0, no-cache",
      })
    );

    const record = await prisma.healthrecord.create({
      data: {
        userid: session.user.id,
        name: recordName,
        type: recordType,
        r2key: objectKey,
        filesize: file.size,
        mimetype: file.type,
        sharedwith: [],
      },
    });

    return NextResponse.json({
      record: {
        id: record.id,
        name: record.name,
        type: record.type,
        filesize: record.filesize,
        mimetype: record.mimetype,
        sharedwith: record.sharedwith,
        uploadedat: record.uploadedat.toISOString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to upload health record.";
    if (message.includes("Storage limit")) {
      return NextResponse.json({ error: message }, { status: 413 });
    }
    console.error("[health-records/upload]", error);
    return NextResponse.json({ error: "Unable to upload health record." }, { status: 500 });
  }
}
