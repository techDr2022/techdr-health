import type { ReactElement, ReactNode } from "react";
import { render } from "@react-email/components";
import { Resend } from "resend";
import { SubStatus } from "@prisma/client";
import { SubscriptionConfirmationEmail } from "@/emails/subscription-confirmation";
import { ApplicationApprovedEmail } from "@/emails/application-approved";
import { ApplicationRejectedEmail } from "@/emails/application-rejected";
import { RenewalReminderEmail } from "@/emails/renewal-reminder";
import { SubscriptionExpiredEmail } from "@/emails/subscription-expired";
import { BookingAcknowledgementEmail } from "@/emails/booking-acknowledgement";
import { BookingStatusUpdateEmail } from "@/emails/booking-status-update";
import { PayoutProcessedEmail } from "@/emails/payout-processed";

const resendApiKey = process.env.RESEND_API_KEY;
const from =
  process.env.RESEND_FROM_EMAIL ||
  "techDr Tele Health <no-reply@vitalconsult.health>";
const fallbackFrom = process.env.RESEND_FALLBACK_FROM || "onboarding@resend.dev";
const resendClient = resendApiKey ? new Resend(resendApiKey) : null;

async function safeSend(args: {
  to: string;
  subject: string;
  react: ReactNode;
}) {
  if (!resendClient) {
    console.warn("email send skipped: RESEND_API_KEY is not configured");
    return false;
  }
  const html = await render(args.react as ReactElement);
  const primaryResult = await resendClient.emails.send({
    from,
    to: args.to,
    subject: args.subject,
    html,
  });
  if (!primaryResult.error) {
    return true;
  }

  const primaryMessage = String(primaryResult.error.message || "");
  const domainNotVerified = /domain is not verified/i.test(primaryMessage);
  if (!domainNotVerified || !fallbackFrom || fallbackFrom === from) {
    throw new Error(`Resend error: ${primaryMessage}`);
  }

  console.warn(`email send retry: using fallback sender ${fallbackFrom}`);
  const fallbackResult = await resendClient.emails.send({
    from: fallbackFrom,
    to: args.to,
    subject: args.subject,
    html,
  });
  if (fallbackResult.error) {
    throw new Error(`Resend error: ${fallbackResult.error.message}`);
  }

  return true;
}

export async function sendSubscriptionConfirmationEmail(to: string, entityName: string) {
  await safeSend({
    to,
    subject: "Subscription payment received",
    react: <SubscriptionConfirmationEmail entityName={entityName} />,
  });
}

export async function sendApprovalEmail(to: string, entityName: string) {
  await safeSend({
    to,
    subject: "Your application is approved",
    react: <ApplicationApprovedEmail entityName={entityName} />,
  });
}

export async function sendRejectionEmail(to: string, entityName: string, reason: string) {
  await safeSend({
    to,
    subject: "Application update",
    react: <ApplicationRejectedEmail entityName={entityName} reason={reason} />,
  });
}

export async function sendRenewalReminderEmail(to: string, expiresAt: Date, plan: string) {
  await safeSend({
    to,
    subject: "Subscription expires in 7 days",
    react: <RenewalReminderEmail expiresAt={expiresAt} plan={plan} />,
  });
}

export async function sendSubscriptionExpiredEmail(to: string, plan: string) {
  await safeSend({
    to,
    subject: "Subscription expired",
    react: <SubscriptionExpiredEmail plan={plan} />,
  });
}

export async function sendPayoutProcessedEmail(
  to: string,
  details: { amountINR: number; reference: string }
) {
  await safeSend({
    to,
    subject: "Payout processed",
    react: <PayoutProcessedEmail {...details} />,
  });
}

export async function sendBookingAcknowledgementToDoctorEmail(
  to: string,
  details: {
    doctorName: string;
    patientName: string;
    appointmentDate: string;
    timeSlot: string;
    patientEmail: string;
    patientWhatsApp: string;
    concern: string;
    calendarUrl?: string;
    manageBookingUrl?: string;
  }
) {
  return safeSend({
    to,
    subject: "New booking request received",
    react: <BookingAcknowledgementEmail audience="doctor" {...details} />,
  });
}

export async function sendBookingAcknowledgementToPatientEmail(
  to: string,
  details: {
    doctorName: string;
    patientName: string;
    appointmentDate: string;
    timeSlot: string;
    patientEmail: string;
    patientWhatsApp: string;
    concern: string;
    calendarUrl?: string;
    manageBookingUrl?: string;
  }
) {
  return safeSend({
    to,
    subject: "Your booking request is received",
    react: <BookingAcknowledgementEmail audience="patient" {...details} />,
  });
}

export function isSubscriptionActive(status: SubStatus) {
  return status === "ACTIVE";
}

export async function sendBookingStatusUpdateEmail(
  to: string,
  details: {
    audience: "doctor" | "patient";
    status: "CONFIRMED" | "CANCELLED" | "RESCHEDULED";
    doctorName: string;
    patientName: string;
    scheduledAt: string;
    reason?: string;
    joinUrl?: string;
  }
) {
  const subject =
    details.status === "CONFIRMED"
      ? "Consultation confirmed"
      : details.status === "CANCELLED"
        ? "Consultation cancelled"
        : "Consultation rescheduled";

  await safeSend({
    to,
    subject,
    react: <BookingStatusUpdateEmail {...details} />,
  });
}
