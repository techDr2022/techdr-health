import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  HEALTH_RECORD_QUOTA_BYTES,
  getUserHealthRecordUsageBytes,
} from "@/lib/health-records";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
    const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") ?? "20") || 20));
    const skip = (page - 1) * limit;

    const [records, total, usedBytes] = await Promise.all([
      prisma.healthrecord.findMany({
        where: { userid: session.user.id },
        orderBy: { uploadedat: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          type: true,
          filesize: true,
          mimetype: true,
          sharedwith: true,
          uploadedat: true,
        },
      }),
      prisma.healthrecord.count({ where: { userid: session.user.id } }),
      getUserHealthRecordUsageBytes(session.user.id),
    ]);

    return NextResponse.json({
      records: records.map((record) => ({
        ...record,
        uploadedat: record.uploadedat.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      storage: {
        usedBytes,
        quotaBytes: HEALTH_RECORD_QUOTA_BYTES,
        remainingBytes: Math.max(0, HEALTH_RECORD_QUOTA_BYTES - usedBytes),
      },
    });
  } catch (error) {
    console.error("[health-records/list]", error);
    return NextResponse.json({ error: "Unable to fetch health records." }, { status: 500 });
  }
}
