const IST_OFFSET = "+05:30";

function formatGoogleDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function parseTimeSlotTo24h(slot: string) {
  const normalized = slot.trim().toUpperCase();
  const match = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!match) return null;

  const hour12 = Number(match[1]);
  const minute = Number(match[2]);
  const meridian = match[3];
  if (Number.isNaN(hour12) || Number.isNaN(minute) || hour12 < 1 || hour12 > 12) return null;

  const hour24 = meridian === "PM" ? (hour12 % 12) + 12 : hour12 % 12;
  return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function buildGoogleCalendarLink(params: {
  title: string;
  description: string;
  date: string;
  timeSlot: string;
  durationMinutes?: number;
}) {
  const hhmm = parseTimeSlotTo24h(params.timeSlot);
  if (!hhmm) return null;

  const start = new Date(`${params.date}T${hhmm}:00${IST_OFFSET}`);
  if (Number.isNaN(start.getTime())) return null;

  const durationMinutes = params.durationMinutes ?? 20;
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", params.title);
  url.searchParams.set("details", params.description);
  url.searchParams.set("dates", `${formatGoogleDate(start)}/${formatGoogleDate(end)}`);
  return url.toString();
}
