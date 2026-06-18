import { createHmac, timingSafeEqual } from "node:crypto";

export type ConsultationJoinRole = "doctor" | "patient";

type JoinTokenPayload = {
  b: string;
  r: ConsultationJoinRole;
  exp: number;
};

function getJoinSecret() {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "";
}

function signEncodedPayload(encoded: string) {
  return createHmac("sha256", getJoinSecret()).update(encoded).digest("base64url");
}

export function getConsultationJoinExpiry(endsAt: Date) {
  return new Date(endsAt.getTime() + 2 * 60 * 60 * 1000);
}

export function createConsultationJoinToken(
  bookingId: string,
  role: ConsultationJoinRole,
  expiresAt: Date
) {
  const payload: JoinTokenPayload = {
    b: bookingId,
    r: role,
    exp: expiresAt.getTime(),
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${signEncodedPayload(encoded)}`;
}

export function verifyConsultationJoinToken(token: string): JoinTokenPayload | null {
  const secret = getJoinSecret();
  if (!secret) return null;

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = signEncodedPayload(encoded);
  const provided = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    provided.length !== expectedBuffer.length ||
    !timingSafeEqual(provided, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as JoinTokenPayload;
    if (!payload.b || (payload.r !== "doctor" && payload.r !== "patient")) {
      return null;
    }
    if (!payload.exp || payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function buildConsultationJoinUrl(
  siteUrl: string,
  bookingId: string,
  role: ConsultationJoinRole,
  endsAt: Date
) {
  const token = createConsultationJoinToken(bookingId, role, getConsultationJoinExpiry(endsAt));
  return `${siteUrl}/consultation/${bookingId}/waiting?token=${encodeURIComponent(token)}`;
}
