import { Text } from "@react-email/components";
import { EmailLayout } from "./_layout";

export function BookingConfirmedEmail({
  audience,
  doctorName,
  patientName,
  scheduledAt,
  joinUrl,
}: {
  audience: "doctor" | "patient";
  doctorName: string;
  patientName: string;
  scheduledAt: Date;
  joinUrl: string;
}) {
  const isDoctor = audience === "doctor";
  return (
    <EmailLayout preview="Your consultation is confirmed." title="Consultation Confirmed">
      <Text>
        {isDoctor
          ? `Consultation with ${patientName} is confirmed.`
          : `Hi ${patientName}, your consultation with Dr. ${doctorName} is confirmed.`}
      </Text>
      <Text>Consultation Type: Video consultation</Text>
      <Text>Scheduled At: {scheduledAt.toLocaleString("en-IN")}</Text>
      <Text>
        Join Link: <a href={joinUrl}>{joinUrl}</a>
      </Text>
      <Text>Please open the link at the scheduled time to join the consultation room.</Text>
    </EmailLayout>
  );
}
