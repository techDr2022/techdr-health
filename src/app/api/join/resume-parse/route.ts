import { NextRequest, NextResponse } from "next/server";
import { parseDoctorResumeFile, countFilledResumeFields } from "@/lib/doctor-resume-parse";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Resume file is required." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Upload a PDF, TXT, JPG, PNG, or WEBP resume file." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "Resume must be under 8MB." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await parseDoctorResumeFile(buffer, file.type);
    const filledFields = countFilledResumeFields(data);

    if (filledFields === 0) {
      return NextResponse.json(
        { error: "No doctor details could be extracted. Try a clearer resume or fill manually." },
        { status: 422 }
      );
    }

    return NextResponse.json({ data, filledFields });
  } catch (error) {
    console.error("resume parse error", error);
    const message =
      error instanceof Error ? error.message : "Unable to analyze resume. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
