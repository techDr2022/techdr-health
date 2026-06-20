import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.labtestorder.findMany({
    where: { userid: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({
    orders: orders.map((order) => ({
      id: order.id,
      panelName: order.panelname,
      testNames: order.testnames,
      city: order.city,
      status: order.status,
      affiliateUrl: order.affiliateurl,
      createdAt: order.createdAt.toISOString(),
    })),
  });
}
