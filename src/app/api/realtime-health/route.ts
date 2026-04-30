import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function hasEnv(name: string) {
  return Boolean(process.env[name]?.trim());
}

export async function GET() {
  const server = {
    PUSHER_APP_ID: hasEnv("PUSHER_APP_ID"),
    PUSHER_KEY: hasEnv("PUSHER_KEY"),
    PUSHER_SECRET: hasEnv("PUSHER_SECRET"),
    PUSHER_CLUSTER: hasEnv("PUSHER_CLUSTER"),
  };

  const client = {
    NEXT_PUBLIC_PUSHER_KEY: hasEnv("NEXT_PUBLIC_PUSHER_KEY"),
    NEXT_PUBLIC_PUSHER_CLUSTER: hasEnv("NEXT_PUBLIC_PUSHER_CLUSTER"),
  };

  const serverReady = Object.values(server).every(Boolean);
  const clientReady = Object.values(client).every(Boolean);

  return NextResponse.json({
    ok: serverReady && clientReady,
    message:
      serverReady && clientReady
        ? "Realtime config is complete."
        : "Realtime config is incomplete. Check missing flags.",
    server,
    client,
  });
}
