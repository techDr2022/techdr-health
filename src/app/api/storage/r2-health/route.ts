import { HeadBucketCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { getR2Client, getR2Config } from "@/lib/r2";

export async function GET() {
  try {
    const config = getR2Config();

    await getR2Client().send(
      new HeadBucketCommand({
        Bucket: config.bucketName,
      })
    );

    return NextResponse.json({
      ok: true,
      bucket: config.bucketName,
      endpoint: config.endpoint,
      accountId: config.accountId,
    });
  } catch (error) {
    console.error("r2 health check failed", error);
    return NextResponse.json(
      {
        ok: false,
        error: "R2 connection failed. Check account ID, endpoint, keys, and bucket name.",
      },
      { status: 500 }
    );
  }
}
