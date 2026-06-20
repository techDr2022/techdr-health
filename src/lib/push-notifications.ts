import admin from "firebase-admin";
import { prisma } from "@/lib/prisma";
import { removeDeviceToken } from "@/lib/device-token";

export type PushNotificationPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

let messaging: admin.messaging.Messaging | null | undefined;

function getMessaging() {
  if (messaging !== undefined) return messaging;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) {
    messaging = null;
    return null;
  }

  try {
    const credentials = JSON.parse(raw) as admin.ServiceAccount;
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(credentials),
      });
    }
    messaging = admin.messaging();
  } catch (error) {
    console.error("[push] Firebase init failed", error);
    messaging = null;
  }

  return messaging;
}

function isStaleTokenError(code: string | undefined) {
  return (
    code === "messaging/registration-token-not-registered" ||
    code === "messaging/invalid-registration-token"
  );
}

async function deliverPush(userId: string, payload: PushNotificationPayload) {
  const fcm = getMessaging();
  if (!fcm) return;

  const devices = await prisma.devicetoken.findMany({
    where: { userid: userId },
    select: { id: true, token: true },
  });
  if (!devices.length) return;

  await Promise.allSettled(
    devices.map(async (device) => {
      try {
        await fcm.send({
          token: device.token,
          notification: {
            title: payload.title,
            body: payload.body,
          },
          data: payload.data,
        });
      } catch (error) {
        const code =
          error && typeof error === "object" && "code" in error
            ? String((error as { code?: string }).code)
            : undefined;
        if (isStaleTokenError(code)) {
          await removeDeviceToken(device.token);
        }
        throw error;
      }
    })
  );
}

export function sendPushNotification(userId: string, payload: PushNotificationPayload) {
  void deliverPush(userId, payload).catch((error) => {
    console.error("[push] delivery failed", { userId, error });
  });
}

export function notifyBookingConfirmed(input: {
  patientUserId: string;
  doctorName: string;
  scheduledAt: Date;
  bookingId: string;
}) {
  sendPushNotification(input.patientUserId, {
    title: "Consultation confirmed",
    body: `Your consultation with Dr. ${input.doctorName} is confirmed for ${input.scheduledAt.toLocaleString("en-IN")}.`,
    data: {
      type: "booking_confirmed",
      bookingId: input.bookingId,
    },
  });
}

export function notifyConsultationReminder(input: {
  patientUserId: string;
  doctorName: string;
  bookingId: string;
  minutesUntil: number;
}) {
  sendPushNotification(input.patientUserId, {
    title: "Consultation starting soon",
    body: `Your consultation with Dr. ${input.doctorName} starts in ${input.minutesUntil} minutes.`,
    data: {
      type: "consultation_reminder",
      bookingId: input.bookingId,
    },
  });
}

export function notifyDoctorJoinedRoom(input: {
  patientUserId: string;
  doctorName: string;
  bookingId: string;
}) {
  sendPushNotification(input.patientUserId, {
    title: "Doctor is ready",
    body: `Dr. ${input.doctorName} has joined your consultation room.`,
    data: {
      type: "doctor_joined",
      bookingId: input.bookingId,
    },
  });
}

export function notifyPrescriptionReady(input: {
  patientUserId: string;
  doctorName: string;
  bookingId: string;
}) {
  sendPushNotification(input.patientUserId, {
    title: "Prescription ready",
    body: `Dr. ${input.doctorName} has shared your prescription.`,
    data: {
      type: "prescription_ready",
      bookingId: input.bookingId,
    },
  });
}
