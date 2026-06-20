import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { cancelInstantConsultQueue } from "@/lib/instant-consult";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as { queueId?: string };
    const queueId = String(body.queueId ?? "").trim();
    if (!queueId) {
      return NextResponse.json({ error: "queueId is required." }, { status: 400 });
    }

    const result = await cancelInstantConsultQueue(queueId, session.user.id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("instant-consult cancel error", error);
    return NextResponse.json({ error: "Unable to cancel queue." }, { status: 500 });
  }
}
