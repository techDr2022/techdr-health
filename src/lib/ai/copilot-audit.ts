import { prisma } from "@/lib/prisma";
import type { CopilotEndpoint } from "@/lib/ai/copilot-shared";
import { truncateInputSummary } from "@/lib/ai/copilot-shared";

export async function logCopilotCall(args: {
  doctorUserId: string;
  bookingId?: string | null;
  endpoint: CopilotEndpoint;
  inputSummary: string;
}) {
  try {
    await prisma.aicalllog.create({
      data: {
        doctoruserid: args.doctorUserId,
        bookingid: args.bookingId?.trim() || null,
        endpoint: args.endpoint,
        inputsummary: truncateInputSummary(args.inputSummary),
      },
    });
  } catch (error) {
    console.error("[copilot-audit]", error);
  }
}
