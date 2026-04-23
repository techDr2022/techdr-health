import { createHmac, randomUUID } from "node:crypto";

const DEFAULT_HMS_API_BASE = "https://api.100ms.live/v2";
const DEFAULT_MANAGEMENT_TOKEN_TTL_SECONDS = 24 * 60 * 60;
const DEFAULT_PARTICIPANT_TOKEN_TTL_SECONDS = 60 * 60;

type HmsRoomResponse = {
  id: string;
  name: string;
};

function toBase64Url(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function signJwt(payload: Record<string, unknown>, secret: string) {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac("sha256", secret).update(signingInput).digest("base64url");
  return `${signingInput}.${signature}`;
}

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

function getTokenTtl(envName: string, fallback: number) {
  const raw = process.env[envName];
  const parsed = raw ? Number(raw) : fallback;
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

function createManagementToken() {
  const accessKey = getRequiredEnv("HMS_APP_ACCESS_KEY");
  const appSecret = getRequiredEnv("HMS_APP_SECRET");
  const now = Math.floor(Date.now() / 1000);
  const exp = now + getTokenTtl("HMS_MANAGEMENT_TOKEN_TTL_SECONDS", DEFAULT_MANAGEMENT_TOKEN_TTL_SECONDS);

  return signJwt(
    {
      access_key: accessKey,
      type: "management",
      version: 2,
      iat: now,
      nbf: now,
      exp,
      jti: randomUUID(),
    },
    appSecret
  );
}

export function createParticipantToken({
  roomId,
  userId,
  role,
  ttlSeconds,
}: {
  roomId: string;
  userId: string;
  role: string;
  ttlSeconds?: number;
}) {
  const accessKey = getRequiredEnv("HMS_APP_ACCESS_KEY");
  const appSecret = getRequiredEnv("HMS_APP_SECRET");
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (ttlSeconds ?? getTokenTtl("VIDEO_TOKEN_TTL_SECONDS", DEFAULT_PARTICIPANT_TOKEN_TTL_SECONDS));

  return signJwt(
    {
      access_key: accessKey,
      room_id: roomId,
      user_id: userId,
      role,
      type: "app",
      version: 2,
      iat: now,
      nbf: now,
      exp,
      jti: randomUUID(),
    },
    appSecret
  );
}

export async function createRoomForBooking(bookingId: string) {
  const templateId = getRequiredEnv("HMS_TEMPLATE_ID");
  const managementToken = createManagementToken();
  const apiBase = process.env.HMS_API_BASE_URL || DEFAULT_HMS_API_BASE;

  const response = await fetch(`${apiBase}/rooms`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${managementToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: `consultation-${bookingId}`,
      description: `Consultation room for booking ${bookingId}`,
      template_id: templateId,
      region: process.env.HMS_REGION || undefined,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Failed to create 100ms room: ${response.status} ${details}`);
  }

  const room = (await response.json()) as HmsRoomResponse;
  return room;
}
