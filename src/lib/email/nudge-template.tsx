// AI-POWERED
import { Text, Link as EmailLink } from "@react-email/components";
import { EmailLayout } from "@/emails/_layout";

type HealthNudgeEmailProps = {
  patientName: string;
  subjectLine: string;
  message: string;
  healthTip: string;
  specialty?: string;
  rebookUrl: string;
};

export function HealthNudgeEmail({
  patientName,
  subjectLine,
  message,
  healthTip,
  specialty,
  rebookUrl,
}: HealthNudgeEmailProps) {
  return (
    <EmailLayout preview={subjectLine} title="Your health check-in from TechDrHealth">
      <Text>Hi {patientName},</Text>
      <Text>{message}</Text>
      {specialty ? (
        <Text>
          <strong>Recommended follow-up:</strong> {specialty}
        </Text>
      ) : null}
      <Text>
        <strong>Health tip:</strong> {healthTip}
      </Text>
      <Text>
        <EmailLink href={rebookUrl} style={{ color: "#059669", fontWeight: 700 }}>
          Book a follow-up consultation →
        </EmailLink>
      </Text>
      <Text style={{ color: "#64748b", fontSize: "13px" }}>
        This is a wellness reminder, not medical advice. For emergencies, call 112.
      </Text>
    </EmailLayout>
  );
}
