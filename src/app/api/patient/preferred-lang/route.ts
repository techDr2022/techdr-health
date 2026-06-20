import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { normalizeLanguage } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  language: z.enum(["en", "hi", "te"]),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { preferredlang: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ language: normalizeLanguage(user.preferredlang) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { language } = schema.parse(body);
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { preferredlang: language },
      select: { preferredlang: true },
    });
    return NextResponse.json({ language: normalizeLanguage(user.preferredlang) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid language." }, { status: 400 });
    }
    console.error("preferred-lang error", error);
    return NextResponse.json({ error: "Unable to save language preference." }, { status: 500 });
  }
}
