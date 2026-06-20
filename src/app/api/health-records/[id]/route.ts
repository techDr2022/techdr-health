import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteR2Object } from "@/lib/r2";
import { prisma } from "@/lib/prisma";

export async function DELETE(
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

    if (record.userid !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await deleteR2Object(record.r2key).catch((error) => {
      console.error("[health-records/delete] R2 delete failed", error);
    });

    await prisma.healthrecord.delete({ where: { id: record.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[health-records/delete]", error);
    return NextResponse.json({ error: "Unable to delete health record." }, { status: 500 });
  }
}
