import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSecondOpinionContextForDoctor } from "@/lib/second-opinion-server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "DOCTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookingId = new URL(req.url).searchParams.get("bookingId")?.trim();
  if (!bookingId) {
    return NextResponse.json({ error: "bookingId is required." }, { status: 400 });
  }

  const context = await getSecondOpinionContextForDoctor(bookingId, session.user.id);
  if (!context) {
    return NextResponse.json(
      { error: "Second opinion records not available or not shared yet." },
      { status: 404 }
    );
  }

  return NextResponse.json(context);
}
