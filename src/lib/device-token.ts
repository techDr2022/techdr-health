import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const PLATFORMS = new Set(["ios", "android"]);

export async function registerDeviceToken(input: {
  userId: string;
  token: string;
  platform: string;
}) {
  const token = input.token.trim();
  const platform = input.platform.trim().toLowerCase();
  if (!token || !PLATFORMS.has(platform)) {
    throw new Error("Invalid device token payload");
  }

  const existing = await prisma.devicetoken.findUnique({
    where: { token },
    select: { id: true, userid: true },
  });

  if (existing) {
    if (existing.userid !== input.userId) {
      await prisma.devicetoken.update({
        where: { id: existing.id },
        data: { userid: input.userId, platform },
      });
      return;
    }
    await prisma.devicetoken.update({
      where: { id: existing.id },
      data: { platform },
    });
    return;
  }

  await prisma.devicetoken.create({
    data: {
      userid: input.userId,
      token,
      platform,
    },
  });
}

export async function registerDeviceTokenFromRequest(
  userId: string,
  req: NextRequest,
  body?: { fcmToken?: string; platform?: string }
) {
  const token = body?.fcmToken?.trim() || req.headers.get("x-fcm-token")?.trim();
  const platform =
    body?.platform?.trim().toLowerCase() || req.headers.get("x-device-platform")?.trim().toLowerCase();
  if (!token || !platform) return;
  await registerDeviceToken({ userId, token, platform });
}

export async function removeDeviceToken(token: string) {
  await prisma.devicetoken.deleteMany({ where: { token } });
}
