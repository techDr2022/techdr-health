import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  marketingConsent: z.boolean(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { marketingConsent } = schema.parse(body);

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        marketingconsent: marketingConsent,
        marketingconsentat: marketingConsent ? new Date() : null,
      },
      select: {
        marketingconsent: true,
        marketingconsentat: true,
      },
    });

    return NextResponse.json({
      marketingConsent: user.marketingconsent,
      marketingConsentAt: user.marketingconsentat?.toISOString() ?? null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }
    console.error("update-consent error", error);
    return NextResponse.json({ error: "Unable to update consent." }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      marketingconsent: true,
      marketingconsentat: true,
      datadeleterequested: true,
      datadeleterequestedat: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({
    marketingConsent: user.marketingconsent,
    marketingConsentAt: user.marketingconsentat?.toISOString() ?? null,
    dataDeleteRequested: user.datadeleterequested,
    dataDeleteRequestedAt: user.datadeleterequestedat?.toISOString() ?? null,
  });
}
