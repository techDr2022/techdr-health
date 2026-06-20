// AI-POWERED — doctor in-room clinical decision support
export const COPILOT_DISCLAIMER =
  "AI-assisted suggestion only. Clinical judgment of the treating physician supersedes this output.";

export type CopilotEndpoint = "differential-dx" | "drug-interactions" | "clinical-guidelines";

export function truncateInputSummary(value: string, max = 480): string {
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}
