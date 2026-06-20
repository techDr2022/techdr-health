import { addMinutes } from "date-fns";
import Pusher from "pusher";
import { Bookingqueuestatus, ConsultType, PayStatus } from "@prisma/client";
import { CONSULTATION_SLOT_MINUTES } from "@/lib/consultation";
import { calculateDoctorPayout } from "@/lib/plans";
import { isFirstConsultWithDoctor } from "@/lib/booking-consult-context";
import { getConsultFeeForType } from "@/lib/consult-fee";
import { applySurgeToFee } from "@/lib/pricing";
import { resolveSurgePricingForDoctor } from "@/lib/pricing-server";
import { PUBLIC_DOCTOR_FILTER, resolveSpecialtySlug } from "@/lib/doctor-specialty";
import { resolveHealthPassBookingPricing } from "@/lib/patient-health-pass-db";
import { prisma } from "@/lib/prisma";

export const INSTANT_QUEUE_TTL_MINUTES = 15;

function getPusherClient() {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER;
  if (!appId || !key || !secret || !cluster) return null;
  return new Pusher({ appId, key, secret, cluster, useTLS: true });
}

export async function isDoctorBusyNow(doctorId: string) {
  const now = new Date();
  const active = await prisma.booking.count({
    where: {
      doctorId,
      status: { in: ["UPCOMING", "ONGOING"] },
      scheduledAt: { lte: now },
      endsAt: { gt: now },
    },
  });
  return active > 0;
}

