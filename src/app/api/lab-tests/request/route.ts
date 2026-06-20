import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildLabTestAffiliateUrl, resolveLabTestPanel } from "@/lib/lab-tests";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    panelId?: string;
    city?: string;
    address?: string;
    phone?: string;
    notes?: string;
    bookingId?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const panelId = body.panelId?.trim();
  const city = body.city?.trim();
  if (!panelId || !city) {
    return NextResponse.json({ error: "Panel and city are required." }, { status: 400 });
  }

  const panel = resolveLabTestPanel(panelId);
  if (!panel) {
    return NextResponse.json({ error: "Unknown lab test panel." }, { status: 400 });
  }

  const order = await prisma.labtestorder.create({
    data: {
      userid: session.user.id,
      panelname: panel.panelName,
      testnames: panel.testNames,
      city,
      address: body.address?.trim() || null,
      phone: body.phone?.trim() || null,
      notes: body.notes?.trim() || null,
      bookingid: body.bookingId?.trim() || null,
      status: "REQUESTED",
    },
  });

  const affiliateUrl = buildLabTestAffiliateUrl({
    panelId: panel.panelId,
    orderId: order.id,
    city,
  });

  await prisma.labtestorder.update({
    where: { id: order.id },
    data: { affiliateurl: affiliateUrl, status: "REDIRECTED" },
  });

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    affiliateUrl,
    panelName: panel.panelName,
  });
}
