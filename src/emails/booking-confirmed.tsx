import { Text } from "@react-email/components";
import { EmailLayout } from "./_layout";

export function BookingConfirmedEmail({
  patientId,
  scheduledAt,
  consultationType,
}: {
  patientId: string;
  scheduledAt: Date;
  consultationType: string;
}) {
  return (
    <EmailLayout preview="A new consultation was booked." title="New Booking Confirmed">
      <Text>Patient ID: {patientId}</Text>
      <Text>Consultation Type: {consultationType}</Text>
      <Text>Scheduled At: {scheduledAt.toLocaleString("en-IN")}</Text>
      <Text>Please review details in your dashboard and prepare for the consultation.</Text>
    </EmailLayout>
  );
}
