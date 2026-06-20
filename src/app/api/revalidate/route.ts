import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { DOCTOR_CATALOG_CACHE_TAG } from "@/lib/doctor-catalog";
import { revalidateDoctorPublicPages } from "@/lib/revalidate-doctors";

export const dynamic = "force-dynamic";

type RevalidateBody = {
  path?: string;
  tag?: string;
  specialty?: string;
  doctorSlug?: string;
  scope?: "doctor-catalog";
};

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-revalidate-secret");
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: RevalidateBody = {};
  try {
    body = (await req.json()) as RevalidateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (body.scope === "doctor-catalog" || body.specialty || body.doctorSlug) {
    revalidateDoctorPublicPages(body.specialty, body.doctorSlug);
  }

  if (body.tag?.trim()) {
    revalidateTag(body.tag.trim());
  }

  if (body.path?.trim()) {
    revalidatePath(body.path.trim());
  }

  return NextResponse.json({
    revalidated: true,
    tag: body.tag ?? null,
    path: body.path ?? null,
    catalogTag: DOCTOR_CATALOG_CACHE_TAG,
  });
}
