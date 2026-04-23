import type { ReactElement, ReactNode } from "react";
import { render } from "@react-email/components";
import { ServerClient } from "postmark";
import { SubStatus } from "@prisma/client";
import { SubscriptionConfirmationEmail } from "@/emails/subscription-confirmation";
import { ApplicationApprovedEmail } from "@/emails/application-approved";
import { ApplicationRejectedEmail } from "@/emails/application-rejected";
import { RenewalReminderEmail } from "@/emails/renewal-reminder";
import { SubscriptionExpiredEmail } from "@/emails/subscription-expired";
import { BookingConfirmedEmail } from "@/emails/booking-confirmed";
import { PayoutProcessedEmail } from "@/emails/payout-processed";

const postmarkServerToken = process.env.POSTMARK_SERVER_TOKEN;
const from =
  process.env.POSTMARK_FROM_EMAIL ||
  process.env.RESEND_FROM_EMAIL ||
  "techDr Tele Health <no-reply@vitalconsult.health>";
const postmarkClient = postmarkServerToken
  ? new ServerClient(postmarkServerToken)
  : null;

async function safeSend(args: {
  to: string;
  subject: string;
  react: ReactNode;
}) {
  if (!postmarkClient) return;

  const html = await render(args.react as ReactElement);
  await postmarkClient.sendEmail({
    From: from,
    To: args.to,
    Subject: args.subject,
    HtmlBody: html,
  });
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

export async function sendBookingConfirmedEmail(
  to: string,
  details: { patientId: string; scheduledAt: Date; consultationType: string }
) {
  await safeSend({
    to,
    subject: "New consultation booked",
    react: <BookingConfirmedEmail {...details} />,
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

export function isSubscriptionActive(status: SubStatus) {
  return status === "ACTIVE";
}
