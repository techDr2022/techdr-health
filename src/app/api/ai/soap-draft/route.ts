// AI-POWERED
import { NextResponse } from "next/server";
import { z } from "zod";
import { callClaudeJSON } from "@/lib/ai/client";
import { aiUnavailableResponse, handleAiRouteError } from "@/lib/ai/errors";
import { prisma } from "@/lib/prisma";
import {
  encryptSoapFields,
  extractChiefComplaint,
  resolveSoapNoteAccess,
  toSoapNoteClient,
} from "@/lib/soap-notes";
import { getBookingBeneficiaryName } from "@/lib/family-members";

const bodySchema = z.object({
  bookingId: z.string().min(1),
  joinToken: z.string().optional(),
});

type SoapDraft = {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
};

const SYSTEM_PROMPT = `You are a clinical documentation assistant for TechDrHealth doctors in India.
Generate a draft SOAP note from consultation context. This is a DRAFT for doctor review only.
Use concise clinical language. Note when in-person evaluation is needed.
Do not invent vitals or exam findings not supported by context — use "Not documented" in objective when unknown.

Return JSON: {
  "subjective": string,
  "objective": string,
  "assessment": string,
  "plan": string
}`;

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { bookingId, joinToken } = parsed.data;
    const access = await resolveSoapNoteAccess(bookingId, joinToken);
    if (!access) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (!access.canEdit) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        doctor: { select: { specialty: true, displayName: true } },
        patient: { select: { name: true } },
        consultationRoom: { select: { chatLog: true, durationSeconds: true } },
        familymember: { select: { name: true, relation: true, gender: true, dob: true } },
      },
    });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const chiefComplaint = extractChiefComplaint(booking.notes);
    const chatSnippet =
      booking.consultationRoom?.chatLog != null
        ? JSON.stringify(booking.consultationRoom.chatLog).slice(0, 2500)
        : "";

    const prompt = [
      `Doctor: ${booking.doctor.displayName} (${booking.doctor.specialty})`,
      `Consult type: ${booking.consultType}`,
      `Patient: ${getBookingBeneficiaryName(booking)}`,
      booking.familymember
        ? `Relation: ${booking.familymember.relation} · DOB: ${booking.familymember.dob.toISOString().slice(0, 10)} · Gender: ${booking.familymember.gender}`
        : null,
      chiefComplaint ? `Chief complaint: ${chiefComplaint}` : null,
      booking.notes?.trim() ? `Booking notes: ${booking.notes.trim().slice(0, 1500)}` : null,
      chatSnippet ? `Consultation chat excerpt: ${chatSnippet}` : null,
      booking.consultationRoom?.durationSeconds
        ? `Consultation duration: ${booking.consultationRoom.durationSeconds} seconds`
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    let draft: SoapDraft;
    try {
      draft = await callClaudeJSON<SoapDraft>(SYSTEM_PROMPT, prompt, 1400);
    } catch {
      return aiUnavailableResponse();
    }

    const content = {
      subjective: draft.subjective?.trim() || "",
      objective: draft.objective?.trim() || "",
      assessment: draft.assessment?.trim() || "",
      plan: draft.plan?.trim() || "",
    };

    const encrypted = encryptSoapFields(content);
    const record = await prisma.soapnote.upsert({
      where: { bookingid: bookingId },
      update: { ...encrypted, aidraftused: true },
      create: {
        bookingid: bookingId,
        ...encrypted,
        aidraftused: true,
      },
    });

    return NextResponse.json({ note: toSoapNoteClient(record) });
  } catch (error) {
    return handleAiRouteError(error, "soap-draft");
  }
}
