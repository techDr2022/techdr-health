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
import { PaymentInvoiceEmail } from "@/emails/payment-invoice";
import { PrescriptionIssuedEmail } from "@/emails/prescription-issued";
import { WeeklyDoctorPayoutSummaryEmail } from "@/emails/weekly-doctor-payout-summary";
import { NewDoctorJoinAdminEmail } from "@/emails/new-doctor-join";
import { HealthNudgeEmail } from "@/lib/email/nudge-template";
import { ReferralMilestoneEmail } from "@/emails/referral-milestone";

const resendApiKey = process.env.RESEND_API_KEY;
const adminNotifyEmail =
  process.env.ADMIN_NOTIFY_EMAIL?.trim() || "techdrhealth@gmail.com";
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

export async function sendNewDoctorJoinAdminEmail(details: {
  entityName: string;
  email: string;
  phone: string;
  specialty: string;
  plan: string;
  isFreeListing: boolean;
  profileId: string;
}) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://techdrhealth.com").replace(
    /\/+$/,
    ""
  );
  const reviewUrl = `${siteUrl}/admin/applications/${details.profileId}`;

  return safeSend({
    to: adminNotifyEmail,
    subject: `New doctor joined: ${details.entityName}`,
    react: (
      <NewDoctorJoinAdminEmail
        entityName={details.entityName}
        email={details.email}
        phone={details.phone}
        specialty={details.specialty}
        plan={details.plan}
        isFreeListing={details.isFreeListing}
        reviewUrl={reviewUrl}
      />
    ),
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

export async function sendPaymentInvoiceEmail(
  to: string,
  details: {
    patientName: string;
    invoiceNumber: string;
    totalInr: number;
    downloadUrl: string;
  }
) {
  await safeSend({
    to,
    subject: `Tax invoice ${details.invoiceNumber}`,
    react: <PaymentInvoiceEmail {...details} />,
  });
}

export async function sendWeeklyDoctorPayoutSummaryEmail(
  to: string,
  details: {
    weekLabel: string;
    rows: Array<{
      doctorName: string;
      doctorEmail: string;
      consultations: number;
      amountINR: number;
      status?: string;
      reason?: string;
    }>;
    totalAmountINR: number;
    totalConsultations: number;
    processed?: number;
    failed?: number;
    skipped?: number;
    payoutsEnabled?: boolean;
  }
) {
  await safeSend({
    to,
    subject: `Weekly doctor payout summary - ${details.weekLabel}`,
    react: <WeeklyDoctorPayoutSummaryEmail {...details} />,
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
    labReportUrls?: string[];
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
    labReportUrls?: string[];
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

export async function sendOtpEmail(to: string, otp: string) {
  await safeSend({
    to,
    subject: "Your TechDrHealth login OTP",
    react: (
      <div style={{ fontFamily: "Arial, sans-serif", color: "#0f172a", lineHeight: 1.6 }}>
        <h2 style={{ marginBottom: "8px" }}>Your one-time password</h2>
        <p style={{ margin: "0 0 12px" }}>
          Use the OTP below to sign in to your TechDrHealth account:
        </p>
        <p style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "4px", margin: "0 0 12px" }}>{otp}</p>
        <p style={{ margin: "0 0 8px" }}>This OTP is valid for 10 minutes.</p>
        <p style={{ margin: 0, color: "#475569" }}>Do not share this code with anyone.</p>
      </div>
    ),
  });
}

export async function sendMagicLoginEmail(to: string, magicLink: string) {
  await safeSend({
    to,
    subject: "Your TechDrHealth magic sign-in link",
    react: (
      <div style={{ fontFamily: "Arial, sans-serif", color: "#0f172a", lineHeight: 1.6 }}>
        <h2 style={{ marginBottom: "8px" }}>Sign in to TechDrHealth</h2>
        <p style={{ margin: "0 0 12px" }}>
          Click the secure link below to sign in. This link is valid for 10 minutes.
        </p>
        <p style={{ margin: "0 0 12px" }}>
          <a href={magicLink} style={{ color: "#2563eb", fontWeight: 700 }}>
            Sign in securely
          </a>
        </p>
        <p style={{ margin: 0, color: "#475569" }}>If you did not request this, you can safely ignore this email.</p>
      </div>
    ),
  });
}

export async function sendPrescriptionIssuedEmail(
  to: string,
  details: {
    patientName: string;
    doctorName: string;
    specialty: string;
    consultationDate: string;
    diagnosis: string;
    medicines: Array<{
      name: string;
      dosage: string;
      duration: string;
      instructions?: string;
    }>;
    instructions?: string | null;
    followUpDate?: string | null;
    viewPrescriptionUrl: string;
    downloadPrescriptionUrl?: string;
  }
) {
  await safeSend({
    to,
    subject: "Your prescription from TechDrHealth",
    react: <PrescriptionIssuedEmail {...details} />,
  });
}

export async function sendHealthNudgeEmail(
  to: string,
  details: {
    patientName: string;
    subjectLine: string;
    message: string;
    healthTip: string;
    specialty?: string;
    rebookUrl: string;
  }
) {
  return safeSend({
    to,
    subject: details.subjectLine,
    react: <HealthNudgeEmail {...details} />,
  });
}

export async function sendDataDeletionRequestEmail(details: {
  userId: string;
  userName: string;
  userEmail: string;
  requestedAt: string;
}) {
  return safeSend({
    to: adminNotifyEmail,
    subject: `[DPDPA] Data deletion request — ${details.userName}`,
    react: (
      <div style={{ fontFamily: "sans-serif", lineHeight: 1.6, color: "#1e293b" }}>
        <h2 style={{ color: "#0f766e" }}>Data Deletion Request (DPDPA)</h2>
        <p>A patient has requested deletion of their personal data.</p>
        <ul>
          <li>
            <strong>User ID:</strong> {details.userId}
          </li>
          <li>
            <strong>Name:</strong> {details.userName}
          </li>
          <li>
            <strong>Email:</strong> {details.userEmail}
          </li>
          <li>
            <strong>Requested at:</strong> {details.requestedAt}
          </li>
        </ul>
        <p>Please process within 30 days as required under DPDPA 2023.</p>
      </div>
    ),
  });
}

export async function sendReferralMilestoneEmail(
  to: string,
  details: {
    entityName: string;
    milestone: number;
    rewardLabel: string;
  }
) {
  return safeSend({
    to,
    subject: `Referral milestone unlocked — ${details.rewardLabel}`,
    react: <ReferralMilestoneEmail {...details} />,
  });
}
