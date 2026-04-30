import { randomBytes } from "node:crypto";
import { addDays } from "date-fns";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

function readBearerToken(req: NextRequest) {
  const header = req.headers.get("authorization") || "";
  if (!header.toLowerCase().startsWith("bearer ")) return null;
  return header.slice(7).trim();
}

export async function createMobileSession(userId: string, req: NextRequest) {
  const sessionToken = randomBytes(32).toString("hex");
  const expiresAt = addDays(new Date(), 30);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const userAgent = req.headers.get("user-agent") || "mobile";

  await prisma.authSession.create({
    data: {
      userId,
      sessionToken,
      ip,
      device: userAgent,
      expiresAt,
    },
  });

  return { sessionToken, expiresAt };
}

export async function requireMobileSession(req: NextRequest) {
  const token = readBearerToken(req);
  if (!token) return null;

  const session = await prisma.authSession.findUnique({
    where: { sessionToken: token },
    include: {
      user: {
        include: {
          doctorProfile: {
            select: {
              id: true,
              displayName: true,
              specialty: true,
              languages: true,
              photoUrl: true,
            },
          },
        },
      },
    },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) return null;

  await prisma.authSession.update({
    where: { id: session.id },
    data: { lastActiveAt: new Date() },
  });

  return session;
}
