import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { buildR2PublicUrl, getR2Client, getR2Config } from "@/lib/r2";
import {
  extensionForProfilePhotoType,
  PROFILE_PHOTO_MAX_BYTES,
  PROFILE_PHOTO_MIME_TYPES,
} from "@/lib/doctor-profile-photo";

export { PROFILE_PHOTO_MAX_BYTES, PROFILE_PHOTO_MIME_TYPES } from "@/lib/doctor-profile-photo";

export async function uploadDoctorProfilePhotoToR2(file: File, userId: string) {
  if (!PROFILE_PHOTO_MIME_TYPES.has(file.type)) {
    throw new Error("Only JPG, PNG, and WEBP images are allowed.");
  }
  if (file.size > PROFILE_PHOTO_MAX_BYTES) {
    throw new Error("Image must be under 5MB.");
  }

  const ext = extensionForProfilePhotoType(file.type);
  if (!ext) {
    throw new Error("Unsupported image type.");
  }

  const objectKey = `profile-photos/${userId}-${randomUUID()}.${ext}`;
  const r2Config = getR2Config();
  const buffer = Buffer.from(await file.arrayBuffer());

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: r2Config.bucketName,
      Key: objectKey,
      Body: buffer,
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return { key: objectKey, url: buildR2PublicUrl(objectKey) };
}
