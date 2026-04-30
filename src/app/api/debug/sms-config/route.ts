import { NextRequest, NextResponse } from "next/server";
import {
  getSmsProvider,
  hasAnySmsProviderConfigured,
  hasTwilioCredentials,
} from "@/lib/sms";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(req: NextRequest) {
  const debugKey = process.env.DEBUG_SMS_CONFIG_KEY?.trim();
  if (!debugKey) {
    return NextResponse.json(
      { error: "DEBUG_SMS_CONFIG_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  const requestKey = req.headers.get("x-debug-key")?.trim();
  if (!requestKey || requestKey !== debugKey) return unauthorized();

  return NextResponse.json({
    provider: getSmsProvider(),
    hasTwilioCredentials: hasTwilioCredentials(),
    hasAnySmsProviderConfigured: hasAnySmsProviderConfigured(),
  });
}
