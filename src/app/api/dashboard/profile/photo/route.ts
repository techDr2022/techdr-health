import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadDoctorProfilePhotoToR2 } from "@/lib/doctor-profile-photo-upload";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "DOCTOR") {
    return NextResponse.json({ error: "Only doctors can upload profile photos." }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("photo");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Photo file is required." }, { status: 400 });
    }

    const uploaded = await uploadDoctorProfilePhotoToR2(file, session.user.id);
    return NextResponse.json({ url: uploaded.url, key: uploaded.key });
  } catch (error) {
    if (error instanceof Error && error.message) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("upload doctor profile photo error", error);
    return NextResponse.json({ error: "Unable to upload photo." }, { status: 500 });
  }
}