async function listInstantDoctorsForSpecialty(specialtySlug: string) {
  const doctors = await prisma.doctorProfile.findMany({
    where: {
      ...PUBLIC_DOCTOR_FILTER,
      nmcverified: true,
      acceptinstantconsult: true,
      instantonline: true,
    },
    select: {
      id: true,
      displayName: true,
      specialty: true,
      consultFee: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const slug = resolveSpecialtySlug(specialtySlug);
  const matched: typeof doctors = [];
  for (const doctor of doctors) {
    if (resolveSpecialtySlug(doctor.specialty) !== slug) continue;
    if (await isDoctorBusyNow(doctor.id)) continue;
    matched.push(doctor);
  }
  return matched;
}

async function notifyDoctorInstantQueue(args: {
  doctorId: string;
  queueId: string;
  specialtySlug: string;
  patientName: string;
}) {
  const pusher = getPusherClient();
  if (!pusher) return;
  await pusher.trigger(`doctor-${args.doctorId}`, "instant-consult-queue", {
    queueId: args.queueId,
    specialtySlug: args.specialtySlug,
    patientName: args.patientName,
  });
}

export async function expireStaleQueueEntries() {
  const now = new Date();
  await prisma.bookingqueue.updateMany({
    where: {
      status: Bookingqueuestatus.WAITING,
      expiresat: { lt: now },
    },
    data: { status: Bookingqueuestatus.EXPIRED },
  });
}

export async function estimateQueueWaitMinutes(specialtySlug: string) {
  const slug = resolveSpecialtySlug(specialtySlug);
  const [waitingCount, onlineDoctors] = await Promise.all([
    prisma.bookingqueue.count({
      where: {
        status: Bookingqueuestatus.WAITING,
        specialtyslug: slug,
        expiresat: { gt: new Date() },
      },
    }),
    listInstantDoctorsForSpecialty(slug),
  ]);

  if (onlineDoctors.length > 0) return Math.max(1, Math.ceil(waitingCount / onlineDoctors.length) * 2);
  return Math.max(3, waitingCount * 3);
}

async function createInstantBooking(args: {
  patientId: string;
  doctorId: string;
  concern?: string;
}) {
  const now = new Date();
  const surge = await resolveSurgePricingForDoctor(args.doctorId, now);
  const doctor = await prisma.doctorProfile.findUnique({
    where: { id: args.doctorId },
    select: { consultFee: true },
  });
  if (!doctor) throw new Error("Doctor not found.");

  const baseConsultFee = applySurgeToFee(
    getConsultFeeForType(doctor.consultFee, ConsultType.VIDEO),
    surge.multiplier
  );
  const healthPassPricing = await resolveHealthPassBookingPricing({
    patientId: args.patientId,
    consultFee: baseConsultFee,
    consultType: ConsultType.VIDEO,
  });
  const discountedConsultFee = healthPassPricing.consultFee;
  const healthPassDiscountINR = baseConsultFee - discountedConsultFee;
  const fee = calculateDoctorPayout(discountedConsultFee);
  const firstConsult = await isFirstConsultWithDoctor(args.patientId, args.doctorId);

  const booking = await prisma.booking.create({
    data: {
      patientId: args.patientId,
      doctorId: args.doctorId,
      scheduledAt: now,
      endsAt: addMinutes(now, CONSULTATION_SLOT_MINUTES),
      consultType: ConsultType.VIDEO,
      consultFee: discountedConsultFee,
      platformFeeINR: fee.platformFee,
      doctorPayoutINR: fee.doctorPayout,
      gstINR: fee.gstOnPlatformFee,
      totalPatientPays: fee.totalPatientPays,
      payStatus: PayStatus.PENDING,
      notes: args.concern?.trim() || "Instant consult request",
      consentgiven: true,
      consenttimestamp: now,
      isfirstconsult: firstConsult,
      isinstantconsult: true,
      healthpassapplied: healthPassPricing.healthPassApplied,
      healthpassdiscountinr: healthPassDiscountINR,
      surgemultiplier: surge.multiplier > 1 ? surge.multiplier : null,
    },
  });

  await prisma.consultationRoom.create({
    data: {
      bookingId: booking.id,
      twilioRoomName: `instant_${booking.id}`,
      status: "WAITING",
    },
  });

  return booking;
}

export async function matchQueueToDoctor(queueId: string, doctorId: string) {
  const queue = await prisma.bookingqueue.findUnique({
    where: { id: queueId },
    include: { patient: { select: { id: true, name: true } } },
  });
  if (!queue || queue.status !== Bookingqueuestatus.WAITING) {
    return null;
  }
  if (queue.expiresat.getTime() <= Date.now()) {
    await prisma.bookingqueue.update({
      where: { id: queueId },
      data: { status: Bookingqueuestatus.EXPIRED },
    });
    return null;
  }
  if (await isDoctorBusyNow(doctorId)) return null;

  const booking = await createInstantBooking({
    patientId: queue.patientid,
    doctorId,
    concern: queue.concern ?? undefined,
  });

  const updated = await prisma.bookingqueue.update({
    where: { id: queueId },
    data: {
      status: Bookingqueuestatus.MATCHED,
      doctorid: doctorId,
      bookingid: booking.id,
      matchedat: new Date(),
    },
  });

  return { queue: updated, booking };
}

async function pickInstantDoctor(specialtySlug: string) {
  const doctors = await listInstantDoctorsForSpecialty(specialtySlug);
  return doctors[0] ?? null;
}

export async function joinInstantConsultQueue(args: {
  patientId: string;
  specialtySlug: string;
  concern?: string;
}) {
  await expireStaleQueueEntries();

  const slug = resolveSpecialtySlug(args.specialtySlug);
  const existing = await prisma.bookingqueue.findFirst({
    where: {
      patientid: args.patientId,
      status: { in: [Bookingqueuestatus.WAITING, Bookingqueuestatus.MATCHED] },
      expiresat: { gt: new Date() },
    },
    orderBy: { queuedat: "desc" },
  });
  if (existing) {
    return getInstantConsultStatus(existing.id, args.patientId);
  }

  const expiresat = addMinutes(new Date(), INSTANT_QUEUE_TTL_MINUTES);
  const queue = await prisma.bookingqueue.create({
    data: {
      patientid: args.patientId,
      specialtyslug: slug,
      concern: args.concern?.trim() || null,
      expiresat,
    },
    include: { patient: { select: { name: true } } },
  });

  const doctor = await pickInstantDoctor(slug);
  if (doctor) {
    const matched = await matchQueueToDoctor(queue.id, doctor.id);
    if (matched) {
      return getInstantConsultStatus(queue.id, args.patientId);
    }
  }

  const onlineDoctors = await listInstantDoctorsForSpecialty(slug);
  for (const doctor of onlineDoctors) {
    await notifyDoctorInstantQueue({
      doctorId: doctor.id,
      queueId: queue.id,
      specialtySlug: slug,
      patientName: queue.patient.name,
    });
  }

  return getInstantConsultStatus(queue.id, args.patientId);
}

export async function getInstantConsultStatus(queueId: string, patientId?: string) {
  await expireStaleQueueEntries();

  const queue = await prisma.bookingqueue.findUnique({
    where: { id: queueId },
    include: {
      booking: {
        select: {
          id: true,
          payStatus: true,
          doctorId: true,
          totalPatientPays: true,
        },
      },
      doctor: { select: { displayName: true } },
    },
  });

  if (!queue) {
    return { ok: false as const, error: "Queue entry not found." };
  }
  if (patientId && queue.patientid !== patientId) {
    return { ok: false as const, error: "Forbidden." };
  }

  const estimatedWait = await estimateQueueWaitMinutes(queue.specialtyslug);

  return {
    ok: true as const,
    queueId: queue.id,
    status: queue.status,
    specialtySlug: queue.specialtyslug,
    estimatedWaitMinutes: estimatedWait,
    bookingId: queue.bookingid,
    doctorName: queue.doctor?.displayName ?? null,
    paymentRequired: queue.booking?.payStatus === PayStatus.PENDING,
    totalPatientPays: queue.booking?.totalPatientPays ?? null,
    waitingRoomUrl: queue.bookingid
      ? `/consultation/${queue.bookingid}/waiting`
      : null,
    matchedAt: queue.matchedat?.toISOString() ?? null,
    expiresAt: queue.expiresat.toISOString(),
  };
}

export async function cancelInstantConsultQueue(queueId: string, patientId: string) {
  const queue = await prisma.bookingqueue.findUnique({ where: { id: queueId } });
  if (!queue || queue.patientid !== patientId) {
    return { ok: false as const, error: "Queue entry not found." };
  }
  if (queue.status !== Bookingqueuestatus.WAITING) {
    return { ok: false as const, error: "Only waiting queues can be cancelled." };
  }

  await prisma.bookingqueue.update({
    where: { id: queueId },
    data: { status: Bookingqueuestatus.CANCELLED },
  });

  return { ok: true as const };
}

export async function processWaitingQueuesForDoctor(doctorId: string) {
  const doctor = await prisma.doctorProfile.findUnique({
    where: { id: doctorId },
    select: { specialty: true, acceptinstantconsult: true, instantonline: true },
  });
  if (!doctor?.acceptinstantconsult || !doctor.instantonline) return { matched: 0 };
  if (await isDoctorBusyNow(doctorId)) return { matched: 0 };

  const slug = resolveSpecialtySlug(doctor.specialty);
  let matched = 0;

  while (!(await isDoctorBusyNow(doctorId))) {
    const waiting = await prisma.bookingqueue.findFirst({
      where: {
        status: Bookingqueuestatus.WAITING,
        specialtyslug: slug,
        expiresat: { gt: new Date() },
      },
      orderBy: { queuedat: "asc" },
    });
    if (!waiting) break;
    const result = await matchQueueToDoctor(waiting.id, doctorId);
    if (!result) break;
    matched += 1;
  }

  return { matched };
}

export async function updateDoctorInstantConsultSettings(args: {
  doctorId: string;
  acceptInstantConsult?: boolean;
  instantOnline?: boolean;
}) {
  const updated = await prisma.doctorProfile.update({
    where: { id: args.doctorId },
    data: {
      ...(args.acceptInstantConsult !== undefined
        ? { acceptinstantconsult: args.acceptInstantConsult }
        : {}),
      ...(args.instantOnline !== undefined ? { instantonline: args.instantOnline } : {}),
    },
    select: {
      acceptinstantconsult: true,
      instantonline: true,
    },
  });

  if (updated.instantonline && updated.acceptinstantconsult) {
    await processWaitingQueuesForDoctor(args.doctorId);
  }

  return updated;
}
