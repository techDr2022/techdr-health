// AI-POWERED — prescription draft with TPG drug restriction warnings
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { callClaudeJSON } from "@/lib/ai/client";
import {
  aiUnavailableResponse,
  handleAiRouteError,
} from "@/lib/ai/errors";
import { isFirstConsultWithDoctor } from "@/lib/booking-consult-context";
import { getDrugWarnings, validateMedicinesForConsult } from "@/lib/drug-restrictions";
import { prisma } from "@/lib/prisma";
import { resolveConsultationAccess } from "@/lib/consultation-access";

const bodySchema = z.object({
  bookingId: z.string().min(1),
  chiefComplaint: z.string().min(1),
  doctorNotes: z.string().optional(),
  joinToken: z.string().optional(),
});

type Medication = {
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
};

type PrescriptionDraft = {
  diagnosis: string;
  medicines: Medication[];
  instructions: string;
};

const SYSTEM_PROMPT = `You are a clinical prescription drafting assistant for TechDrHealth doctors in India.
Generate a conservative prescription DRAFT for doctor review only — never for direct patient use.
Avoid Schedule X drugs entirely. Be cautious with antibiotics and controlled substances.
Note when in-person evaluation is required.

Return JSON: {
  "diagnosis": string,
  "medicines": [{ "name", "dosage", "duration", "instructions" }],
  "instructions": string
}`;

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { bookingId, chiefComplaint, doctorNotes, joinToken } = parsed.data;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        doctor: { select: { userId: true, specialty: true } },
        consultationRoom: { select: { chatLog: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const session = await auth();
    const access = await resolveConsultationAccess(
      bookingId,
      booking,
      joinToken?.trim() || null
    );
    const isDoctor =
      access?.role === "doctor" ||
      (session?.user?.id === booking.doctor.userId && session.user.role === "DOCTOR");

    if (!isDoctor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chatSnippet =
      booking.consultationRoom?.chatLog != null
        ? JSON.stringify(booking.consultationRoom.chatLog).slice(0, 2000)
        : "";

    const prompt = [
      `Specialty: ${booking.doctor.specialty}`,
      `Consultation type: ${booking.consultType}`,
      `Chief complaint: ${chiefComplaint}`,
      doctorNotes?.trim() ? `Doctor notes: ${doctorNotes.trim()}` : null,
      chatSnippet ? `Chat excerpt: ${chatSnippet}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    let draft: PrescriptionDraft;
    try {
      draft = await callClaudeJSON<PrescriptionDraft>(SYSTEM_PROMPT, prompt, 900);
    } catch {
      return aiUnavailableResponse();
    }

    const medicines = Array.isArray(draft.medicines)
      ? draft.medicines.filter((item) => item?.name)
      : [];

    const firstConsult = await isFirstConsultWithDoctor(
      booking.patientId,
      booking.doctorId,
      booking.id
    );
    const warnings = getDrugWarnings(
      validateMedicinesForConsult(medicines, booking.consultType, firstConsult)
    );

    return NextResponse.json({
      draft: {
        diagnosis: draft.diagnosis || "",
        medicines,
        instructions: draft.instructions || "",
      },
      warnings,
      disclaimer:
        "AI-assisted draft only. Clinical judgment of the treating physician supersedes this output.",
    });
  } catch (error) {
    return handleAiRouteError(error, "prescription-draft");
  }
}
