import { Text } from "@react-email/components";
import { EmailLayout } from "./_layout";

type BookingStatusUpdateEmailProps = {
  audience: "doctor" | "patient";
  status: "CONFIRMED" | "CANCELLED" | "RESCHEDULED";
  doctorName: string;
  patientName: string;
  scheduledAt: string;
  reason?: string;
};

export function BookingStatusUpdateEmail({
  audience,
  status,
  doctorName,
  patientName,
  scheduledAt,
  reason,
}: BookingStatusUpdateEmailProps) {
  const isDoctor = audience === "doctor";
  const title =
    status === "CONFIRMED"
      ? "Booking confirmed"
      : status === "CANCELLED"
        ? "Booking cancelled"
        : "Booking rescheduled";

  return (
    <EmailLayout preview={`Consultation ${status.toLowerCase()}.`} title={title}>
      <Text>
        {isDoctor
          ? `Consultation with ${patientName} is ${status.toLowerCase()}.`
          : `Hi ${patientName}, your consultation with Dr. ${doctorName} is ${status.toLowerCase()}.`}
      </Text>
      <Text>
        <strong>Consultation type:</strong> Video consultation
      </Text>
      <Text>
        <strong>Schedule:</strong> {scheduledAt}
      </Text>
      {reason ? (
        <Text>
          <strong>Note:</strong> {reason}
        </Text>
      ) : null}
      <Text>
        {isDoctor
          ? "You can manage this booking from your dashboard."
          : "Please check your dashboard for latest updates and next steps."}
      </Text>
    </EmailLayout>
  );
}
