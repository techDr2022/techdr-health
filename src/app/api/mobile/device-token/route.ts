import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { registerDeviceToken } from "@/lib/device-token";
import { requireMobileSession } from "@/lib/mobile-session";

const schema = z.object({
  token: z.string().min(1),
  platform: z.enum(["ios", "android"]),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await requireMobileSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid device token payload" }, { status: 400 });
    }

    await registerDeviceToken({
      userId: session.user.id,
      token: parsed.data.token,
      platform: parsed.data.platform,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("mobile device-token error", error);
    return NextResponse.json({ error: "Unable to register device token." }, { status: 500 });
  }
}
