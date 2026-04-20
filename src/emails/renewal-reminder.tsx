import { Text } from "@react-email/components";
import { EmailLayout } from "./_layout";

export function RenewalReminderEmail({
  expiresAt,
  plan,
}: {
  expiresAt: Date;
  plan: string;
}) {
  return (
    <EmailLayout preview="Your subscription expires in 7 days." title="Renewal Reminder">
      <Text>Your {plan} subscription expires on {expiresAt.toDateString()}.</Text>
      <Text>
        Renew now to avoid profile deactivation and continue receiving patient
        bookings without interruption.
      </Text>
    </EmailLayout>
  );
}
