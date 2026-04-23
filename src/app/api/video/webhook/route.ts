import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await req.text();
    return NextResponse.json({ received: true, provider: "100ms" });
  } catch (error) {
    console.error("[video/webhook]", error);
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }
}
