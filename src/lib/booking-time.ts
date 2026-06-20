const IST_OFFSET = "+05:30";

export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseTimeSlotTo24h(slot: string): string | null {
  const normalized = slot.trim().toUpperCase();
  const match12 = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (match12) {
    const hour12 = Number(match12[1]);
    const minute = Number(match12[2]);
    const meridian = match12[3];
    if (Number.isNaN(hour12) || Number.isNaN(minute) || hour12 < 1 || hour12 > 12) return null;
    const hour24 = meridian === "PM" ? (hour12 % 12) + 12 : hour12 % 12;
    return `${String(hour24).padStart(2, "0")}:${String(match12[2])}`;
  }

  const match24 = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hour = Number(match24[1]);
    const minute = Number(match24[2]);
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
    return `${String(hour).padStart(2, "0")}:${match24[2]}`;
  }

  return null;
}

export function formatSlotLabelFrom24h(hhmm: string): string {
  const [hhRaw, mm] = hhmm.split(":");
  const hour24 = Number(hhRaw);
  if (Number.isNaN(hour24)) return hhmm;
  const meridian = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${mm} ${meridian}`;
}

export function toScheduledAtISO(date: string, slotLabel: string): string | null {
  const hhmm = parseTimeSlotTo24h(slotLabel);
  if (!hhmm) return null;
  return `${date}T${hhmm}:00${IST_OFFSET}`;
}

export function slotToMinutes(slot: string): number {
  const hhmm = parseTimeSlotTo24h(slot);
  if (!hhmm) return Number.NaN;
  const [hh, mm] = hhmm.split(":").map(Number);
  return hh * 60 + mm;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function formatDayLabel(date: Date): string {
  return date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}
