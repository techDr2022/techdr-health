import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getInstantConsultStatus } from "@/lib/instant-consult";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ queueId: string }> }
) {
  const { queueId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await getInstantConsultStatus(queueId, session.user.id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.error === "Forbidden." ? 403 : 404 });
  }

  return NextResponse.json(result);
}
