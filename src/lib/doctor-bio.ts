const CONTACT_SEGMENT_PREFIX =
  /^(whatsapp|phone|email|mail|mobile|tel|contact|e-?mail)\s*:/i;
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_PATTERN = /(?:\+?\d[\d\s\-().]{7,}\d)/g;

function stripInlineContactDetails(text: string): string {
  return text
    .replace(EMAIL_PATTERN, "")
    .replace(PHONE_PATTERN, (match) => {
      const digits = match.replace(/\D/g, "");
      return digits.length >= 10 ? "" : match;
    })
    .replace(
      /\b(call\s+me\s+at|reach\s+(me\s+)?at|contact\s+(me\s+)?(at|on)?|whatsapp|or\s+email|email\s+us(\s+at)?)\b/gi,
      ""
    )
    .replace(/\s{2,}/g, " ")
    .replace(/\s*([,;|])\s*(?=[,;|]|$)/g, "")
    .trim();
}

export function sanitizeDoctorBioForPublic(bio: string | null | undefined): string {
  const trimmed = bio?.trim();
  if (!trimmed) return "";

  const segments = trimmed
    .split(/\s*\|\s*/)
    .filter((segment) => {
      const value = segment.trim();
      return value.length > 0 && !CONTACT_SEGMENT_PREFIX.test(value);
    })
    .map((segment) => stripInlineContactDetails(segment.trim()))
    .filter((segment) => segment.length > 0);

  return segments.join(" | ").trim();
}
