import { BookingStatus, ConsultType, WeekDay } from "@prisma/client";
import {
  addDays,
  formatDateForInput,
  formatSlotLabelFrom24h,
  toScheduledAtISO,
} from "@/lib/booking-time";
import { getConsultFeeForType } from "@/lib/consult-fee";
import { applySurgeToFee, computePricingMultiplier, formatSurgeBadge } from "@/lib/pricing";
import { getSpecialtyDoctorCount } from "@/lib/pricing-server";
import { prisma } from "@/lib/prisma";

export const PLATFORM_DEFAULT_SLOTS = [
  "09:00 AM",
  "10:30 AM",
  "12:00 PM",
  "02:00 PM",
  "04:30 PM",
  "06:00 PM",
] as const;

const JS_DAY_TO_WEEKDAY: WeekDay[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export type DoctorSlotItem = {
  label: string;
  scheduledAt: string;
  available: boolean;
  baseFee: number;
  finalFee: number;
  surgeMultiplier: number;
  surgeReasons: string[];
  surgeBadge: string | null;
};

export type DoctorSlotDay = {
  date: string;
  label: string;
  slots: DoctorSlotItem[];
};

export type DoctorSlotsResponse = {
  doctorId: string;
  slug: string;
  displayName: string;
  consultFee: number;
  consultTypes: ConsultType[];
  consultFeeByType: Record<ConsultType, number>;
  surgePricingEnabled: boolean;
  weekStart: string;
  days: DoctorSlotDay[];
};

function getSlotLabelsForWeekday(
  weekday: WeekDay,
  timings: Array<{
    day: WeekDay;
    isOpen: boolean;
    slots: Array<{ startTime: string; endTime: string; isBooked: boolean }>;
  }>
): string[] {
  const timing = timings.find((item) => item.day === weekday && item.isOpen);
  if (!timing || timing.slots.length === 0) {
    return [...PLATFORM_DEFAULT_SLOTS];
  }

  const labels = timing.slots
    .filter((slot) => !slot.isBooked)
    .map((slot) => {
      const parsed = slot.startTime.includes("M")
        ? slot.startTime
        : formatSlotLabelFrom24h(slot.startTime);
      return parsed;
    })
    .filter(Boolean);

  return labels.length > 0 ? labels : [...PLATFORM_DEFAULT_SLOTS];
}

function isSlotInPast(date: string, slotLabel: string, now: Date): boolean {
  const scheduledAt = toScheduledAtISO(date, slotLabel);
  if (!scheduledAt) return true;
  return new Date(scheduledAt).getTime() <= now.getTime();
}

export async function getDoctorSlots(
  doctorIdOrSlug: string,
  options?: { weekStart?: string; consultType?: ConsultType }
): Promise<DoctorSlotsResponse | null> {
  const consultType = options?.consultType ?? "VIDEO";
  const doctor = await prisma.doctorProfile.findFirst({
    where: {
      OR: [{ id: doctorIdOrSlug }, { slug: doctorIdOrSlug }],
      isVisible: true,
      approvalStatus: "APPROVED",
    },
    select: {
      id: true,
      slug: true,
      displayName: true,
      consultFee: true,
      consultTypes: true,
      specialty: true,
      surgepricingenabled: true,
      timings: {
        select: {
          day: true,
          isOpen: true,
          slots: { select: { startTime: true, endTime: true, isBooked: true } },
        },
      },
    },
  });

  if (!doctor) return null;

  const specialtyDoctorCount = await getSpecialtyDoctorCount(doctor.specialty);

  const now = new Date();
  const weekStartDate = options?.weekStart
    ? new Date(`${options.weekStart}T00:00:00+05:30`)
    : new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const rangeEnd = addDays(weekStartDate, 7);

  const booked = await prisma.booking.findMany({
    where: {
      doctorId: doctor.id,
      scheduledAt: { gte: weekStartDate, lt: rangeEnd },
      status: { in: [BookingStatus.UPCOMING, BookingStatus.ONGOING, BookingStatus.COMPLETED] },
    },
    select: { scheduledAt: true },
  });

  const bookedIso = new Set(booked.map((item) => item.scheduledAt.toISOString()));

  const consultTypes =
    doctor.consultTypes.length > 0 ? doctor.consultTypes : (["VIDEO"] as ConsultType[]);
  const consultFeeByType = {
    VIDEO: getConsultFeeForType(doctor.consultFee, "VIDEO"),
    AUDIO: getConsultFeeForType(doctor.consultFee, "AUDIO"),
    CHAT: getConsultFeeForType(doctor.consultFee, "CHAT"),
  };
  const baseFeeForType = consultFeeByType[consultType];

  const days: DoctorSlotDay[] = [];

  for (let offset = 0; offset < 7; offset += 1) {
    const dayDate = addDays(weekStartDate, offset);
    const date = formatDateForInput(dayDate);
    const weekday = JS_DAY_TO_WEEKDAY[dayDate.getDay()];
    const labels = getSlotLabelsForWeekday(weekday, doctor.timings);

    const slots: DoctorSlotItem[] = labels.map((label) => {
      const scheduledAt = toScheduledAtISO(date, label);
      const available =
        Boolean(scheduledAt) &&
        !isSlotInPast(date, label, now) &&
        !bookedIso.has(new Date(scheduledAt!).toISOString());

      const slotDateTime = scheduledAt ? new Date(scheduledAt) : now;
      const surge = computePricingMultiplier({
        slotDateTime,
        specialtyDoctorCount,
        surgeEnabled: doctor.surgepricingenabled,
      });
      const finalFee = applySurgeToFee(baseFeeForType, surge.multiplier);
      const surgeBadge = formatSurgeBadge(surge.reasons, surge.multiplier);

      return {
        label,
        scheduledAt: scheduledAt ?? "",
        available,
        baseFee: baseFeeForType,
        finalFee,
        surgeMultiplier: surge.multiplier,
        surgeReasons: surge.reasons,
        surgeBadge,
      };
    });

    days.push({
      date,
      label: dayDate.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
      slots,
    });
  }

  return {
    doctorId: doctor.id,
    slug: doctor.slug,
    displayName: doctor.displayName,
    consultFee: doctor.consultFee,
    consultTypes,
    consultFeeByType,
    surgePricingEnabled: doctor.surgepricingenabled,
    weekStart: formatDateForInput(weekStartDate),
    days,
  };
}

export function findFirstAvailableSlot(days: DoctorSlotDay[]): {
  date: string;
  slot: DoctorSlotItem;
} | null {
  for (const day of days) {
    const slot = day.slots.find((item) => item.available);
    if (slot) return { date: day.date, slot };
  }
  return null;
}
